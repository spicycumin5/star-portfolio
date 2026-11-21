import { useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './Contact.module.css'

const EMAIL = 'hankyumin5@gmail.com'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/spicy_cumin/' },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/0eXb6b1Yb9KjcVmcfNeEqj?si=Upc_z7qoRD61ELM6VprfWw' },
  { label: 'GitHub', href: 'https://github.com/spicycumin5' },
  { label: 'Substack', href: 'https://substack.com/@kyuminhan?r=5zk61m&utm_campaign=profile&utm_medium=profile-page' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kyumin5/' },
]

// The same sparkle silhouette the constellation stars bloom into on hover.
function StarIcon({ className }) {
  return (
    <svg viewBox="-3 -3 6 6" className={className} aria-hidden="true">
      <path d="M2.6,0 L0.65,0.65 L0,2.6 L-0.65,0.65 L-2.6,0 L-0.65,-0.65 L0,-2.6 L0.65,-0.65 Z" />
    </svg>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  usePageMeta({ title: 'Contact', description: 'Get in touch with Kyumin Han.' })

  // mailto: does nothing for visitors without a mail app set up (common on
  // desktop webmail users), so the address can also be copied in one click.
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard blocked — the address is still visible to select. */
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>✦ Contact</p>
        <h1 className={styles.heading}>Let's connect!</h1>
        <p className={styles.lede}>
          For work, collaborations, or just to say hello, email is the best way to reach me.
        </p>

        <div className={styles.emailBlock}>
          <a href={`mailto:${EMAIL}`} className={styles.emailLink}>
            <span translate="no">{EMAIL}</span>
            <StarIcon className={styles.emailStar} />
          </a>
          <button type="button" className={styles.copyBtn} onClick={copyEmail}>
            {copied ? 'Copied' : 'Copy Email'}
          </button>
          <span className={styles.srOnly} aria-live="polite">
            {copied ? 'Email address copied to clipboard' : ''}
          </span>
        </div>

        <div className={styles.socialRow}>
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.href} className={styles.socialLink} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
