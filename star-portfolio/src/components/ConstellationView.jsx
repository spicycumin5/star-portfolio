import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ConstellationView.module.css'

// Hand-placed anchors for the categories currently in use, in a 160x100
// viewBox. Categories not listed here fall back to anchorFor(), which
// spreads any new categories around the center automatically.
const KNOWN_CATEGORY_ANCHORS = {
  music: { x: 35, y: 30 },
  video: { x: 115, y: 22 },
  art: { x: 80, y: 65 },
  writing: { x: 128, y: 70 },
  code: { x: 45, y: 78 },
}

const VIEW_CENTER = { x: 80, y: 50 }
const EXTRA_RADIUS = { x: 50, y: 32 }
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180)

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Deterministic per-category spiral layout, grouped by category so each
// category reads as its own loose constellation. Unknown categories are
// placed automatically around the center, evenly spaced via the golden
// angle, so adding new categories never collides with existing ones.
function buildLayout(works) {
  const byCategory = {}
  works.forEach((work) => {
    if (!byCategory[work.category]) byCategory[work.category] = []
    byCategory[work.category].push(work)
  })

  let extraIndex = 0
  function anchorFor(category) {
    const known = KNOWN_CATEGORY_ANCHORS[category]
    if (known) return known
    const angle = extraIndex * GOLDEN_ANGLE
    extraIndex += 1
    return {
      x: clamp(VIEW_CENTER.x + Math.cos(angle) * EXTRA_RADIUS.x, 15, 145),
      y: clamp(VIEW_CENTER.y + Math.sin(angle) * EXTRA_RADIUS.y, 12, 88),
    }
  }

  const stars = []
  const lines = []

  Object.entries(byCategory).forEach(([category, items]) => {
    const anchor = anchorFor(category)
    let prev = null

    items.forEach((work, i) => {
      const angle = i * GOLDEN_ANGLE
      const radius = 4 + i * 3.2
      const x = clamp(anchor.x + Math.cos(angle) * radius, 6, 154)
      const y = clamp(anchor.y + Math.sin(angle) * radius, 4, 96)

      // Deterministic per-star variation so stars feel like part of the
      // ambient sky rather than identical UI dots.
      const size = 1 + ((work.id * 7) % 5) * 0.22
      const gold = work.id % 5 === 2
      const twinkleDur = 2.2 + (work.id % 4) * 0.7
      const twinkleDelay = (work.id * 0.53) % 3

      const star = { work, x, y, size, gold, twinkleDur, twinkleDelay }
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
  const [burstingId, setBurstingId] = useState(null)

  const { stars, lines } = useMemo(() => buildLayout(works), [works])

  const isDimmed = (category) =>
    activeFilter !== 'all' && category !== activeFilter

  const isHighlighted = (category) =>
    activeFilter !== 'all' && category === activeFilter

  function handleSelect(work) {
    if (burstingId) return
    setBurstingId(work.id)
    setTimeout(() => navigate(`/work/${work.id}`), 240)
  }

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
                isHighlighted(category) ? styles.lineHighlighted : ''
              } ${hoveredCategory === category ? styles.lineActive : ''}`}
            />
          ))}
        </g>

        {stars.map(({ work, x, y, size, gold, twinkleDur, twinkleDelay }) => (
          <g
            key={work.id}
            className={`${styles.starGroup} ${isDimmed(work.category) ? styles.dimmed : ''} ${
              burstingId === work.id ? styles.bursting : ''
            }`}
            transform={`translate(${x} ${y})`}
            onClick={() => handleSelect(work)}
            onMouseEnter={() => setHoveredCategory(work.category)}
            onMouseLeave={() => setHoveredCategory(null)}
            onFocus={() => setHoveredCategory(work.category)}
            onBlur={() => setHoveredCategory(null)}
            tabIndex={0}
            role="button"
            aria-label={`View ${work.title}`}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(work)}
          >
            <circle r={6} className={styles.hitArea} />
            <circle r={4.5} className={styles.glow} />
            <circle
              r={size}
              className={`${styles.star} ${gold ? styles.starGold : ''}`}
              style={{
                '--twinkle-dur': `${twinkleDur}s`,
                '--twinkle-delay': `${twinkleDelay}s`,
              }}
            />
            <path
              d="M2.6,0 L0.65,0.65 L0,2.6 L-0.65,0.65 L-2.6,0 L-0.65,-0.65 L0,-2.6 L0.65,-0.65 Z"
              className={styles.starShape}
            />
            <text x="0" y="-3.5" className={styles.label}>
              {work.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
