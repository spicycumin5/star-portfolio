import { useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import styles from './Contact.module.css'

// Messages are delivered by Formspree (https://formspree.io): sign up, create
// a form, and paste its ID here (the short code after /f/ in the endpoint,
// e.g. 'xabcdefg'). Until it's set, the form says so instead of pretending
// a message went through. Form IDs are public by design, so it's fine to
// commit this.
const FORMSPREE_FORM_ID = ''

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/spicy_cumin/' },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/0eXb6b1Yb9KjcVmcfNeEqj?si=Upc_z7qoRD61ELM6VprfWw' },
  { label: 'GitHub', href: 'https://github.com/spicycumin5' },
  { label: 'Substack', href: 'https://substack.com/@kyuminhan?r=5zk61m&utm_campaign=profile&utm_medium=profile-page' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kyumin5/' },
]

// The same sparkle silhouette the constellation stars bloom into on hover —
// reused here so sending a message reads as "launching a star" rather than
// a generic form-submit checkmark.
function StarIcon({ className }) {
  return (
    <svg viewBox="-3 -3 6 6" className={className} aria-hidden="true">
      <path d="M2.6,0 L0.65,0.65 L0,2.6 L-0.65,0.65 L-2.6,0 L-0.65,-0.65 L0,-2.6 L0.65,-0.65 Z" />
    </svg>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  usePageMeta({ title: 'Contact', description: 'Get in touch with Kyumin Han.' })

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!FORMSPREE_FORM_ID) {
      setError("This form isn't connected yet — please reach out through one of the links below.")
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: `Portfolio message from ${form.name}`,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.errors?.map((err) => err.message).join(' ') || `Request failed (${res.status})`)
      }
      setSent(true)
    } catch (err) {
      setError(
        `Couldn't send that (${err.message}). Please try again, or reach out through one of the links below.`
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>✦ Contact</p>
        <h2 className={styles.heading}>
          Let's connect!
        </h2>

        {sent ? (
          <div className={styles.thanks}>
            <StarIcon className={styles.thanksStar} />
            <p className={styles.thanksHeading}>Message received.</p>
            <p className={styles.thanksSub}>Thank you for reaching out!</p>
            <button className={styles.resetBtn} onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}>
              Send another
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Your name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Your message…"
                value={form.message}
                onChange={handleChange}
                required
                className={styles.textarea}
                rows={5}
              />
            </div>
            <button
              type="submit"
              className={`${styles.submit} ${sending ? styles.sending : ''}`}
              disabled={sending}
            >
              {sending ? 'Sending' : 'Send message'}
              <StarIcon className={styles.submitStar} />
            </button>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </form>
        )}

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
