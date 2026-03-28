import { useRef } from 'react'
import { useStarfield } from '../hooks/useStarfield'
import styles from './StarCanvas.module.css'

export default function StarCanvas() {
  const canvasRef = useRef(null)
  useStarfield(canvasRef)
  return <canvas ref={canvasRef} className={styles.canvas} />
}
