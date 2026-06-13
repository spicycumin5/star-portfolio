import { useState } from 'react'
import WorkCard from '../components/WorkCard'
import ConstellationView from '../components/ConstellationView'
import { WORKS, CATEGORIES } from '../data/works'
import styles from './Home.module.css'

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [view, setView] = useState('constellation')

  const filtered =
    activeFilter === 'all'
      ? WORKS
      : WORKS.filter((w) => w.category === activeFilter)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>✦ Portfolio</p>
        <h1 className={styles.heading}>
          Work born from<br />
          <em>many skies</em>
        </h1>
        <p className={styles.sub}>
          Music, art, writing, and code —<br />
          each piece a constellation of its own.
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

        {/* Filter bar */}
        <div className={styles.filterBar}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
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
