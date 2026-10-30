// Captures a screenshot of each live code project's site into
// public/images/sites/<id>.jpg, for use as its thumbnail.
//
//   node scripts/capture-sites.mjs           # only missing screenshots
//   node scripts/capture-sites.mjs --force   # recapture everything
//   node scripts/capture-sites.mjs 8 30      # just these ids

import { mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { WORKS } from '../src/data/works.js'
import { parseGithubUrl } from '../src/utils/embeds.js'

const OUT_DIR = fileURLToPath(new URL('../public/images/sites/', import.meta.url))
const args = process.argv.slice(2)
const force = args.includes('--force')
const onlyIds = args.filter((a) => /^\d+$/.test(a)).map(Number)

const exists = (path) => access(path).then(() => true, () => false)

const targets = WORKS.filter(
  (w) =>
    w.category === 'code' &&
    w.link &&
    w.link !== '#' &&
    !parseGithubUrl(w.link) &&
    (onlyIds.length === 0 || onlyIds.includes(w.id))
)

await mkdir(OUT_DIR, { recursive: true })

// Uses the locally installed Chrome, so no browser download is needed.
const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'dark',
})

for (const work of targets) {
  const file = `${OUT_DIR}${work.id}.jpg`
  if (!force && onlyIds.length === 0 && (await exists(file))) {
    console.log(`skip  ${work.id} ${work.title} (exists)`)
    continue
  }

  const page = await context.newPage()
  try {
    await page.goto(work.link, { waitUntil: 'load', timeout: 45000 })
    // Sites that keep a connection open never go idle, so cap the wait.
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    // Let entrance animations settle before capturing.
    await page.waitForTimeout(2500)
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 })
    console.log(`ok    ${work.id} ${work.title}`)
  } catch (err) {
    console.log(`fail  ${work.id} ${work.title}: ${err.message.split('\n')[0]}`)
  } finally {
    await page.close()
  }
}

await browser.close()
