import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './WorkDetail.module.css'

export default function NotFound() {
  usePageMeta({ title: 'Nothing charted here' })
  return (
    <div className={styles.notFound}>
      <p>Nothing charted at these coordinates.</p>
      <Link className={styles.back} to="/">
        ← Back to the sky
      </Link>
    </div>
  )
}
