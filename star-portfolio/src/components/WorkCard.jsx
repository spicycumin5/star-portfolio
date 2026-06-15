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
      <div
        className={`${styles.thumb} ${work.category === 'music' ? styles.thumbSquare : ''}`}
        style={{ background: work.bg }}
      >
        {work.image
          ? <img src={work.image} alt={work.title} className={styles.image} />
          : <span className={styles.emoji}>{work.emoji}</span>
        }
      </div>
      <div className={styles.meta}>
        <p className={styles.category}>
          <span className={styles.spark}>✦</span>
          {work.category}
        </p>
        <h3 className={styles.title}>{work.title}</h3>
      </div>
    </article>
  )
}
