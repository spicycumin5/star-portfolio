import { useState } from 'react'
import styles from './Contact.module.css'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/spicy_cumin/' },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/0eXb6b1Yb9KjcVmcfNeEqj?si=Upc_z7qoRD61ELM6VprfWw' },
  { label: 'GitHub', href: 'https://github.com/spicycumin5' },
  { label: 'Substack', href: 'https://substack.com/@kyuminhan?r=5zk61m&utm_campaign=profile&utm_medium=profile-page' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kyumin5/' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: wire up to your email service (EmailJS, Formspree, etc.)
    console.log('Form submitted:', form)
    setSent(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>✦ Contact</p>
        <h2 className={styles.heading}>
          Let's connect!
        </h2>
        <p className={styles.sub}>
        </p>

        {sent ? (
          <div className={styles.thanks}>
            <p className={styles.thanksStar}>✦</p>
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
            <button type="submit" className={styles.submit}>
              Send message →
            </button>
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
