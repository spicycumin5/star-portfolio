import { useNavigate } from 'react-router-dom'
import styles from './WorkCard.module.css'

export default function WorkCard({ work, index }) {
  const navigate = useNavigate()

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => navigate(`/work/${work.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/work/${work.id}`)}
      aria-label={`View ${work.title}`}
    >
      <div className={styles.thumb} style={{ background: work.bg }}>
        {work.image
          ? <img src={work.image} alt={work.title} className={styles.image} />
          : <span className={styles.emoji}>{work.emoji}</span>
        }
      </div>
      <div className={styles.body}>
        <p className={styles.category}>{work.category}</p>
        <p className={styles.title}>{work.title}</p>
        <p className={styles.desc}>{work.desc}</p>
        {work.tags && (
          <div className={styles.tags}>
            {work.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
