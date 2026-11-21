import { Link } from 'react-router-dom'
import styles from './WorkLogList.module.css'

const CATEGORY_LABELS = {
  music: 'Music',
  art: 'Art',
  video: 'Video',
  writing: 'Writing',
  code: 'Code',
}

// Same walk order as the hero's discipline filter, minus 'all' — keeps
// the log reading in a consistent sequence no matter which filter is active.
const CATEGORY_ORDER = ['music', 'art', 'video', 'writing', 'code']

const pad = (n) => String(n).padStart(2, '0')

export default function WorkLogList({ works }) {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: works.filter((w) => w.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <div className={styles.log}>
      {groups.map((group) => (
        <section
          key={group.category}
          className={styles.section}
          style={{ '--accent': `var(--cat-${group.category})` }}
        >
          <h2 className={styles.sectionTitle}>
            <span>{CATEGORY_LABELS[group.category]}</span>
            <span className={styles.sectionCount}>
              {pad(group.items.length)} logged
            </span>
          </h2>
          <div className={styles.entries}>
            {group.items.map((work, i) => {
              // Real links (not click handlers) so entries can be
              // Cmd/Ctrl-clicked, middle-clicked, or copied.
              const external = work.category === 'writing' && work.link
              const content = (
                <>
                  <span className={styles.entryIndex}>{pad(i + 1)}</span>
                  <span className={styles.entryMain}>
                    <span className={styles.entryTitle}>
                      {work.title}
                      {external && (
                        <span className={styles.entryExternal} aria-hidden="true"> ↗</span>
                      )}
                    </span>
                    {work.desc && (
                      <span className={styles.entryDesc}>{work.desc}</span>
                    )}
                  </span>
                  <span className={styles.entryYear}>{work.year}</span>
                </>
              )
              return external ? (
                <a
                  key={work.id}
                  href={work.link}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.entry}
                  aria-label={`Read ${work.title} (opens in a new tab)`}
                >
                  {content}
                </a>
              ) : (
                <Link key={work.id} to={`/work/${work.id}`} className={styles.entry}>
                  {content}
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
