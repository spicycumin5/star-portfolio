import { useEffect, useRef } from 'react'

// Dispatched by the constellation when a star is clicked: the field
// zooms toward that screen point with warp trails building up, until
// the route change hands off to the usual arrival burst.
export const DIVE_EVENT = 'starfield:dive'

// Dispatched by the constellation sky every time its camera moves: the
// field drifts a little with it (slower than the sky's own layers), so
// the far background reads as the deepest layer of the same space.
// detail: { x, y } — the camera's displacement from home, in CSS px.
export const SKY_CAMERA_EVENT = 'starfield:camera'

// How much of the sky camera's movement the background copies, scaled
// per star by depth so nearer pinpoints slide a touch more than far ones.
const BG_FOLLOW = 0.12

export function useStarfield(canvasRef, pathname) {
  const warpRef = useRef(8)

  // Reset warp burst on every route change
  useEffect(() => {
    warpRef.current = 8
  }, [pathname])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animId
    let stars = []
    let shootingStars = []
    let nextShootAt = 0
    let targetScroll = window.scrollY
    let currentScroll = targetScroll
    let scrollVelocity = 0
    let diveUntil = 0
    let diveCenter = null
    let zoom = 0
    let targetCam = { x: 0, y: 0 }
    let currentCam = { x: 0, y: 0 }
    // Logical (CSS px) size. The canvas's backing store is scaled by the
    // device pixel ratio so stars stay crisp on high-DPI screens, capped
    // at 2x since finer than that is invisible and costs fill rate.
    let W = 0
    let H = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildStars()
      if (reduceMotion) drawStatic()
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.gold ? 'rgba(212,147,106,0.75)' : 'rgba(237,229,208,0.8)'
        ctx.fill()
      }
    }

    function buildStars() {
      // Density-based, but capped: a 4K display doesn't need 2,000 stars
      // each drawing gradient trails every frame.
      const count = Math.min(Math.floor((W * H) / 4000), 900)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.2,
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.08,
        depth: Math.random(),
      }))
    }

    function onScroll() {
      targetScroll = window.scrollY
    }

    function onDive(e) {
      diveCenter = { x: e.detail.x, y: e.detail.y }
      diveUntil = performance.now() + e.detail.duration
    }

    function onCamera(e) {
      targetCam = { x: e.detail.x, y: e.detail.y }
    }

    function spawnShootingStar(W, H) {
      const angle = (Math.random() * 20 + 25) * (Math.PI / 180)
      const speed = Math.random() * 6 + 8
      const gold = Math.random() < 0.2
      shootingStars.push({
        x: Math.random() * W * 0.6,
        y: Math.random() * H * 0.4,
        ux: Math.cos(angle),
        uy: Math.sin(angle),
        speed,
        len: Math.random() * 80 + 60,
        life: 0,
        fade: Math.random() * 0.01 + 0.012,
        gold,
      })
    }

    function drawShootingStars(W, H, t) {
      if (t >= nextShootAt) {
        spawnShootingStar(W, H)
        nextShootAt = t + Math.random() * 6000 + 4000
      }

      shootingStars = shootingStars.filter((s) => {
        s.x += s.ux * s.speed
        s.y += s.uy * s.speed
        s.life += s.fade
        if (s.life >= 1) return false
        if (s.x < -200 || s.x > W + 200 || s.y < -200 || s.y > H + 200) return false

        const alpha = 1 - s.life
        const tailX = s.x - s.ux * s.len
        const tailY = s.y - s.uy * s.len
        const color = s.gold ? '212,147,106' : '237,229,208'

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY)
        grad.addColorStop(0, `rgba(${color},${alpha})`)
        grad.addColorStop(1, `rgba(${color},0)`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${alpha})`
        ctx.fill()

        return true
      })
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H)

      const prevScroll = currentScroll
      currentScroll += (targetScroll - currentScroll) * 0.07
      scrollVelocity = currentScroll - prevScroll
      currentCam.x += (targetCam.x - currentCam.x) * 0.07
      currentCam.y += (targetCam.y - currentCam.y) * 0.07

      const PARALLAX_STRENGTH = 0.12
      const trailBoost = Math.min(Math.abs(scrollVelocity) * 0.5, 6)

      // While diving, warp builds toward the clicked star and the field
      // zooms in around it; otherwise the arrival burst decays as usual.
      const diving = t < diveUntil
      if (diving) {
        warpRef.current = Math.min(warpRef.current * 1.1 + 0.6, 22)
        zoom += (1 - zoom) * 0.08
      } else {
        if (warpRef.current > 0.05) {
          warpRef.current *= 0.95
        } else {
          warpRef.current = 0
        }
        zoom = zoom > 0.001 ? zoom * 0.9 : 0
      }
      const warp = warpRef.current
      const cx = diving ? diveCenter.x : W / 2
      const cy = diving ? diveCenter.y : H / 2
      const zoomScale = 1 + zoom * 0.6
      const zx = diveCenter ? diveCenter.x : W / 2
      const zy = diveCenter ? diveCenter.y : H / 2

      for (const s of stars) {
        const twinkle = (Math.sin(t * s.speed + s.phase) + 1) / 2
        const alpha = 0.55 + twinkle * 0.35
        const offset = currentScroll * s.depth * PARALLAX_STRENGTH
        const follow = BG_FOLLOW * (0.4 + s.depth * 0.6)
        let y = ((s.y - offset - currentCam.y * follow) % H + H) % H
        let x = ((s.x - currentCam.x * follow) % W + W) % W
        if (zoom > 0) {
          x = zx + (x - zx) * zoomScale
          y = zy + (y - zy) * zoomScale
        }

        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.gold
          ? `rgba(212,147,106,${alpha * 0.9})`
          : `rgba(237,229,208,${alpha})`
        ctx.fill()

        // Scroll-based vertical trails
        if (trailBoost > 1) {
          const trailLen = trailBoost * (0.3 + s.depth)
          const dir = scrollVelocity > 0 ? 1 : -1
          const grad = ctx.createLinearGradient(x, y, x, y - dir * trailLen)
          const color = s.gold ? '212,147,106' : '237,229,208'
          grad.addColorStop(0, `rgba(${color},${alpha * 0.5})`)
          grad.addColorStop(1, `rgba(${color},0)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = s.r
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y - dir * trailLen)
          ctx.stroke()
        }

        // Warp arrival: trails radiate outward from center
        if (warp > 0.3) {
          const dx = x - cx
          const dy = y - cy
          const dist = Math.hypot(dx, dy) || 1
          const nx = dx / dist
          const ny = dy / dist
          const trailLen = warp * (1.5 + s.depth * 3)
          const warpAlpha = Math.min(1, warp / 8) * 0.45
          const color = s.gold ? '212,147,106' : '237,229,208'
          const grad = ctx.createLinearGradient(x, y, x - nx * trailLen, y - ny * trailLen)
          grad.addColorStop(0, `rgba(${color},${warpAlpha})`)
          grad.addColorStop(1, `rgba(${color},0)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = s.r * 0.8
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x - nx * trailLen, y - ny * trailLen)
          ctx.stroke()
        }
      }

      drawShootingStars(W, H, t)
      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()

    if (reduceMotion) {
      return () => window.removeEventListener('resize', resize)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener(DIVE_EVENT, onDive)
    window.addEventListener(SKY_CAMERA_EVENT, onCamera)
    nextShootAt = performance.now() + Math.random() * 6000 + 4000
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener(DIVE_EVENT, onDive)
      window.removeEventListener(SKY_CAMERA_EVENT, onCamera)
    }
  }, [canvasRef])
}
