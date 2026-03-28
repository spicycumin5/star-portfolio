import { useEffect, useRef } from 'react'

export function useStarfield(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let stars = []

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
        speed: Math.random() * 0.015 + 0.003,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.08,
      }))
    }

    function draw(t) {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        const twinkle = (Math.sin(t * s.speed + s.phase) + 1) / 2
        const alpha = 0.15 + twinkle * 0.65
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.gold
          ? `rgba(201,168,76,${alpha * 0.9})`
          : `rgba(232,226,212,${alpha})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef])
}
