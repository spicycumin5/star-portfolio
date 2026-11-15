import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DIVE_EVENT, SKY_CAMERA_EVENT } from '../hooks/useStarfield'
import { useSkyCamera } from '../hooks/useSkyCamera'
import { buildLayout } from './skyLayout'
import { CONSTELLATIONS, WORLD, HOME_CAMERA } from '../data/constellations'
import { sourceName } from '../data/site'
import styles from './ConstellationView.module.css'

// Essays live off-site, so the strip says where a click will take you
// instead of a generic "View".
function actionLabel(work) {
  if (work.category === 'writing' && work.link) {
    const source = sourceName(work.link)
    return source ? `Read on ${source} ↗` : 'Read ↗'
  }
  return 'View →'
}

const CATEGORY_COLORS = {
  music: 'var(--cat-music)',
  art: 'var(--cat-art)',
  video: 'var(--cat-video)',
  writing: 'var(--cat-writing)',
  code: 'var(--cat-code)',
}

function colorForCategory(category) {
  return CONSTELLATIONS[category]?.color || CATEGORY_COLORS[category] || 'var(--gold)'
}

// How long the click-to-dive zoom runs before the route changes.
const DIVE_MS = 700
// Matches .line's stroke-width (screen px) in ConstellationView.module.css.
const LINE_WIDTH_PX = 0.75
// Below this width the sky is small enough that drifting stars slide into
// each other's (already enlarged) tap targets, so parallax is off there.
// Same cutoff Home uses to default to the log view on small screens.
const NARROW_MAX_WIDTH = 700
// The camera shows this many sky units across at zoom 1 (landscape).
const BASE_VIEW = 160
// Edge markers stay this far inside the frame: clear of the HUD at the
// top, the hover strip at the bottom, and the window edges at the sides.
const MARKER_INSET = { top: 128, right: 28, bottom: 104, left: 28 }
// ...and never closer than this to the window's actual edge.
const MARKER_EDGE = 12
// Focusing a star that's off-screen flies the camera to it; "on-screen"
// means at least this many px inside the frame.
const FOCUS_INSET_PX = 40

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ConstellationView({ works, activeFilter }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [burstingId, setBurstingId] = useState(null)
  const [diveOrigin, setDiveOrigin] = useState(null)
  const [narrow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < NARROW_MAX_WIDTH
  )
  const [reducedMotion] = useState(prefersReducedMotion)
  const [hintHidden, setHintHidden] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem('skyHintSeen'))
    } catch {
      return false
    }
  })

  const layout = useMemo(
    () => buildLayout(works, CONSTELLATIONS, { narrow }),
    [works, narrow]
  )
  const { stars, ghosts, lines, labels, anchors, field, revealDuration } = layout

  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const vignetteRef = useRef(null)
  const lineRefs = useRef([])
  const markerRefs = useRef([])
  const chevronRefs = useRef([])
  const markerSizes = useRef([])
  // Line width in viewBox units for the reveal trace — see the line JSX.
  const revealStrokeRef = useRef(0)

  // 'pending' (hidden, waiting to scroll into view) → 'revealing' → 'done'
  const [reveal, setReveal] = useState(() => {
    if (prefersReducedMotion()) return 'done'
    try {
      return sessionStorage.getItem('skyRevealed') ? 'done' : 'pending'
    } catch {
      return 'done'
    }
  })

  // ── Camera ──
  // Every frame the camera moves, write the new window onto the world:
  // the svg's viewBox (the layout stays in literal world coordinates),
  // the --cam-x/--cam-y variables the parallax CSS reads, each line's
  // endpoints (SVG lines have no CSS-settable geometry), the edge markers
  // pointing at whatever's off-screen, and a nudge to the background
  // starfield so it drifts along as the deepest layer.
  const onFrame = useCallback(
    (cam, view) => {
      const svg = svgRef.current
      const container = containerRef.current
      if (!svg || !container) return
      const { vw, vh, scale, cw, ch, docked, dockProgress } = view

      svg.setAttribute('viewBox', `${cam.x - vw / 2} ${cam.y - vh / 2} ${vw} ${vh}`)
      svg.style.setProperty('--cam-x', cam.x)
      svg.style.setProperty('--cam-y', cam.y)

      for (let i = 0; i < lines.length; i++) {
        const el = lineRefs.current[i]
        if (!el) continue
        const { from, to } = lines[i]
        const fd = from.depth ?? 0
        const td = to.depth ?? 0
        el.setAttribute('x1', from.x + (from.x - cam.x) * fd)
        el.setAttribute('y1', from.y + (from.y - cam.y) * fd)
        el.setAttribute('x2', to.x + (to.x - cam.x) * td)
        el.setAttribute('y2', to.y + (to.y - cam.y) * td)
      }

      // Edge markers: where the ray from the frame's center toward each
      // constellation leaves the (inset) frame.
      const left = MARKER_INSET.left
      const top = MARKER_INSET.top
      const right = cw - MARKER_INSET.right
      const bottom = ch - MARKER_INSET.bottom
      const rcx = (left + right) / 2
      const rcy = (top + bottom) / 2
      const hx = (right - left) / 2
      const hy = (bottom - top) / 2
      for (let i = 0; i < labels.length; i++) {
        const el = markerRefs.current[i]
        if (!el) continue
        const label = labels[i]
        const px = (label.x - cam.x) * scale + cw / 2
        const py = (label.y - cam.y) * scale + ch / 2
        const inside = px >= left && px <= right && py >= top && py <= bottom
        if (inside || hx <= 0 || hy <= 0) {
          el.classList.add(styles.markerHidden)
          continue
        }
        el.classList.remove(styles.markerHidden)
        const dx = px - rcx
        const dy = py - rcy
        const t = Math.min(hx / Math.max(Math.abs(dx), 1e-6), hy / Math.max(Math.abs(dy), 1e-6))
        // Keep the whole label inside the frame (its size is static, so
        // measure it once rather than forcing layout every frame).
        let size = markerSizes.current[i]
        if (!size) size = markerSizes.current[i] = { w: el.offsetWidth, h: el.offsetHeight }
        const mx = Math.min(Math.max(rcx + dx * t, MARKER_EDGE + size.w / 2), cw - MARKER_EDGE - size.w / 2)
        const my = Math.min(Math.max(rcy + dy * t, top), ch - MARKER_EDGE - size.h / 2)
        el.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
        const chevron = chevronRefs.current[i]
        if (chevron) chevron.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`
      }

      container.classList.toggle(styles.docked, docked)
      if (vignetteRef.current) vignetteRef.current.style.opacity = dockProgress

      window.dispatchEvent(
        new CustomEvent(SKY_CAMERA_EVENT, {
          detail: { x: (cam.x - HOME_CAMERA.x) * scale, y: (cam.y - HOME_CAMERA.y) * scale },
        })
      )
    },
    [lines, labels]
  )

  const camera = useSkyCamera({
    containerRef,
    world: WORLD,
    initial: HOME_CAMERA,
    baseView: BASE_VIEW,
    reducedMotion,
    onFrame,
  })

  // The background field should settle back to rest once the sky is gone.
  useEffect(
    () => () =>
      window.dispatchEvent(new CustomEvent(SKY_CAMERA_EVENT, { detail: { x: 0, y: 0 } })),
    []
  )

  // First interaction retires the "drag to wander" hint for the session.
  useEffect(() => {
    if (hintHidden) return undefined
    return camera.onInteract(() => {
      setHintHidden(true)
      try {
        sessionStorage.setItem('skyHintSeen', '1')
      } catch {
        // Then it just shows again next visit.
      }
    })
  }, [camera, hintHidden])

  // Choosing a constellation in the HUD flies the camera to it; "All"
  // returns home. Not on mount: the camera has its own idea of where to
  // start (wherever the visitor left it).
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const target = activeFilter === 'all' ? HOME_CAMERA : anchors[activeFilter]
    if (target) camera.flyTo(target)
  }, [activeFilter, anchors, camera])

  // ── Reveal ──
  useEffect(() => {
    if (reveal !== 'pending') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        revealStrokeRef.current = LINE_WIDTH_PX / camera.view().scale
        setReveal('revealing')
      },
      { threshold: 0.3 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [reveal, camera])

  useEffect(() => {
    if (reveal !== 'revealing') return undefined
    try {
      sessionStorage.setItem('skyRevealed', '1')
    } catch {
      // Without storage the reveal just replays next time — harmless.
    }
    const id = setTimeout(() => setReveal('done'), revealDuration * 1000)
    return () => clearTimeout(id)
  }, [reveal, revealDuration])

  // Home fades its hero/HUD while a dive is underway (see Home.module.css);
  // make sure that flag never outlives this view.
  useEffect(() => () => delete document.documentElement.dataset.diving, [])

  const hoveredCategory = hovered?.work.category ?? null

  const isDimmed = (category) => activeFilter !== 'all' && category !== activeFilter
  const isHighlighted = (category) => activeFilter !== 'all' && category === activeFilter

  // On touch devices there's no hover preview, so a tap selects (shows the
  // strip) instead of navigating immediately — a second tap, or the strip's
  // "View" button, confirms. Mouse clicks (which already had a hover
  // preview) and keyboard Enter (which already had a focus preview)
  // navigate right away.
  function handleSelect(star, viaButton = false) {
    const { work } = star
    if (burstingId) return
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!hasHover && !viaButton && selectedId !== work.id) {
      setSelectedId(work.id)
      setHovered(star)
      return
    }
    if (work.category === 'writing' && work.link) {
      window.open(work.link, '_blank', 'noreferrer')
      return
    }
    setBurstingId(work.id)
    if (reducedMotion) {
      navigate(`/work/${work.id}`)
      return
    }

    // Dive: zoom the sky in on the clicked star (where the camera has it
    // right now) while the background starfield warps toward the same
    // screen point, then hand off to the work page (whose arrival burst
    // the starfield already plays).
    const origin = camera.project(star.x, star.y, star.depth)
    camera.freeze()
    setDiveOrigin(origin)
    document.documentElement.dataset.diving = ''
    const rect = containerRef.current.getBoundingClientRect()
    window.dispatchEvent(
      new CustomEvent(DIVE_EVENT, {
        detail: { x: rect.left + origin.x, y: rect.top + origin.y, duration: DIVE_MS },
      })
    )
    setTimeout(() => navigate(`/work/${work.id}`), DIVE_MS)
  }

  function handleStarClick(star) {
    // A drag that happens to end on a star is not a click on it.
    if (camera.consumeDragged()) return
    handleSelect(star)
  }

  function handleStarFocus(star) {
    setHovered(star)
    if (!camera.isInView(star.x, star.y, star.depth, FOCUS_INSET_PX)) {
      camera.flyTo({ x: star.x, y: star.y }, 600)
    }
  }

  const revealClass =
    reveal === 'pending' ? styles.revealPending : reveal === 'revealing' ? styles.revealing : ''

  const initialViewBox = `${HOME_CAMERA.x - BASE_VIEW / 2} ${HOME_CAMERA.y - (BASE_VIEW * 9) / 32} ${BASE_VIEW} ${(BASE_VIEW * 9) / 16}`

  return (
    <div
      className={`${styles.sky} ${diveOrigin ? styles.skyDiving : ''}`}
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Sky chart. Drag or use the arrow keys to pan."
    >
      <svg
        ref={svgRef}
        viewBox={initialViewBox}
        preserveAspectRatio="none"
        className={`${styles.svg} ${revealClass} ${diveOrigin ? styles.diving : ''}`}
        style={{
          '--cam0-x': HOME_CAMERA.x,
          '--cam0-y': HOME_CAMERA.y,
          ...(diveOrigin ? { transformOrigin: `${diveOrigin.x}px ${diveOrigin.y}px` } : null),
        }}
      >
        {/* Deep field: decorative dust at two distances behind the chart. */}
        {field.map((layer) => (
          <g key={layer.follow} className={styles.field} style={{ '--follow': layer.follow }}>
            {layer.paths.map((p) => (
              <path
                key={p.width}
                d={p.d}
                className={styles.fieldDots}
                style={{ strokeWidth: p.width, strokeOpacity: p.opacity }}
              />
            ))}
          </g>
        ))}

        <g>
          {lines.map(({ key, from, to, category, revealDelay }, i) => (
            <line
              key={key}
              ref={(el) => (lineRefs.current[i] = el)}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              // The reveal traces each line with pathLength="1" dashes,
              // which non-scaling-stroke would measure in screen px
              // instead. So while revealing, the stroke goes back to
              // viewBox units, with a width converted to match.
              pathLength={reveal === 'revealing' ? 1 : undefined}
              vectorEffect={reveal === 'revealing' ? undefined : 'non-scaling-stroke'}
              style={{
                '--cat-color': colorForCategory(category),
                '--reveal-delay': `${revealDelay}s`,
                strokeWidth: reveal === 'revealing' ? revealStrokeRef.current : undefined,
              }}
              className={`${styles.line} ${isDimmed(category) ? styles.dimmed : ''} ${
                isHighlighted(category) ? styles.lineHighlighted : ''
              } ${hoveredCategory === category ? styles.lineActive : ''}`}
            />
          ))}
        </g>

        {labels.map((label) => (
          <g
            key={label.category}
            className={styles.depth}
            style={{ '--sx': label.x, '--sy': label.y, '--depth': label.depth }}
          >
            <text
              x={label.x}
              y={label.y}
              style={{
                '--cat-color': colorForCategory(label.category),
                '--reveal-delay': `${label.revealDelay}s`,
              }}
              className={`${styles.clusterLabel} ${
                isDimmed(label.category) ? styles.dimmed : ''
              } ${isHighlighted(label.category) ? styles.clusterLabelActive : ''} ${
                hoveredCategory === label.category ? styles.clusterLabelHover : ''
              }`}
            >
              {label.text}
            </text>
            {label.name && (
              <text
                x={label.x}
                y={label.y + 3.4}
                style={{ '--reveal-delay': `${label.revealDelay + 0.3}s` }}
                className={`${styles.clusterName} ${
                  isDimmed(label.category) ? styles.dimmed : ''
                } ${
                  isHighlighted(label.category) || hoveredCategory === label.category
                    ? styles.clusterNameActive
                    : ''
                }`}
              >
                {label.name}
              </text>
            )}
          </g>
        ))}

        {ghosts.map((ghost) => (
          <circle
            key={ghost.key}
            cx={ghost.x}
            cy={ghost.y}
            r={0.45}
            style={{ '--reveal-delay': `${ghost.revealDelay}s` }}
            className={`${styles.ghost} ${isDimmed(ghost.category) ? styles.dimmed : ''}`}
          />
        ))}

        {stars.map((star) => {
          const { work, x, y, size, accent, twinkleDur, twinkleDelay, revealDelay, depth, kind } = star
          return (
            <g
              key={work.id}
              className={styles.depth}
              style={{ '--sx': x, '--sy': y, '--depth': depth }}
            >
              <g
                className={`${styles.starGroup} ${kind === 'outlier' ? styles.outlier : ''} ${
                  isDimmed(work.category) ? styles.dimmed : ''
                } ${burstingId === work.id ? styles.bursting : ''}`}
                transform={`translate(${x} ${y})`}
                style={{
                  '--cat-color': colorForCategory(work.category),
                  '--reveal-delay': `${revealDelay}s`,
                }}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => handleStarFocus(star)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={
                  work.category === 'writing' && work.link
                    ? `Read ${work.title} (opens in a new tab)`
                    : `View ${work.title}`
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(star, true)}
              >
                <circle r={7} className={styles.hitArea} />
                <circle r={3.2} className={styles.glow} />
                <circle
                  r={size}
                  className={`${styles.star} ${accent ? styles.starAccent : ''}`}
                  style={{
                    '--twinkle-dur': `${twinkleDur}s`,
                    '--twinkle-delay': `${twinkleDelay}s`,
                  }}
                />
                <path
                  d="M2.6,0 L0.65,0.65 L0,2.6 L-0.65,0.65 L-2.6,0 L-0.65,-0.65 L0,-2.6 L0.65,-0.65 Z"
                  className={styles.starShape}
                />
              </g>
            </g>
          )
        })}
      </svg>

      {/* Fades the frame's edges once the sky fills the viewport, so the
          screen reads as a window rather than a bordered chart. */}
      <div className={styles.vignette} ref={vignetteRef} aria-hidden="true" />

      {/* Edge markers: one per constellation, shown only while it's
          off-screen, sitting on the frame edge in its direction. */}
      {labels.map((label, i) => (
        <button
          key={label.category}
          type="button"
          ref={(el) => (markerRefs.current[i] = el)}
          className={`${styles.marker} ${styles.markerHidden} ${
            isDimmed(label.category) ? styles.markerDimmed : ''
          }`}
          style={{ '--cat-color': colorForCategory(label.category) }}
          onClick={() => camera.flyTo(anchors[label.category])}
          aria-label={`Fly to ${label.text}`}
        >
          <svg
            viewBox="0 0 10 10"
            className={styles.chevron}
            ref={(el) => (chevronRefs.current[i] = el)}
            aria-hidden="true"
          >
            <path d="M3 1.5 L7.5 5 L3 8.5" />
          </svg>
          <span>{label.text}</span>
        </button>
      ))}

      <p className={`${styles.hint} ${hintHidden ? styles.hintHidden : ''}`} aria-hidden="true">
        Drag to wander the sky
      </p>

      <div className={`${styles.strip} ${hovered ? styles.stripVisible : ''}`}>
        <span className={styles.stripCategory}>✦ {hovered?.work.category ?? ''}</span>
        <span className={styles.stripTitle}>{hovered?.work.title ?? ''}</span>
        {hovered?.work.desc && <span className={styles.stripDesc}>{hovered.work.desc}</span>}
        {hovered && (
          <button
            type="button"
            className={styles.stripView}
            onClick={() => handleSelect(hovered, true)}
          >
            {actionLabel(hovered.work)}
          </button>
        )}
      </div>
    </div>
  )
}
