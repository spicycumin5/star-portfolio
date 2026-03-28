import { useState } from 'react'
import WorkCard from '../components/WorkCard'
import { WORKS, CATEGORIES } from '../data/works'
import styles from './Home.module.css'

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all')

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

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map((work, i) => (
            <WorkCard key={work.id} work={work} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
