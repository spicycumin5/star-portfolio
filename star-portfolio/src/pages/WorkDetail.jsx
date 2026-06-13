import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WORKS } from '../data/works'
import styles from './WorkDetail.module.css'

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const work = WORKS.find((w) => w.id === Number(id))
  const [openTrack, setOpenTrack] = useState(null)

  if (!work) {
    return (
      <div className={styles.notFound}>
        <p>Piece not found.</p>
        <button className={styles.back} onClick={() => navigate('/')}>
          ← Back to work
        </button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        ← Back to work
      </button>

      <p className={styles.category}>{work.category}</p>
      <h1 className={styles.title}>{work.title}</h1>
      <p className={styles.meta}>{work.year}</p>

      {work.tags && (
        <div className={styles.tags}>
          {work.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.divider} />

      {/* Thumbnail / image */}
      <div
        className={styles.thumb}
        style={{ background: work.image ? 'transparent' : work.bg }}
      >
        {work.image 
        ? (<img src={work.image} alt={work.title} className={styles.image} />) 
        : (
          <>
            <span className={styles.emoji}>{work.emoji}</span>
            <p className={styles.thumbHint}>Replace with image</p>
          </>
        )}
      </div>

      {/* Body copy */}
      <div className={styles.body}>
        {work.body.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* External link */}
      {work.link && (
        <a
          href={work.link}
          target="_blank"
          rel="noreferrer"
          className={styles.externalLink}
        >
          {work.linkLabel || 'View project'} ↗
        </a>
      )}

      {/* Tracklist */}
      {work.tracks && (
        <div className={styles.tracklist}>
          <p className={styles.tracklistHeading}>Tracklist</p>
          {work.tracks.map((track, i) => {
            const isOpen = openTrack === i
            return (
              <div key={i} className={`${styles.track} ${isOpen ? styles.trackOpen : ''}`}>
                <button
                  className={styles.trackHeader}
                  onClick={() => setOpenTrack(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.trackTitle}>
                    <span className={styles.trackSpark}>✦</span>
                    {track.title}
                  </span>
                  <span className={styles.trackToggle}>{isOpen ? '−' : '+'}</span>
                </button>
                <div className={styles.trackBody}>
                  <div className={styles.trackBodyInner}>
                    {track.desc && <p className={styles.trackDesc}>{track.desc}</p>}
                    {track.link && (
                      <a
                        href={track.link}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.trackLink}
                      >
                        {track.linkLabel || 'Listen'} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Next / prev navigation */}
      <div className={styles.workNav}>
        {WORKS.find((w) => w.id === work.id - 1) && (
          <button
            className={styles.navBtn}
            onClick={() => navigate(`/work/${work.id - 1}`)}
          >
            ← {WORKS.find((w) => w.id === work.id - 1).title}
          </button>
        )}
        <span />
        {WORKS.find((w) => w.id === work.id + 1) && (
          <button
            className={styles.navBtn}
            onClick={() => navigate(`/work/${work.id + 1}`)}
          >
            {WORKS.find((w) => w.id === work.id + 1).title} →
          </button>
        )}
      </div>
    </div>
  )
}