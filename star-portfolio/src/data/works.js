// ─────────────────────────────────────────────────────────────
//  works.js  –  Your portfolio content lives here.
//  Add, edit, or remove entries freely.
//  Each entry supports:
//    id       (unique number)
//    category ('music' | 'art' | 'writing' | 'code')
//    emoji    (shown as thumbnail placeholder — swap with image path later)
//    bg       (thumbnail background color)
//    title    string
//    year     string
//    desc     short tagline shown on the card
//    tags     array of strings (optional)
//    body     long description shown on the detail page
//    link     external URL (optional — e.g. SoundCloud, GitHub)
//    linkLabel text for the external link button (optional)
//    tracks   optional array of { title, desc, link, linkLabel } —
//             renders an expandable tracklist on the detail page,
//             letting visitors click into individual songs/pieces.
// ─────────────────────────────────────────────────────────────

export const WORKS = [
  {
    id: 1,
    category: 'music',
    image: '/images/today.png',
    emoji: ' :) ',
    bg: '#1a1330',
    title: 'To:Day',
    year: '2023',
    desc: "KYUMIN's second EP — an adolescent exploration of the day-to-day",
    tags: ['pop', 'electronic', 'ballad', 'bedroom'],
    body: `To:Day is a five-track pop EP produced in 2022.

Recorded with field recordings, synthesizers, and treated guitar. Mastered for spatial listening; headphones recommended.`,
    link: 'https://open.spotify.com/album/1Hn5BrcclmasBLt7oID1zz?si=A4kXq7MQRgqtLDGMd3FhcQ',
    linkLabel: 'Listen on Spotify',
    // TODO: replace these placeholders with the real tracklist — update
    // each title/desc, and add a `link`/`linkLabel` (e.g. the individual
    // Spotify track URL) for songs you'd like listeners to jump to.
    tracks: [
      { title: 'Track 1', desc: 'Add a short description of this track.' },
      { title: 'Track 2', desc: 'Add a short description of this track.' },
      { title: 'Track 3', desc: 'Add a short description of this track.' },
      { title: 'Track 4', desc: 'Add a short description of this track.' },
      { title: 'Track 5', desc: 'Add a short description of this track.' },
    ],
  },

  {
    id: 2,
    category: 'music',
    image: '/images/beloved.jpg',
    emoji: '🎨',
    bg: '#0d1a1d',
    title: 'Beloved',
    year: '2024',
    desc: 'A collaboration with Claire Chow',
    tags: ['worship', 'piano', 'strings'],
    body: 'Beloved is a worship song co-written with Claire Chow. The track features piano, strings, and a soft ambient wash that builds gradually beneath the vocals — written as a quiet, intimate offering of gratitude.',
    link: 'https://open.spotify.com/track/749HmPIhyynPYkLGJpI6Sv?si=c8c4aa0f58d047b7',
    linkLabel: 'Listen on Spotify',
    
  },

  {
    id: 3,
    category: 'video',
    image: '/images/sundays.jpg',
    emoji: '✒️',
    bg: '#13100a',
    title: 'Sundays',
    year: '2023',
    desc: 'A vlog of Sundays spent in church community, exploring themes of christ-centeredness, fun, and belonging',
    tags: ['video', 'vlog', 'b-roll'],
    body: `Sundays is a short video diary following a season of Sunday mornings spent with a church community. The footage moves between quiet moments before and after the service — conversation, shared meals, walks between buildings — and the parts of the day that don't make it into a typical highlight reel.

At its core, it's about belonging: what it feels like to be known by a group of people who keep showing up, week after week, centered on the same thing.`,
    link: 'https://youtu.be/_ZKW52p5v8g',
    linkLabel: 'Watch on Youtube',
  },
  {
    id: 4,
    category: 'music',
    emoji: '🎤',
    bg: '#1a1330',
    title: 'Love Wins All - Cover',
    year: '2024',
    desc: 'A cover of "Love Wins All" by IU',
    tags: ['video', 'music', 'cover'],
    body: `Love Wins All is a cover of the IU song of the same name, recorded as a tribute to one of the artists who shaped KYUMIN's ear for melody and arrangement.

The vocal and instrumentation lean close to the original's spare, emotional arrangement — a deliberate choice to let the song's melody carry the performance.`,
    link: 'https://youtu.be/ZV4Re9Z5eWc?si=T6Hm-IG04d5t_dsj',
    linkLabel: 'Watch on YouTube',
  },
  {
    id: 5,
    category: 'music',
    emoji: '🎵',
    bg: '#1a1330',
    title: 'Signal & Noise',
    year: '2023',
    desc: 'Electronic compositions built from found sound and synthesis.',
    tags: ['electronic', 'found sound', 'album'],
    body: `Signal & Noise is a 40-minute album that blurs the line between composition and documentation. Source material includes recordings from train stations, hospital waiting rooms, and thunderstorms, woven into rhythmic structures.`,
  },
  {
    id: 6,
    category: 'art',
    emoji: '🎨',
    bg: '#0d1a1d',
    title: 'Luminiferous',
    year: '2023',
    desc: 'Oil paintings examining how light behaves near water.',
    tags: ['oil', 'painting', 'light'],
    body: `A series of eight large-format oil paintings. Each piece focuses on a different phenomenon: reflection, refraction, caustics, diffusion.

The works aim not to depict light but to enact it — to make the canvas itself seem to generate illumination.`,
  },
  {
    id: 7,
    category: 'writing',
    emoji: '✒️',
    bg: '#13100a',
    title: 'The Quiet Atlas',
    year: '2022',
    desc: 'Long-form essays on place, attention, and slowness.',
    tags: ['essays', 'nonfiction', 'place'],
    body: `A collection of five long-form essays. Each essay takes a single location as its subject — a mountain pass, a seaside library, a desert town — and attempts to describe it with total fidelity.

The project is as much about the limits of language as about geography.`,
  },
  {
    id: 8,
    category: 'code',
    emoji: '⟨/⟩',
    bg: '#0a1520',
    title: 'Resonance',
    year: '2023',
    desc: 'A web app that visualizes audio as living geometry.',
    tags: ['Web Audio API', 'Canvas', 'visualization'],
    body: `Resonance is a real-time audio visualization tool. It captures microphone input and renders it as breathing geometric forms using the Web Audio API and Canvas.

The shapes are driven by frequency data, so each voice, instrument, or environment produces a unique visual signature.`,
    link: '#',
    linkLabel: 'Try it live',
  },
]

export const CATEGORIES = ['all', 'video', 'music', 'art', 'writing', 'code']
