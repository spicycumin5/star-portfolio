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
// ─────────────────────────────────────────────────────────────

export const WORKS = [
  {
    id: 1,
    category: 'music',
    emoji: '🎵',
    bg: '#1a1330',
    title: 'Dusk Transmissions',
    year: '2024',
    desc: 'An ambient EP exploring the threshold between day and night.',
    tags: ['ambient', 'electronic', 'EP'],
    body: `Dusk Transmissions is a five-track ambient EP composed over six months of late evenings. Each track represents a specific quality of dusk light — the way color drains slowly, how silence deepens.

Recorded with field recordings, synthesizers, and treated guitar. Mastered for spatial listening; headphones recommended.`,
    link: '#',
    linkLabel: 'Listen on Spotify',
  },
  {
    id: 2,
    category: 'art',
    emoji: '🎨',
    bg: '#0d1a1d',
    title: 'Cartography of Elsewhere',
    year: '2024',
    desc: 'Ink and gouache pieces mapping imagined geographies.',
    tags: ['ink', 'gouache', 'series'],
    body: `A series of twelve works on paper, each depicting a landscape from no known map. The project began as a meditation on longing — the feeling of missing a place you've never been.

Ink outlines dissolve into washes of gouache; borders are deliberately ambiguous. Each piece is 18" × 24", framed.`,
  },
  {
    id: 3,
    category: 'writing',
    emoji: '✒️',
    bg: '#13100a',
    title: 'Between the Coordinates',
    year: '2023',
    desc: 'A collection of prose poems about navigation and memory.',
    tags: ['poetry', 'prose', 'collection'],
    body: `Fourteen prose poems arranged as a journey. The speaker moves through physical and emotional terrain — airports, childhood homes, bodies of water — trying to locate something that keeps moving.

The work was shortlisted for the [Prize Name] in 2023.`,
    link: '#',
    linkLabel: 'Read an excerpt',
  },
  {
    id: 4,
    category: 'code',
    emoji: '⟨/⟩',
    bg: '#0a1520',
    title: 'Starfield Engine',
    year: '2024',
    desc: 'A generative visual tool for creating animated star systems.',
    tags: ['WebGL', 'generative', 'open source'],
    body: `An interactive browser-based engine for generating procedural starfields. Users control density, drift speed, parallax depth, and color temperature.

Built with vanilla JS and WebGL. Open source on GitHub. Used by several small game studios for atmospheric backgrounds.`,
    link: '#',
    linkLabel: 'View on GitHub',
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

export const CATEGORIES = ['all', 'music', 'art', 'writing', 'code']
