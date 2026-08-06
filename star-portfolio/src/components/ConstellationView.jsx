import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ConstellationView.module.css'

const KNOWN_CATEGORY_ANCHORS = {
  music: { x: 35, y: 30 },
  video: { x: 115, y: 22 },
  art: { x: 80, y: 65 },
  writing: { x: 128, y: 70 },
  code: { x: 45, y: 78 },
}

const CATEGORY_COLORS = {
  music: 'var(--cat-music)',
  art: 'var(--cat-art)',
  video: 'var(--cat-video)',
  writing: 'var(--cat-writing)',
  code: 'var(--cat-code)',
}

function colorForCategory(category) {
  return CATEGORY_COLORS[category] || 'var(--gold)'
}

const VIEW_CENTER = { x: 80, y: 50 }
const EXTRA_RADIUS = { x: 50, y: 32 }
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180)
// Desktop has real room now (see Home's .galleryWide) — push category
// clusters further from center and let stars within a cluster spread a
// little wider too, instead of reusing the same cramped mobile spacing.
const WIDE_MIN_WIDTH = 1100
const WIDE_CLUSTER_SPREAD = 1.3
const WIDE_STAR_SPREAD = 1.2
// Minimum center-to-center distance (viewBox units) between any two
// stars. The golden-angle spiral spaces stars out fine on its own until
// a cluster has enough pieces (or clamping near the canvas edge) to fold
// back on itself — this pass nudges any pair that ends up too close
// apart afterwards, so two pieces never render on top of each other.
const MIN_STAR_DIST = 6
// Cluster labels ("music", "writing", ...) sit this far above their
// anchor. Shared with the JSX below so the collision math always agrees
// with where the label actually renders.
const LABEL_OFFSET_Y = -11
// Padded past the raw text box to also clear a star's own rendered
// radius (up to ~1.9 units) plus a little breathing room, not just its
// center point.
const LABEL_MARGIN = 3.2
const LABEL_HALF_HEIGHT = 4.4

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Golden-angle spirals periodically sweep back past "straight up" from
// the anchor — exactly where the cluster label sits — so a star from a
// larger cluster (or one nudged there by the star-star pass below) can
// end up rendering right through the label text. Treat each label as a
// rectangular keep-out zone sized to roughly its text width and push any
// star that lands inside back out along the shorter axis.
function labelBoxes(anchors) {
  return Object.entries(anchors).map(([category, anchor]) => ({
    x: anchor.x,
    y: anchor.y + LABEL_OFFSET_Y,
    halfW: category.length * 1.15 + LABEL_MARGIN,
    halfH: LABEL_HALF_HEIGHT,
  }))
}

function pushOutOfLabel(star, box) {
  const dx = star.x - box.x
  const dy = star.y - box.y
  const overlapX = box.halfW - Math.abs(dx)
  const overlapY = box.halfH - Math.abs(dy)
  if (overlapX <= 0 || overlapY <= 0) return false
  if (overlapX < overlapY) {
    star.x = clamp(star.x + (dx >= 0 ? overlapX : -overlapX), 6, 154)
  } else {
    star.y = clamp(star.y + (dy >= 0 ? overlapY : -overlapY), 4, 96)
  }
  return true
}

function resolveLayout(stars, anchors) {
  const boxes = labelBoxes(anchors)
  for (let pass = 0; pass < 10; pass++) {
    let moved = false
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i]
        const b = stars[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        if (dist < MIN_STAR_DIST) {
          const push = (MIN_STAR_DIST - dist) / 2
          // Stars land exactly on top of each other only in a degenerate
          // case (dist === 0) — nudge along a fixed axis so they still
          // separate instead of dividing by zero.
          const ux = dist > 0.001 ? dx / dist : 1
          const uy = dist > 0.001 ? dy / dist : 0
          a.x = clamp(a.x - ux * push, 6, 154)
          a.y = clamp(a.y - uy * push, 4, 96)
          b.x = clamp(b.x + ux * push, 6, 154)
          b.y = clamp(b.y + uy * push, 4, 96)
          moved = true
        }
      }
    }
    stars.forEach((star) => {
      boxes.forEach((box) => {
        if (pushOutOfLabel(star, box)) moved = true
      })
    })
    if (!moved) break
  }
}

function buildLayout(works, wide) {
  const clusterSpread = wide ? WIDE_CLUSTER_SPREAD : 1
  const starSpread = wide ? WIDE_STAR_SPREAD : 1

  const byCategory = {}
  works.forEach((work) => {
    if (!byCategory[work.category]) byCategory[work.category] = []
    byCategory[work.category].push(work)
  })

  let extraIndex = 0
  function anchorFor(category) {
    const known = KNOWN_CATEGORY_ANCHORS[category]
    if (known) {
      return {
        x: clamp(VIEW_CENTER.x + (known.x - VIEW_CENTER.x) * clusterSpread, 16, 144),
        y: clamp(VIEW_CENTER.y + (known.y - VIEW_CENTER.y) * clusterSpread, 14, 86),
      }
    }
    const angle = extraIndex * GOLDEN_ANGLE
    extraIndex += 1
    return {
      x: clamp(VIEW_CENTER.x + Math.cos(angle) * EXTRA_RADIUS.x * clusterSpread, 15, 145),
      y: clamp(VIEW_CENTER.y + Math.sin(angle) * EXTRA_RADIUS.y * clusterSpread, 12, 88),
    }
  }

  // Pre-compute every known cluster's anchor (even categories with zero
  // works right now) so the label layer always has a spread-adjusted
  // position to render at, matching wherever its stars actually land.
  const anchors = {}
  Object.keys(KNOWN_CATEGORY_ANCHORS).forEach((category) => {
    anchors[category] = anchorFor(category)
  })

  const stars = []
  const lines = []

  Object.entries(byCategory).forEach(([category, items]) => {
    const anchor = anchors[category] || anchorFor(category)

    const catStars = items.map((work, i) => {
      const angle = i * GOLDEN_ANGLE
      const radius = (4 + i * 3.2) * starSpread
      const x = clamp(anchor.x + Math.cos(angle) * radius, 6, 154)
      const y = clamp(anchor.y + Math.sin(angle) * radius, 4, 96)
      const size = 1 + ((work.id * 7) % 5) * 0.22
      const accent = work.id % 5 === 2
      const twinkleDur = 2.2 + (work.id % 4) * 0.7
      const twinkleDelay = (work.id * 0.53) % 3
      return { work, x, y, size, accent, twinkleDur, twinkleDelay }
    })

    stars.push(...catStars)

    const addedPairs = new Set()
    catStars.forEach((star, i) => {
      catStars
        .map((other, j) => ({ j, dist: Math.hypot(star.x - other.x, star.y - other.y) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = `${Math.min(i, j)}-${Math.max(i, j)}`
          if (!addedPairs.has(key)) {
            addedPairs.add(key)
            lines.push({ from: catStars[i], to: catStars[j], category })
          }
        })
    })
  })

  // Runs last, across every category at once (not just within one
  // cluster) — lines/labels reference these same star objects, so
  // nudging positions here keeps everything else in sync automatically.
  resolveLayout(stars, anchors)

  return { stars, lines, anchors }
}

export default function ConstellationView({ works, activeFilter }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [burstingId, setBurstingId] = useState(null)
  const [wide] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= WIDE_MIN_WIDTH
  )

  const { stars, lines, anchors } = useMemo(() => buildLayout(works, wide), [works, wide])

  const hoveredCategory = hovered?.work.category ?? null

  const isDimmed = (category) =>
    activeFilter !== 'all' && category !== activeFilter

  const isHighlighted = (category) =>
    activeFilter !== 'all' && category === activeFilter

  // On touch devices there's no hover preview, so a tap selects (shows the
  // strip) instead of navigating immediately — a second tap, or the strip's
  // "View" button, confirms. Mouse clicks (which already had a hover
  // preview) and keyboard Enter (which already had a focus preview)
  // navigate right away.
  function handleSelect(work, x, y, viaButton = false) {
    if (burstingId) return
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!hasHover && !viaButton && selectedId !== work.id) {
      setSelectedId(work.id)
      setHovered({ work, x, y })
      return
    }
    if (work.category === 'writing' && work.link) {
      window.open(work.link, '_blank', 'noreferrer')
      return
    }
    setBurstingId(work.id)
    setTimeout(() => navigate(`/work/${work.id}`), 240)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.svgContainer}>
        <svg
          viewBox="0 0 160 100"
          preserveAspectRatio="xMidYMid meet"
          className={styles.svg}
        >
          <g>
            {lines.map(({ from, to, category }) => (
              <line
                key={`${from.work.id}-${to.work.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                vectorEffect="non-scaling-stroke"
                style={{ '--cat-color': colorForCategory(category) }}
                className={`${styles.line} ${isDimmed(category) ? styles.dimmed : ''} ${
                  isHighlighted(category) ? styles.lineHighlighted : ''
                } ${hoveredCategory === category ? styles.lineActive : ''}`}
              />
            ))}
          </g>

          {Object.entries(anchors).map(([cat, anchor]) => (
            <text
              key={cat}
              x={anchor.x}
              y={anchor.y + LABEL_OFFSET_Y}
              style={{ '--cat-color': colorForCategory(cat) }}
              className={`${styles.clusterLabel} ${
                isDimmed(cat) ? styles.dimmed : ''
              } ${isHighlighted(cat) ? styles.clusterLabelActive : ''}`}
            >
              {cat}
            </text>
          ))}

          {stars.map(({ work, x, y, size, accent, twinkleDur, twinkleDelay }) => (
            <g
              key={work.id}
              className={`${styles.starGroup} ${isDimmed(work.category) ? styles.dimmed : ''} ${
                burstingId === work.id ? styles.bursting : ''
              }`}
              transform={`translate(${x} ${y})`}
              style={{ '--cat-color': colorForCategory(work.category) }}
              onClick={() => handleSelect(work, x, y)}
              onMouseEnter={() => setHovered({ work, x, y })}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered({ work, x, y })}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              role="button"
              aria-label={`View ${work.title}`}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(work, x, y, true)}
            >
              <circle r={7} className={styles.hitArea} />
              <circle r={4.5} className={styles.glow} />
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
          ))}
        </svg>

        <div className={`${styles.strip} ${hovered ? styles.stripVisible : ''}`}>
          <span className={styles.stripCategory}>
            ✦ {hovered?.work.category ?? ''}
          </span>
          <span className={styles.stripTitle}>{hovered?.work.title ?? ''}</span>
          {hovered?.work.desc && (
            <span className={styles.stripDesc}>{hovered.work.desc}</span>
          )}
          {hovered && (
            <button
              type="button"
              className={styles.stripView}
              onClick={() => handleSelect(hovered.work, hovered.x, hovered.y, true)}
            >
              View →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
