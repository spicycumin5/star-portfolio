import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.left}>
          <p className={styles.eyebrow}>✦ About</p>
          <h2 className={styles.heading}>
            <br />
            <em>About Me</em>
          </h2>
          <div className={styles.body}>
            <p>
              Hello! My name is Kyumin Han, and I'm a growing developer working 
              at the intersection of music, visual arts, writing, and code. 
              
            </p>
            <p>
              I'm currently based in the Bay Area and I'm seeking out opportunities that will allow me to
              continue exploring all that I've yet to discover while learning new skills along the way.
            </p>
            <p>
              This portfolio is a map of where I've been and where I'm
              going! 
              Thank you for visiting, I hope you have a wonderful day!
            </p>
          </div>

          {/* CV / Resume link — drop your PDF at public/resume.pdf */}
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className={styles.cvLink}>
            Download Resume ↗
          </a>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          <div className={styles.portrait}>
            <img src="/images/seaside-headshot.jpg" alt="Portrait of Kyumin Han" />
          </div>

          <ul className={styles.disciplines}>
            {[
              { label: 'Music & Sound', detail: 'Composition, Production, Songwriting' },
              { label: 'Visual Art & Videography', detail: 'Painting, Illustration, Mixed media' },
              { label: 'Writing & Reflection', detail: 'Essays, Blogs, Poetry' },
              { label: 'Software & Code', detail: 'Web, Projects, Development' },
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
            <p className={styles.creditsHeading}>Release History</p>
            {[
              { year: '2026', text: ['Album soon'] },
              { year: '2025', text: 'Beloved single released' },
              { year: '2024', text: 'To:Day EP released' },
              { year: '2022', text: 'To:Morrow EP released' },
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
