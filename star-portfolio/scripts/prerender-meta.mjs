// Runs after `vite build`. The site is a single-page app, so every route
// would otherwise ship the same <head>; link-preview scrapers (Slack,
// iMessage, LinkedIn, Twitter) don't run JavaScript and would show the
// home page's title and image for every work. This writes a copy of
// dist/index.html per route with that page's own title, description and
// image swapped in. Vercel serves these static files ahead of the SPA
// rewrite in vercel.json, and the app still boots normally from them.
//
//   node scripts/prerender-meta.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WORKS } from '../src/data/works.js'
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  absoluteUrl,
} from '../src/data/site.js'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const template = await readFile(join(DIST, 'index.html'), 'utf8')

const escapeAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function render({ title, description, image, path }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
  const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim()
  const img = absoluteUrl(image || DEFAULT_IMAGE)
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${escapeAttr(desc)}$2`
    )
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(fullTitle)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttr(desc)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escapeAttr(img)}$2`)
  if (SITE_URL) {
    const url = `${SITE_URL}${path}`
    html = html.replace(
      '</head>',
      `    <link rel="canonical" href="${escapeAttr(url)}" />\n    <meta property="og:url" content="${escapeAttr(url)}" />\n  </head>`
    )
  }
  return html
}

const pages = [
  { path: '/', title: null, description: null, image: null },
  { path: '/about', title: 'About', description: `Who ${SITE_NAME} is and what they make.` },
  { path: '/contact', title: 'Contact', description: `Get in touch with ${SITE_NAME}.` },
]
for (const work of WORKS) {
  pages.push({
    path: `/work/${work.id}`,
    title: work.title,
    description: work.desc || work.body?.split('\n')[0] || null,
    image: work.image || null,
  })
  if (Array.isArray(work.months)) {
    for (const m of work.months) {
      if (!m.image) continue
      pages.push({
        path: `/work/${work.id}/${m.month.toLowerCase()}`,
        title: `${m.month} ${work.year}`,
        description: m.desc || work.desc || null,
        image: m.image,
      })
    }
  }
}

let count = 0
for (const page of pages) {
  const html = render(page)
  if (page.path === '/') {
    await writeFile(join(DIST, 'index.html'), html)
  } else {
    const dir = join(DIST, page.path.slice(1))
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), html)
  }
  count++
}
console.log(`prerendered <head> for ${count} routes${SITE_URL ? '' : ' (set SITE_URL in src/data/site.js for absolute share images and canonical links)'}`)
