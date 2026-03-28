import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.left}>
          <p className={styles.eyebrow}>✦ About</p>
          <h2 className={styles.heading}>
            A creator who<br />
            navigates by <em>starlight</em>
          </h2>
          <div className={styles.body}>
            <p>
              I move between disciplines the way light moves through the dark —
              drawn to wherever something beautiful wants to emerge. My work spans
              music, visual art, writing, and software, each one informing the
              others in ways I'm still discovering.
            </p>
            <p>
              Based in [Your City]. Open to collaborations that feel like
              constellations: distinct points of light, connected into something
              larger.
            </p>
            <p>
              This portfolio is a living map of where I've been and where I'm
              going. Every piece is a star I've added to the sky.
            </p>
          </div>

          {/* CV / Resume link */}
          <a href="#" className={styles.cvLink}>
            Download CV ↗
          </a>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          <ul className={styles.disciplines}>
            {[
              { label: 'Music & Sound', detail: 'Composition, production, sound design' },
              { label: 'Visual Art', detail: 'Painting, illustration, mixed media' },
              { label: 'Writing & Poetry', detail: 'Essays, fiction, prose poetry' },
              { label: 'Software & Code', detail: 'Web, generative tools, open source' },
              { label: 'Collaboration', detail: 'Direction, creative consultation' },
            ].map((d) => (
              <li key={d.label} className={styles.discipline}>
                <span className={styles.star}>✦</span>
                <div>
                  <p className={styles.disciplineLabel}>{d.label}</p>
                  <p className={styles.disciplineDetail}>{d.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Selected exhibitions / releases / credits */}
          <div className={styles.credits}>
            <p className={styles.creditsHeading}>Selected</p>
            {[
              { year: '2024', text: 'Dusk Transmissions EP released' },
              { year: '2024', text: 'Cartography of Elsewhere — Group show, [Gallery]' },
              { year: '2023', text: 'Between the Coordinates shortlisted, [Prize]' },
              { year: '2023', text: 'Signal & Noise LP released' },
              { year: '2022', text: 'Luminiferous — Solo exhibition, [Gallery]' },
            ].map((c, i) => (
              <div key={i} className={styles.credit}>
                <span className={styles.creditYear}>{c.year}</span>
                <span className={styles.creditText}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
