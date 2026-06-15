import { useEffect, useRef } from 'react'

export function useStarfield(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let stars = []
    let shootingStars = []
    let nextShootAt = 0
    let targetScroll = window.scrollY
    let currentScroll = targetScroll
    let scrollVelocity = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      buildStars()
    }

    function buildStars() {
      const W = canvas.width
      const H = canvas.height
      const count = Math.floor((W * H) / 4000)
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
        const color = s.gold ? '201,168,76' : '232,226,212'

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
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const prevScroll = currentScroll
      currentScroll += (targetScroll - currentScroll) * 0.07
      scrollVelocity = currentScroll - prevScroll

      const PARALLAX_STRENGTH = 0.12
      const trailBoost = Math.min(Math.abs(scrollVelocity) * 0.5, 6)

      for (const s of stars) {
        const twinkle = (Math.sin(t * s.speed + s.phase) + 1) / 2
        const alpha = 0.55 + twinkle * 0.35

        // Nearer (larger) stars drift faster, giving a sense of travelling
        // through a vast field of depth as the page scrolls.
        const offset = currentScroll * s.depth * PARALLAX_STRENGTH
        const y = ((s.y - offset) % H + H) % H

        ctx.beginPath()
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.gold
          ? `rgba(201,168,76,${alpha * 0.9})`
          : `rgba(232,226,212,${alpha})`
        ctx.fill()

        if (trailBoost > 1) {
          const trailLen = trailBoost * (0.3 + s.depth)
          const dir = scrollVelocity > 0 ? 1 : -1
          const grad = ctx.createLinearGradient(s.x, y, s.x, y - dir * trailLen)
          const color = s.gold ? '201,168,76' : '232,226,212'
          grad.addColorStop(0, `rgba(${color},${alpha * 0.5})`)
          grad.addColorStop(1, `rgba(${color},0)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = s.r
          ctx.beginPath()
          ctx.moveTo(s.x, y)
          ctx.lineTo(s.x, y - dir * trailLen)
          ctx.stroke()
        }
      }

      drawShootingStars(W, H, t)

      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    resize()
    nextShootAt = performance.now() + Math.random() * 6000 + 4000
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [canvasRef])
}