import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ConstellationView.module.css'

// Anchor points for each category, in a 160x100 viewBox.
const CATEGORY_ANCHORS = {
  music: { x: 35, y: 30 },
  video: { x: 115, y: 22 },
  art: { x: 80, y: 65 },
  writing: { x: 128, y: 70 },
  code: { x: 45, y: 78 },
}

const FALLBACK_ANCHOR = { x: 80, y: 50 }
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180)

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Deterministic per-category spiral layout, grouped by category so each
// category reads as its own loose constellation.
function buildLayout(works) {
  const byCategory = {}
  works.forEach((work) => {
    if (!byCategory[work.category]) byCategory[work.category] = []
    byCategory[work.category].push(work)
  })

  const stars = []
  const lines = []

  Object.entries(byCategory).forEach(([category, items]) => {
    const anchor = CATEGORY_ANCHORS[category] || FALLBACK_ANCHOR
    let prev = null

    items.forEach((work, i) => {
      const angle = i * GOLDEN_ANGLE
      const radius = 4 + i * 3.2
      const x = clamp(anchor.x + Math.cos(angle) * radius, 10, 150)
      const y = clamp(anchor.y + Math.sin(angle) * radius, 6, 94)
      const star = { work, x, y }
      stars.push(star)

      if (prev) {
        lines.push({ from: prev, to: star, category })
      }
      prev = star
    })
  })

  return { stars, lines }
}

export default function ConstellationView({ works, activeFilter }) {
  const navigate = useNavigate()
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const { stars, lines } = useMemo(() => buildLayout(works), [works])

  const isDimmed = (category) =>
    activeFilter !== 'all' && category !== activeFilter

  const goTo = (id) => navigate(`/work/${id}`)

  return (
    <div className={styles.wrapper}>
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
              className={`${styles.line} ${isDimmed(category) ? styles.dimmed : ''} ${
                hoveredCategory === category ? styles.lineActive : ''
              }`}
            />
          ))}
        </g>

        {stars.map(({ work, x, y }) => (
          <g
            key={work.id}
            className={`${styles.starGroup} ${isDimmed(work.category) ? styles.dimmed : ''}`}
            transform={`translate(${x} ${y})`}
            onClick={() => goTo(work.id)}
            onMouseEnter={() => setHoveredCategory(work.category)}
            onMouseLeave={() => setHoveredCategory(null)}
            onFocus={() => setHoveredCategory(work.category)}
            onBlur={() => setHoveredCategory(null)}
            tabIndex={0}
            role="button"
            aria-label={`View ${work.title}`}
            onKeyDown={(e) => e.key === 'Enter' && goTo(work.id)}
          >
            <circle r={4} className={styles.glow} vectorEffect="non-scaling-stroke" />
            <circle r={1.3} className={styles.star} vectorEffect="non-scaling-stroke" />
            <text x="0" y="-3.5" className={styles.label}>
              {work.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
