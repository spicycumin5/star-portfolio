import { useState } from 'react'
import WorkLogList from '../components/WorkLogList'
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

const pad = (n) => String(n).padStart(2, '0')

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all')
  // Constellation hit-targets get cramped on small touch screens — default
  // to the log there, but leave the toggle so anyone can still switch.
  const [view, setView] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 700 ? 'log' : 'constellation'
  )
  // Logged once at mount — the moment this page happened to be opened,
  // not a ticking clock.
  const [loggedAt] = useState(() => new Date())
  const logDate = `${pad(loggedAt.getMonth() + 1)}.${pad(loggedAt.getDate())}.${loggedAt.getFullYear()}`
  const logTime = `${pad(loggedAt.getHours())}:${pad(loggedAt.getMinutes())}`

  const filtered =
    activeFilter === 'all'
      ? WORKS
      : WORKS.filter((w) => w.category === activeFilter)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.identityName}>✦ Kyumin Han ✦</h1>

        {/* A larger mark anchored to the right — balances the chart's
            left-anchored spread and fills what was otherwise dead air
            on wide viewports. */}
        <img src="/images/KYUMINlogo%20(2).png" alt="" className={styles.sideMark} />

        {/* Not a chart — a logbook page. What's charted below is the
            real sky; this is just the entry written the night it was
            observed, the way an astronomer's notebook always reads
            plainer than the atlas it's building toward. */}
        <div className={styles.log}>
          <p className={styles.logLine}>Observation Log</p>
          <p className={styles.logLine}>
            <span className={styles.logLabel}>Date</span>{logDate}
          </p>
          <p className={styles.logLine}>
            <span className={styles.logLabel}>Time</span>{logTime}
          </p>
          <p className={styles.logLine}>
            <span className={styles.logLabel}>Seeing</span>Clear, no moon
          </p>
          <p className={styles.logLine}>
            <span className={styles.logLabel}>R.A. / Dec</span>
            18<span className={styles.unit}>h</span> 36<span className={styles.unit}>m</span>{' '}
            <span className={styles.sep}>·</span> +38<span className={styles.unit}>°</span> 47<span className={styles.unit}>′</span>
          </p>
          <p className={styles.logLine}>
            Five bodies logged tonight. Full chart follows below.
          </p>
        </div>

        <div className={styles.divider}>Scroll to explore</div>
      </section>

      {/* Gallery */}
      <section className={`${styles.gallery} ${view === 'constellation' ? styles.galleryWide : ''}`}>
        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'log' ? styles.viewActive : ''}`}
            onClick={() => setView('log')}
            aria-label="Log view"
            aria-pressed={view === 'log'}
            title="Log view"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="5" width="18" height="1.6" rx="0.8" />
              <rect x="3" y="11.2" width="18" height="1.6" rx="0.8" />
              <rect x="3" y="17.4" width="18" height="1.6" rx="0.8" />
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

        {/* Log or constellation */}
        {view === 'log' ? (
          <WorkLogList works={filtered} />
        ) : (
          <ConstellationView works={WORKS} activeFilter={activeFilter} />
        )}
      </section>
    </div>
  )
}
