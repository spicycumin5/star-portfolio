import { useState } from 'react'
import WorkCard from '../components/WorkCard'
import ConstellationView from '../components/ConstellationView'
import { WORKS } from '../data/works'
import styles from './Home.module.css'

const DISCIPLINES = [
  { label: 'All', category: 'all' },
  { label: 'Music', category: 'music' },
  { label: 'Art', category: 'art' },
  { label: 'Video', category: 'video' },
  { label: 'Write', category: 'writing' },
  { label: 'Code', category: 'code' },
]

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all')
  // Constellation hit-targets get cramped on small touch screens — default
  // to grid there, but leave the toggle so anyone can still switch.
  const [view, setView] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 700 ? 'grid' : 'constellation'
  )

  const filtered =
    activeFilter === 'all'
      ? WORKS
      : WORKS.filter((w) => w.category === activeFilter)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>✦ Kyumin Han ✦</p>
        <h1 className={styles.heading}>
          Work born from<br />
          <em>many skies</em>
        </h1>
        <p className={styles.sub}>
          Music, art, video, writing, and code <br />
          each a piece of a greater constellation.
        </p>
        <div className={styles.divider}>Scroll to explore</div>
      </section>

      {/* Gallery */}
      <section className={styles.gallery}>
        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`}
            onClick={() => setView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            title="Grid view"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'constellation' ? styles.viewActive : ''}`}
            onClick={() => setView('constellation')}
            aria-label="Constellation view"
            aria-pressed={view === 'constellation'}
            title="Constellation view"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
            </svg>
          </button>
        </div>

        {/* Discipline selection */}
        <p className={styles.filterLabel}>Choose a constellation</p>
        <div className={styles.filterBar}>
          {DISCIPLINES.map((d) => (
            <button
              key={d.category}
              className={`${styles.filterBtn} ${activeFilter === d.category ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(d.category)}
              aria-pressed={activeFilter === d.category}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Grid or constellation */}
        {view === 'grid' ? (
          <div className={styles.grid}>
            {filtered.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} />
            ))}
          </div>
        ) : (
          <ConstellationView works={WORKS} activeFilter={activeFilter} />
        )}
      </section>
    </div>
  )
}
