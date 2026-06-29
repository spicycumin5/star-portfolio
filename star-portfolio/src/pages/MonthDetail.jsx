import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WORKS } from '../data/works'
import styles from './WorkDetail.module.css'

export default function MonthDetail() {
  const { id, month } = useParams()
  const navigate = useNavigate()
  const work = WORKS.find((w) => w.id === Number(id) && Array.isArray(w.months))
  const months = work?.months || []
  const index = months.findIndex(
    (m) => m.image && m.month.toLowerCase() === month?.toLowerCase()
  )
  const entry = index >= 0 ? months[index] : null
  const [artAspect, setArtAspect] = useState(null)

  useEffect(() => {
    setArtAspect(null)
  }, [work?.id, month])

  if (!work || !entry) {
    return (
      <div className={styles.notFound}>
        <p>Piece not found.</p>
        <button className={styles.back} onClick={() => navigate('/')}>
          ← Back to work
        </button>
      </div>
    )
  }

  const visibleMonths = months.filter((m) => m.image)
  const visibleIndex = visibleMonths.findIndex((m) => m.month === entry.month)
  const prevEntry = visibleMonths[visibleIndex - 1]
  const nextEntry = visibleMonths[visibleIndex + 1]

  return (
    <div className={styles.page}>
      <span className={`${styles.deco} ${styles.deco1}`} aria-hidden="true">✦</span>
      <span className={`${styles.deco} ${styles.deco2}`} aria-hidden="true">✦</span>

      <button className={styles.back} onClick={() => navigate(`/work/${work.id}`)}>
        ← Back to {work.title}
      </button>

      <p className={styles.category}>
        <span className={styles.categorySpark} aria-hidden="true">✦</span>
        {work.category}
      </p>
      <h1 className={styles.title}>{entry.month} {work.year}</h1>
      <p className={styles.meta}>From "{work.title}"</p>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerStar} aria-hidden="true">✦</span>
      </div>

      <div className={styles.musicLayout}>
        <div className={styles.thumbFrame}>
          <div
            className={styles.thumb}
            style={{
              '--accent': work.bg,
              ...(artAspect ? { aspectRatio: artAspect, height: 'auto' } : {}),
            }}
          >
            <span className={`${styles.thumbDot} ${styles.thumbDot1}`} aria-hidden="true" />
            <span className={`${styles.thumbDot} ${styles.thumbDot2}`} aria-hidden="true" />
            <span className={`${styles.thumbDot} ${styles.thumbDot3}`} aria-hidden="true" />
            <span className={`${styles.thumbDot} ${styles.thumbDot4}`} aria-hidden="true" />
            <img
              src={entry.image}
              alt={`${work.title} — ${entry.month}`}
              className={styles.image}
              onLoad={(e) => setArtAspect(e.target.naturalWidth / e.target.naturalHeight)}
            />
          </div>
        </div>
        <div className={styles.musicDetails}>
          <div className={styles.body}>
            {entry.desc ? (
              entry.desc.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <p className={styles.thumbHint}>Add a description for this piece in works.js</p>
            )}
          </div>
          {entry.playlist && (
            <iframe
              src={entry.playlist.replace('open.spotify.com/', 'open.spotify.com/embed/')}
              title={`${entry.month} ${work.year} playlist`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '12px', marginTop: '1.5rem' }}
            />
          )}
        </div>
      </div>

      <div className={styles.workNav}>
        {prevEntry ? (
          <button
            className={styles.navBtn}
            onClick={() => navigate(`/work/${work.id}/${prevEntry.month.toLowerCase()}`)}
          >
            <span className={styles.navArrow} aria-hidden="true">✦</span>
            <span className={styles.navText}>
              <span className={styles.navLabel}>Previous</span>
              <span className={styles.navTitle}>{prevEntry.month}</span>
            </span>
          </button>
        ) : <span />}
        {nextEntry ? (
          <button
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={() => navigate(`/work/${work.id}/${nextEntry.month.toLowerCase()}`)}
          >
            <span className={styles.navText}>
              <span className={styles.navLabel}>Next</span>
              <span className={styles.navTitle}>{nextEntry.month}</span>
            </span>
            <span className={styles.navArrow} aria-hidden="true">✦</span>
          </button>
        ) : <span />}
      </div>
    </div>
  )
}
