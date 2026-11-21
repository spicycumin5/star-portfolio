import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { WORKS } from '../data/works'
import CodeLinkCard from '../components/CodeLinkCard'
import { getVideoEmbedUrl, getSourceHost } from '../utils/embeds'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './WorkDetail.module.css'

// Project notes shown on code pieces (see the works.js header). Each is
// optional; only the ones a work fills in are rendered, in this order.
const PROJECT_NOTE_FIELDS = [
  ['problem', 'The problem'],
  ['built', 'What I built'],
  ['role', 'My role'],
  ['learned', 'What I learned'],
]

export default function WorkDetail() {
  const { id } = useParams()
  const workIndex = WORKS.findIndex((w) => w.id === Number(id))
  const work = workIndex !== -1 ? WORKS[workIndex] : undefined
  const [openTrack, setOpenTrack] = useState(null)
  const [artAspect, setArtAspect] = useState(null)
  const prevWork = workIndex > 0 ? WORKS[workIndex - 1] : null
  const nextWork = workIndex !== -1 && workIndex < WORKS.length - 1 ? WORKS[workIndex + 1] : null

  usePageMeta({
    title: work ? work.title : 'Piece not found',
    description: work?.desc,
    image: work?.image,
  })

  useEffect(() => {
    setArtAspect(null)
  }, [work?.id])

  if (!work) {
    return (
      <div className={styles.notFound}>
        <p>Piece not found.</p>
        <Link className={styles.back} to="/">
          ← Back to work
        </Link>
      </div>
    )
  }

  const embedUrl = getVideoEmbedUrl(work.link)
  const isArt = work.category === 'art'
  const isMusic = work.category === 'music'
  const hasMonths = Array.isArray(work.months)

  const hasVisual = Boolean(embedUrl || work.image || work.category === 'code')
  const sourceHost = getSourceHost(work.link)

  // Pieces with no visual component (essays, mostly) skip the frame
  // entirely and lead with their tagline as an epigraph instead.
  const epigraphContent = work.desc && (
    <figure className={styles.epigraph}>
      <span className={styles.epigraphMark} aria-hidden="true">“</span>
      <blockquote className={styles.epigraphText}>{work.desc}</blockquote>
      {sourceHost && (
        <figcaption className={styles.epigraphSource}>
          <span aria-hidden="true">✦</span> {sourceHost}
        </figcaption>
      )}
    </figure>
  )

  const thumbContent = !hasVisual ? epigraphContent : (
    <div className={styles.thumbFrame}>
      {embedUrl ? (
        <div className={styles.videoFrame}>
          <iframe
            src={embedUrl}
            title={work.title}
            className={styles.videoIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
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
          <img
            src={work.image}
            alt={work.title}
            className={styles.image}
            onLoad={isArt ? (e) => setArtAspect(e.target.naturalWidth / e.target.naturalHeight) : undefined}
          />
        </div>
      )}
    </div>
  )

  const bodyContent = work.body && (
    <div className={styles.body}>
      {work.body.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )

  // Code pieces get a structured case study when the data provides one:
  // the problem, what was built, the role, the stack, the lesson.
  const hasNotes =
    work.category === 'code' &&
    (PROJECT_NOTE_FIELDS.some(([key]) => work[key]) || work.stack?.length)
  const notesContent = hasNotes && (
    <dl className={styles.notes}>
      {PROJECT_NOTE_FIELDS.map(
        ([key, label]) =>
          work[key] && (
            <div key={key} className={styles.note}>
              <dt className={styles.noteLabel}>{label}</dt>
              <dd className={styles.noteBody}>{work[key]}</dd>
            </div>
          )
      )}
      {work.stack?.length > 0 && (
        <div className={styles.note}>
          <dt className={styles.noteLabel}>Stack</dt>
          <dd className={styles.noteBody}>
            <ul className={styles.stack}>
              {work.stack.map((item) => (
                <li key={item} className={styles.stackItem}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      )}
    </dl>
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
                <span className={styles.trackNumber}>{String(i + 1).padStart(2, '0')}</span>
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

      <Link className={styles.back} to="/">
        ← Back to work
      </Link>

      <p className={styles.category}>
        <span className={styles.categorySpark} aria-hidden="true">✦</span>
        {work.category}
      </p>
      <h1 className={styles.title}>{work.title}</h1>

      <div className={styles.logMeta}>
        <p className={styles.logMetaRow}>
          <span className={styles.logMetaLabel}>Cat. No.</span>
          {String(work.id).padStart(3, '0')}
        </p>
        <p className={styles.logMetaRow}>
          <span className={styles.logMetaLabel}>Logged</span>
          {work.year}
        </p>
        {work.tags && (
          <p className={styles.logMetaRow}>
            <span className={styles.logMetaLabel}>Medium</span>
            {work.tags.join(' · ')}
          </p>
        )}
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
      </div>

      {/* Thumbnail / image / embed, with body + tracklist alongside for music */}
      {hasMonths ? (
        <>
          {bodyContent}
          <div className={styles.yearGrid}>
            {work.months.map((m) => (
              <div key={m.month} className={styles.monthCard} style={{ '--accent': work.bg }}>
                {m.image ? (
                  <Link
                    className={styles.monthFrame}
                    to={`/work/${work.id}/${m.month.toLowerCase()}`}
                    aria-label={`View ${m.month} ${work.year}`}
                  >
                    <img
                      src={m.image}
                      alt={`${work.title} — ${m.month}`}
                      className={styles.monthImage}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                ) : (
                  <div className={`${styles.monthFrame} ${styles.monthFrameEmpty}`}>
                    <p className={styles.monthEmpty}>No piece this month</p>
                  </div>
                )}
                <p className={styles.monthLabel}>{m.month}</p>
              </div>
            ))}
          </div>
        </>
      ) : isMusic && hasVisual ? (
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
          {notesContent}
          {linkContent}
          {tracklistContent}
        </>
      )}

      {/* Next / prev navigation */}
      <div className={styles.workNav}>
        {prevWork ? (
          <Link
            className={styles.navBtn}
            to={`/work/${prevWork.id}`}
          >
            <span className={styles.navArrow} aria-hidden="true">←</span>
            <span className={styles.navText}>
              <span className={styles.navLabel}>Previous</span>
              <span className={styles.navTitle}>{prevWork.title}</span>
            </span>
          </Link>
        ) : <span />}
        {nextWork ? (
          <Link
            className={`${styles.navBtn} ${styles.navNext}`}
            to={`/work/${nextWork.id}`}
          >
            <span className={styles.navText}>
              <span className={styles.navLabel}>Next</span>
              <span className={styles.navTitle}>{nextWork.title}</span>
            </span>
            <span className={styles.navArrow} aria-hidden="true">→</span>
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}