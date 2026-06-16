import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useStarfield } from '../hooks/useStarfield'
import styles from './StarCanvas.module.css'

export default function StarCanvas() {
  const canvasRef = useRef(null)
  const { pathname } = useLocation()
  useStarfield(canvasRef, pathname)
  return <canvas ref={canvasRef} className={styles.canvas} />
}
