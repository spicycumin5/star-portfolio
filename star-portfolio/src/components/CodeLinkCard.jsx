import { useEffect, useState } from 'react'
import { parseGithubUrl } from '../utils/embeds'
import styles from './CodeLinkCard.module.css'

export default function CodeLinkCard({ work }) {
  const gh = parseGithubUrl(work.link)
  const [repo, setRepo] = useState(null)

  useEffect(() => {
    setRepo(null)
    if (!gh) return
    let cancelled = false

    fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setRepo(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [gh?.owner, gh?.repo])

  const hasLink = work.link && work.link !== '#'
  const title = repo?.name || work.title
  const description = repo?.description || work.desc
  const linkLabel = work.linkLabel || (gh ? 'View on GitHub' : 'Visit site')

  return (
    <div className={styles.card} style={{ '--accent': work.bg }}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">{work.emoji || '⟨/⟩'}</span>
        <div>
          <p className={styles.title}>{title}</p>
          {gh && <p className={styles.repoPath}>{gh.owner}/{gh.repo}</p>}
        </div>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      {repo && (
        <div className={styles.stats}>
          {repo.language && <span className={styles.stat}>{repo.language}</span>}
          {typeof repo.stargazers_count === 'number' && (
            <span className={styles.stat}>
              <span aria-hidden="true">✦</span> {repo.stargazers_count}
            </span>
          )}
        </div>
      )}

      {hasLink && (
        <a href={work.link} target="_blank" rel="noreferrer" className={styles.link}>
          {linkLabel} ↗
        </a>
      )}
    </div>
  )
}
