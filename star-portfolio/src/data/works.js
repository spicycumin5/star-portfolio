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
      { title: 'Intro: Room', 
        desc: 'The introduction to the EP, symbolizing the escape from my room. A bittersweet recognition that there truly is a whole world beyond its doors.',
        link: 'https://open.spotify.com/track/1cxcQjDNRql8P0Hv2rPzor?si=e6f994e961c14757' },
      { title: 'Memories', 
        desc: 'A j-rock song, declaring that there is no need for memories - beyond the regrets, what one does now is what truly matters.',
        link: 'https://open.spotify.com/track/1lGp3DUpicTdbzbsLAzwTF?si=305665b4e2cd4da0' },
      { title: 'You!', 
        desc: 'A bashful, naive love song to a certain someone', 
        link: 'https://open.spotify.com/track/58BZi71E8guZNb0ZjjjsX2?si=ffa23ea4aee5431c' },
      { title: 'Star Pt.2', 
        desc: 'The second part to a song series exploring the cosmic wonder of stars',
        link: 'https://open.spotify.com/track/0jkZn93coAIgmRwofsc5cN?si=0837f2406e564833' },
      { title: 'Wind', 
        desc: 'To the passing of my grandfather, a reflection on the gentle ruthlessness of time',
        link: 'https://open.spotify.com/track/3bn9ArDq38CC8ZH2knOP57?si=4fbee9ba829c4147' },
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
    body: `Sundays is a short video diary following a season of Sunday mornings spent with a church community. The footage moves through the mundane: conversations, shared meals, walks between buildings — and the parts of the day that made me fall in love with the church.  
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
    title: 'An Argument For Art',
    year: '2022',
    desc: 'A philisophical argument responding to the question, "What is art?"',
    tags: ['essays', 'aesthetics'],
    body: `"An Argument For Art" is an essay tackling the task of defining art.`,
    link: 'https://docs.google.com/document/d/14tgC1o3rCUr5cTyCvMYzp2JoQ5D__coOr9TFqmb3HKE/edit?usp=sharing',
    linkLabel: 'Read Here',
  },
  {
    id: 8,
    category: 'code',
    emoji: '⟨/⟩',
    bg: '#0a1520',
    title: 'Spaces',
    year: '2026',
    desc: 'Wonder what the sky looked like during a special moment in your life? Spaces is a web app that shows you the night sky from any place and time. ',
    tags: ['TypeScript', 'React', 'Next.js'],
    body: `Built with React and Next.js, Spaces uses an open-source astronomy library to render accurate star maps. Users can input any date, time, and location to see a personalized night sky... a constellation of the moments that matter to them.`,
    link: 'https://spaces-kyu.vercel.app/',
    linkLabel: 'Try it here',
  },
  {
    id: 9,
    category: 'code',
    emoji: '⟨/⟩',
    bg: '#0a1520',
    title: 'VolleyVision',
    year: '2026',
    desc: 'Hackathon hosted by StatsPerform, build with Evan Inrig and Jason Press',
    tags: ['TypeScript', 'React', 'Next.js'],
    body: `VolleyVision is an ai-powered tool designed to provide detailed analytics and visualizations for volleyball games. It allows users to analyze player movements, ball trajectories, and game statistics of pre-recorded volleyball footage`,
    link: 'https://volleyvision-kyu.vercel.app/',
    linkLabel: 'Try it here',
  },
]

export const CATEGORIES = ['all', 'video', 'music', 'art', 'writing', 'code']
