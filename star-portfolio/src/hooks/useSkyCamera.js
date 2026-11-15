import { useEffect, useMemo, useRef } from 'react'

// A 2D camera over the constellation world. The screen is a window of
// `baseView` sky units across (at zoom 1) onto a world much larger than
// that; the visitor pans it by dragging, wheeling, swiping or with the
// arrow keys, and it drifts slowly on its own when left alone.
//
// Everything lives in refs and runs in one requestAnimationFrame loop —
// nothing here touches React state, so panning never re-renders the
// component. The owner gets `onFrame(cam, view)` whenever something
// changed and writes the DOM itself.

const KEY_SPEED = 0.18 // sky units per ms while an arrow key is held
const KEY_STEP = 24 // units per press under reduced motion
const INERTIA_TAU = 350 // ms; velocity decays by e every tau
const INERTIA_STOP = 0.002 // units/ms below which inertia ends
const SPRING_TAU = 120 // ms; rubber-band return to bounds
const DRAG_SOFTNESS = 0.35 // how far past a bound a drag can stretch
const DRAG_THRESHOLD = 4 // px before a press counts as a drag
const WHEEL_TAU = 140 // ms; wheel panning eases toward its target by this
const IDLE_AFTER = 4000 // ms without input before the sky starts to drift
const IDLE_RAMP = 2000 // ms to reach full drift speed
const IDLE_SPEED = 0.0005 // units/ms
const PERSIST_DEBOUNCE = 300
const STORAGE_KEY = 'skyCamera'

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function normalizeWheel(e, ch) {
  // deltaMode 1 = lines, 2 = pages; convert both to px.
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? ch : 1
  return { dx: e.deltaX * unit, dy: e.deltaY * unit }
}

export function useSkyCamera({
  containerRef,
  world,
  initial,
  baseView = 160,
  zoomRange = [0.75, 1.6],
  reducedMotion = false,
  onFrame,
}) {
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame

  const stateRef = useRef(null)
  if (!stateRef.current) {
    stateRef.current = {
      cam: { x: initial.x, y: initial.y, zoom: initial.zoom ?? 1 },
      vel: { x: 0, y: 0 },
      view: { cw: 1, ch: 1, vw: baseView, vh: baseView, scale: 1, docked: false, dockProgress: 0 },
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      dirty: true,
      frame: null,
      running: false,
      lastTick: 0,
      frozen: false,
      drag: {
        active: false,
        pointerId: null,
        lastX: 0,
        lastY: 0,
        lastT: 0,
        totalX: 0,
        totalY: 0,
        raw: { x: 0, y: 0 },
        moved: false,
        dragged: false,
        type: 'mouse',
      },
      keys: new Set(),
      lastInteract: 0,
      driftAngle: 0,
      wheelTarget: null,
      fly: null,
      interacted: false,
      interactCbs: [],
      persistTimer: null,
    }
  }

  const camera = useMemo(() => {
    const s = stateRef.current

    function markDirty() {
      s.dirty = true
      if (!s.running) start()
    }

    function updateBounds() {
      const { vw, vh } = s.view
      let minX = vw / 2
      let maxX = world.w - vw / 2
      let minY = vh / 2
      let maxY = world.h - vh / 2
      // If the view is bigger than the world, pin the camera on the center.
      if (minX > maxX) minX = maxX = world.w / 2
      if (minY > maxY) minY = maxY = world.h / 2
      s.bounds = { minX, maxX, minY, maxY }
    }

    function updateView() {
      const el = containerRef.current
      if (!el) return
      const cw = el.clientWidth || 1
      const ch = el.clientHeight || 1
      const long = baseView / s.cam.zoom
      // Landscape shows `long` units across; portrait shows `long` units tall.
      const vw = cw >= ch ? long : (long * cw) / ch
      const vh = (vw * ch) / cw
      s.view.cw = cw
      s.view.ch = ch
      s.view.vw = vw
      s.view.vh = vh
      s.view.scale = cw / vw
      updateBounds()
    }

    // "Docked" = the sky is fully scrolled in, i.e. its bottom edge sits at
    // the bottom of the viewport. (Not "top at 0": on phones the sky is
    // 100svh tall and the viewport grows past that when the browser's bars
    // hide, so its top can sit below 0 while it's still fully in view.)
    function updateDock() {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const ch = s.view.ch
      s.view.docked = rect.bottom <= window.innerHeight + 2
      s.view.dockProgress = clamp(1 - rect.top / ch, 0, 1)
    }

    function clampCam() {
      const { minX, maxX, minY, maxY } = s.bounds
      s.cam.x = clamp(s.cam.x, minX, maxX)
      s.cam.y = clamp(s.cam.y, minY, maxY)
    }

    function soft(value, min, max) {
      if (value < min) return min + (value - min) * DRAG_SOFTNESS
      if (value > max) return max + (value - max) * DRAG_SOFTNESS
      return value
    }

    function persistLater() {
      clearTimeout(s.persistTimer)
      s.persistTimer = setTimeout(() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s.cam))
        } catch {
          // Without storage the camera just starts at home next time.
        }
      }, PERSIST_DEBOUNCE)
    }

    function noteInteraction(now = performance.now()) {
      s.lastInteract = now
      s.fly = null
      // Any other input takes over from a wheel glide in progress.
      if (s.drag.active || s.keys.size) s.wheelTarget = null
      if (!s.interacted) {
        s.interacted = true
        s.interactCbs.forEach((cb) => cb())
      }
    }

    function tick(now) {
      s.frame = null
      const dt = Math.min(now - (s.lastTick || now), 50)
      s.lastTick = now
      const { minX, maxX, minY, maxY } = s.bounds

      if (s.fly) {
        const t = clamp((now - s.fly.start) / s.fly.ms, 0, 1)
        const k = easeInOutCubic(t)
        const { from, to } = s.fly
        s.cam.x = from.x + (to.x - from.x) * k
        s.cam.y = from.y + (to.y - from.y) * k
        if (to.zoom !== from.zoom) {
          s.cam.zoom = from.zoom + (to.zoom - from.zoom) * k
          updateView()
        }
        s.dirty = true
        if (t >= 1) {
          s.fly = null
          s.lastInteract = now
          persistLater()
        }
      } else if (!s.frozen && !s.drag.active) {
        // Held arrow keys.
        if (s.keys.size && !reducedMotion) {
          let kx = 0
          let ky = 0
          s.keys.forEach((key) => {
            kx += ARROWS[key][0]
            ky += ARROWS[key][1]
          })
          if (kx || ky) {
            s.cam.x = clamp(s.cam.x + kx * KEY_SPEED * dt, minX, maxX)
            s.cam.y = clamp(s.cam.y + ky * KEY_SPEED * dt, minY, maxY)
            s.dirty = true
          }
        }

        // Wheel: glide toward where the wheel input has asked to be.
        if (s.wheelTarget) {
          const t = s.wheelTarget
          const k = 1 - Math.exp(-dt / WHEEL_TAU)
          s.cam.x += (t.x - s.cam.x) * k
          s.cam.y += (t.y - s.cam.y) * k
          if (Math.abs(t.x - s.cam.x) < 0.02 && Math.abs(t.y - s.cam.y) < 0.02) {
            s.cam.x = t.x
            s.cam.y = t.y
            s.wheelTarget = null
          }
          s.dirty = true
        }

        // Inertia after a drag.
        if (s.vel.x || s.vel.y) {
          s.cam.x += s.vel.x * dt
          s.cam.y += s.vel.y * dt
          const decay = Math.exp(-dt / INERTIA_TAU)
          s.vel.x *= decay
          s.vel.y *= decay
          if (Math.hypot(s.vel.x, s.vel.y) < INERTIA_STOP) {
            s.vel.x = 0
            s.vel.y = 0
            persistLater()
          }
          s.dirty = true
        }

        // Spring back inside the world.
        const cx = clamp(s.cam.x, minX, maxX)
        const cy = clamp(s.cam.y, minY, maxY)
        if (cx !== s.cam.x || cy !== s.cam.y) {
          const k = 1 - Math.exp(-dt / SPRING_TAU)
          s.cam.x += (cx - s.cam.x) * k
          s.cam.y += (cy - s.cam.y) * k
          if (Math.abs(cx - s.cam.x) < 0.01) s.cam.x = cx
          if (Math.abs(cy - s.cam.y) < 0.01) s.cam.y = cy
          // Don't keep coasting outward.
          if ((cx < s.cam.x && s.vel.x > 0) || (cx > s.cam.x && s.vel.x < 0)) s.vel.x = 0
          if ((cy < s.cam.y && s.vel.y > 0) || (cy > s.cam.y && s.vel.y < 0)) s.vel.y = 0
          s.dirty = true
        }

        // Idle drift: a slow sidereal crawl once the visitor has let go.
        const idleFor = now - s.lastInteract
        if (
          !reducedMotion &&
          idleFor > IDLE_AFTER &&
          !s.keys.size &&
          !s.wheelTarget &&
          !s.vel.x &&
          !s.vel.y &&
          s.view.docked
        ) {
          const ramp = clamp((idleFor - IDLE_AFTER) / IDLE_RAMP, 0, 1)
          const speed = IDLE_SPEED * ramp * dt
          let nx = s.cam.x + Math.cos(s.driftAngle) * speed
          let ny = s.cam.y + Math.sin(s.driftAngle) * speed
          // Reflect off the world's edges.
          if (nx < minX || nx > maxX) {
            s.driftAngle = Math.PI - s.driftAngle
            nx = clamp(nx, minX, maxX)
          }
          if (ny < minY || ny > maxY) {
            s.driftAngle = -s.driftAngle
            ny = clamp(ny, minY, maxY)
          }
          if (minX !== maxX) s.cam.x = nx
          if (minY !== maxY) s.cam.y = ny
          s.dirty = true
        }
      }

      if (s.dirty) {
        s.dirty = false
        updateDock()
        onFrameRef.current?.(s.cam, s.view)
      }

      if (s.running) s.frame = requestAnimationFrame(tick)
    }

    function start() {
      if (s.running) return
      s.running = true
      s.lastTick = 0
      s.frame = requestAnimationFrame(tick)
    }

    function stop() {
      s.running = false
      if (s.frame) cancelAnimationFrame(s.frame)
      s.frame = null
    }

    return {
      get: () => s.cam,
      view: () => s.view,
      bounds: () => s.bounds,
      project(wx, wy, depth = 0) {
        const { scale, cw, ch } = s.view
        return {
          x: (wx - s.cam.x) * (1 + depth) * scale + cw / 2,
          y: (wy - s.cam.y) * (1 + depth) * scale + ch / 2,
        }
      },
      unproject(px, py) {
        const { scale, cw, ch } = s.view
        return { x: s.cam.x + (px - cw / 2) / scale, y: s.cam.y + (py - ch / 2) / scale }
      },
      isInView(wx, wy, depth = 0, insetPx = 0) {
        const p = this.project(wx, wy, depth)
        return (
          p.x >= insetPx && p.x <= s.view.cw - insetPx && p.y >= insetPx && p.y <= s.view.ch - insetPx
        )
      },
      flyTo(target, ms = 900) {
        const { minX, maxX, minY, maxY } = s.bounds
        const to = {
          x: clamp(target.x, minX, maxX),
          y: clamp(target.y, minY, maxY),
          zoom: clamp(target.zoom ?? s.cam.zoom, zoomRange[0], zoomRange[1]),
        }
        s.vel.x = 0
        s.vel.y = 0
        s.wheelTarget = null
        s.lastInteract = performance.now()
        if (reducedMotion || ms <= 0 || !s.running) {
          s.cam.x = to.x
          s.cam.y = to.y
          s.cam.zoom = to.zoom
          updateView()
          clampCam()
          s.fly = null
          persistLater()
          markDirty()
          return
        }
        s.fly = { from: { ...s.cam }, to, start: performance.now(), ms }
        markDirty()
      },
      freeze() {
        s.frozen = true
        s.fly = null
        s.vel.x = 0
        s.vel.y = 0
      },
      consumeDragged() {
        const was = s.drag.dragged
        s.drag.dragged = false
        return was
      },
      onInteract(cb) {
        if (s.interacted) cb()
        else s.interactCbs.push(cb)
        return () => {
          s.interactCbs = s.interactCbs.filter((f) => f !== cb)
        }
      },
      // Internal — wired up by the effect below.
      _internal: { s, start, stop, updateView, updateDock, clampCam, soft, noteInteraction, markDirty, persistLater },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const { s, start, stop, updateView, updateDock, clampCam, soft, noteInteraction, markDirty, persistLater } =
      camera._internal

    // Where to start: wherever the visitor left the sky this session, else home.
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        s.cam.x = saved.x
        s.cam.y = saved.y
        s.cam.zoom = clamp(saved.zoom || 1, zoomRange[0], zoomRange[1])
      }
    } catch {
      // Fall back to the initial camera.
    }
    s.driftAngle = ((Math.floor(Date.now() / 86400000) * 137.5) % 360) * (Math.PI / 180)
    s.lastInteract = performance.now()
    updateView()
    clampCam()
    updateDock()
    s.dirty = true

    // ── Pointer: drag to pan ──
    function onPointerDown(e) {
      if (e.button !== 0 || s.frozen) return
      // Buttons inside the sky (the strip's View) handle their own clicks;
      // a press on them should never turn into a drag.
      if (e.target.closest('button')) return
      const d = s.drag
      d.active = true
      d.pointerId = e.pointerId
      d.lastX = e.clientX
      d.lastY = e.clientY
      d.lastT = e.timeStamp
      d.raw.x = s.cam.x
      d.raw.y = s.cam.y
      d.moved = false
      d.dragged = false
      d.totalX = 0
      d.totalY = 0
      d.type = e.pointerType
      s.vel.x = 0
      s.vel.y = 0
      noteInteraction(e.timeStamp)
    }

    function onPointerMove(e) {
      const d = s.drag
      if (!d.active || e.pointerId !== d.pointerId) return
      const dx = e.clientX - d.lastX
      const dy = e.clientY - d.lastY
      if (!d.moved) {
        // A press has to travel a few px (total, from where it started)
        // before it counts as a drag — otherwise it's a click on a star.
        d.totalX += dx
        d.totalY += dy
        if (Math.hypot(d.totalX, d.totalY) < DRAG_THRESHOLD) {
          d.lastX = e.clientX
          d.lastY = e.clientY
          d.lastT = e.timeStamp
          return
        }
        d.moved = true
        // Capture only once it's a real drag, so plain clicks on stars
        // and buttons are never retargeted to the container.
        try {
          el.setPointerCapture(e.pointerId)
        } catch {
          // Capture is a nicety; dragging still works without it.
        }
      }
      const { scale } = s.view
      const { minX, maxX, minY, maxY } = s.bounds
      d.raw.x -= dx / scale
      d.raw.y -= dy / scale

      // On touch, pulling the sky down past its top edge while it fills
      // the screen hands the overshoot to the page, so the hero above is
      // reachable with a swipe.
      if (d.type === 'touch' && s.view.docked && d.raw.y < minY && dy > 0) {
        const overshootPx = (minY - d.raw.y) * scale
        window.scrollBy(0, -overshootPx)
        d.raw.y = minY
      }

      s.cam.x = soft(d.raw.x, minX, maxX)
      s.cam.y = soft(d.raw.y, minY, maxY)

      const dt = Math.max(e.timeStamp - d.lastT, 1)
      const ix = -dx / scale / dt
      const iy = -dy / scale / dt
      s.vel.x = s.vel.x * 0.6 + ix * 0.4
      s.vel.y = s.vel.y * 0.6 + iy * 0.4
      d.lastX = e.clientX
      d.lastY = e.clientY
      d.lastT = e.timeStamp
      markDirty()
    }

    function onPointerUp(e) {
      const d = s.drag
      if (!d.active || e.pointerId !== d.pointerId) return
      d.active = false
      d.dragged = d.moved
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        // Not captured — fine.
      }
      // A stale velocity (finger held still before lifting) shouldn't coast,
      // and nothing coasts at all under reduced motion.
      if (e.timeStamp - d.lastT > 80 || reducedMotion) {
        s.vel.x = 0
        s.vel.y = 0
      }
      if (!d.moved) {
        s.vel.x = 0
        s.vel.y = 0
      }
      s.lastInteract = e.timeStamp
      persistLater()
      markDirty()
    }

    // ── Wheel: pan while the sky fills the viewport ──
    function onWheel(e) {
      if (s.frozen) return
      const now = e.timeStamp
      updateDock()
      const { dx, dy } = normalizeWheel(e, s.view.ch)

      if (e.ctrlKey) {
        // Pinch / ctrl+wheel: zoom about the pointer.
        e.preventDefault()
        const rect = el.getBoundingClientRect()
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top
        const before = camera.unproject(px, py)
        const oldZoom = s.cam.zoom
        s.cam.zoom = clamp(oldZoom * Math.exp(-dy * 0.0015), zoomRange[0], zoomRange[1])
        updateView()
        s.cam.x = before.x - (before.x - s.cam.x) * (oldZoom / s.cam.zoom)
        s.cam.y = before.y - (before.y - s.cam.y) * (oldZoom / s.cam.zoom)
        clampCam()
        noteInteraction(now)
        persistLater()
        markDirty()
        return
      }

      // Until the sky fills the screen, the wheel scrolls the page as
      // usual; once it does, the same motion carries straight on into
      // panning the sky.
      if (!s.view.docked) return
      const { minX, maxX, minY, maxY } = s.bounds
      // Wheel input moves a target that the camera eases toward (see
      // tick), so notched mouse wheels glide instead of stepping.
      const target = s.wheelTarget ?? { x: s.cam.x, y: s.cam.y }
      // At the sky's top or bottom edge, let the page scroll instead.
      if ((dy < 0 && target.y <= minY + 0.01) || (dy > 0 && target.y >= maxY - 0.01)) {
        s.wheelTarget = null
        return
      }
      e.preventDefault()
      const { scale } = s.view
      s.vel.x = 0
      s.vel.y = 0
      target.x = clamp(target.x + dx / scale, minX, maxX)
      target.y = clamp(target.y + dy / scale, minY, maxY)
      if (reducedMotion) {
        s.cam.x = target.x
        s.cam.y = target.y
        s.wheelTarget = null
      } else {
        s.wheelTarget = target
      }
      noteInteraction(now)
      persistLater()
      markDirty()
    }

    // ── Keyboard: arrows pan while focus is inside the sky ──
    function onKeyDown(e) {
      const dir = ARROWS[e.key]
      if (!dir || s.frozen) return
      e.preventDefault()
      noteInteraction(e.timeStamp)
      if (reducedMotion) {
        const { minX, maxX, minY, maxY } = s.bounds
        s.cam.x = clamp(s.cam.x + dir[0] * KEY_STEP, minX, maxX)
        s.cam.y = clamp(s.cam.y + dir[1] * KEY_STEP, minY, maxY)
        persistLater()
        markDirty()
        return
      }
      s.keys.add(e.key)
      markDirty()
    }

    function onKeyUp(e) {
      if (s.keys.delete(e.key)) {
        s.lastInteract = e.timeStamp
        persistLater()
      }
    }

    function onBlur() {
      s.keys.clear()
    }

    function onScroll() {
      markDirty()
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('keydown', onKeyDown)
    el.addEventListener('keyup', onKeyUp)
    el.addEventListener('blur', onBlur)
    window.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => {
      updateView()
      clampCam()
      markDirty()
    })
    ro.observe(el)

    // Only animate while the sky is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          s.lastInteract = performance.now()
          start()
        } else {
          stop()
        }
      },
      { threshold: 0 }
    )
    io.observe(el)
    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      clearTimeout(s.persistTimer)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('keydown', onKeyDown)
      el.removeEventListener('keyup', onKeyUp)
      el.removeEventListener('blur', onBlur)
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera])

  return camera
}
