import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WORKS } from '../data/works'
import CodeLinkCard from '../components/CodeLinkCard'
import { getVideoEmbedUrl } from '../utils/embeds'
import styles from './WorkDetail.module.css'

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const work = WORKS.find((w) => w.id === Number(id))
  const [openTrack, setOpenTrack] = useState(null)
  const [artAspect, setArtAspect] = useState(null)
  const prevWork = work && WORKS.find((w) => w.id === work.id - 1)
  const nextWork = work && WORKS.find((w) => w.id === work.id + 1)

  useEffect(() => {
    setArtAspect(null)
  }, [work?.id])

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

  const embedUrl = getVideoEmbedUrl(work.link)
  const isArt = work.category === 'art'
  const isMusic = work.category === 'music'
  const hasMonths = Array.isArray(work.months)

  const thumbContent = (
    <div className={styles.thumbFrame}>
      {embedUrl ? (
        <div className={styles.videoFrame}>
          <iframe
            src={embedUrl}
            title={work.title}
            className={styles.videoIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : work.category === 'code' ? (
        <CodeLinkCard work={work} />
      ) : (
        <div
          className={styles.thumb}
          style={{
            '--accent': work.bg,
            ...(isArt && artAspect ? { aspectRatio: artAspect, height: 'auto' } : {}),
            ...(isMusic ? { aspectRatio: '1 / 1', height: 'auto' } : {}),
          }}
        >
          <span className={`${styles.thumbDot} ${styles.thumbDot1}`} aria-hidden="true" />
          <span className={`${styles.thumbDot} ${styles.thumbDot2}`} aria-hidden="true" />
          <span className={`${styles.thumbDot} ${styles.thumbDot3}`} aria-hidden="true" />
          <span className={`${styles.thumbDot} ${styles.thumbDot4}`} aria-hidden="true" />
          {work.image
          ? (
            <img
              src={work.image}
              alt={work.title}
              className={styles.image}
              onLoad={isArt ? (e) => setArtAspect(e.target.naturalWidth / e.target.naturalHeight) : undefined}
            />
          )
          : (
            <>
              <span className={styles.emoji}>{work.emoji}</span>
              <p className={styles.thumbHint}>Replace with image</p>
            </>
          )}
        </div>
      )}
    </div>
  )

  const bodyContent = (
    <div className={styles.body}>
      {work.body.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )

  const linkContent = work.link && (
    <a
      href={work.link}
      target="_blank"
      rel="noreferrer"
      className={styles.externalLink}
    >
      {work.linkLabel || 'View project'} ↗
    </a>
  )

  const tracklistContent = work.tracks && (
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
  )

  return (
    <div className={styles.page}>
      <span className={`${styles.deco} ${styles.deco1}`} aria-hidden="true">✦</span>
      <span className={`${styles.deco} ${styles.deco2}`} aria-hidden="true">✦</span>

      <button className={styles.back} onClick={() => navigate('/')}>
        ← Back to work
      </button>

      <p className={styles.category}>
        <span className={styles.categorySpark} aria-hidden="true">✦</span>
        {work.category}
      </p>
      <h1 className={styles.title}>{work.title}</h1>
      <p className={styles.meta}>{work.year}</p>

      {work.tags && (
        <div className={styles.tags}>
          {work.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerStar} aria-hidden="true">✦</span>
      </div>

      {/* Thumbnail / image / embed, with body + tracklist alongside for music */}
      {hasMonths ? (
        <>
          {bodyContent}
          <div className={styles.yearGrid}>
            {work.months.map((m) => (
              <div key={m.month} className={styles.monthCard} style={{ '--accent': work.bg }}>
                {m.image ? (
                  <button
                    className={styles.monthFrame}
                    onClick={() => navigate(`/work/${work.id}/${m.month.toLowerCase()}`)}
                    aria-label={`View ${m.month} ${work.year}`}
                  >
                    <img
                      src={m.image}
                      alt={`${work.title} — ${m.month}`}
                      className={styles.monthImage}
                    />
                  </button>
                ) : (
                  <div className={`${styles.monthFrame} ${styles.monthFrameEmpty}`}>
                    <p className={styles.monthEmpty}>No piece this month</p>
                  </div>
                )}
                <p className={styles.monthLabel}>
                  <span className={styles.monthSpark} aria-hidden="true">✦</span>
                  {m.month}
                </p>
                {m.desc && <p className={styles.monthDesc}>{m.desc}</p>}
              </div>
            ))}
          </div>
        </>
      ) : isMusic ? (
        <div className={styles.musicLayout}>
          {thumbContent}
          <div className={styles.musicDetails}>
            {bodyContent}
            {linkContent}
            {tracklistContent}
          </div>
        </div>
      ) : (
        <>
          {thumbContent}
          {bodyContent}
          {linkContent}
          {tracklistContent}
        </>
      )}

      {/* Next / prev navigation */}
      <div className={styles.workNav}>
        {prevWork ? (
          <button
            className={styles.navBtn}
            onClick={() => navigate(`/work/${prevWork.id}`)}
          >
            <span className={styles.navArrow} aria-hidden="true">✦</span>
            <span className={styles.navText}>
              <span className={styles.navLabel}>Previous</span>
              <span className={styles.navTitle}>{prevWork.title}</span>
            </span>
          </button>
        ) : <span />}
        {nextWork ? (
          <button
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={() => navigate(`/work/${nextWork.id}`)}
          >
            <span className={styles.navText}>
              <span className={styles.navLabel}>Next</span>
              <span className={styles.navTitle}>{nextWork.title}</span>
            </span>
            <span className={styles.navArrow} aria-hidden="true">✦</span>
          </button>
        ) : <span />}
      </div>
    </div>
  )
}