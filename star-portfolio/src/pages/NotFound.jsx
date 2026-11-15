import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './WorkDetail.module.css'

export default function NotFound() {
  const navigate = useNavigate()
  usePageMeta({ title: 'Nothing charted here' })
  return (
    <div className={styles.notFound}>
      <p>Nothing charted at these coordinates.</p>
      <button className={styles.back} onClick={() => navigate('/')}>
        ← Back to the sky
      </button>
    </div>
  )
}
