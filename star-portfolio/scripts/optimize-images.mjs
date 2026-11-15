// Re-encodes the photos and artwork under public/images as WebP, sized for
// the web, and writes each next to its original as <name>.webp. Source
// files are left in place so nothing is lost; once the .webp versions are
// referenced everywhere, the originals can be deleted.
//
//   node scripts/optimize-images.mjs            # only images with no .webp yet
//   node scripts/optimize-images.mjs --force    # re-encode everything
//
// Uses the locally installed Chrome (via Playwright) as the encoder, so
// there's no native image dependency to install. Chrome honours EXIF
// orientation when decoding, so phone photos come out the right way up.

import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join, extname, basename, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = fileURLToPath(new URL('../public/images/', import.meta.url))
// Site screenshots are already small captures; leave them alone.
const SKIP_DIRS = new Set(['sites'])
const MAX_EDGE = 1600
const QUALITY = 0.82
const RASTER = new Set(['.jpg', '.jpeg', '.png'])
const force = process.argv.includes('--force')

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...(await walk(full)))
    } else if (RASTER.has(extname(entry.name).toLowerCase())) {
      out.push(full)
    }
  }
  return out
}

const exists = (p) => stat(p).then(() => true, () => false)

const files = await walk(ROOT)
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()

let before = 0
let after = 0
for (const file of files) {
  const ext = extname(file)
  const out = join(dirname(file), basename(file, ext) + '.webp')
  if (!force && (await exists(out))) continue

  const buf = await readFile(file)
  const mime = ext.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`

  const result = await page.evaluate(
    async ({ dataUrl, maxEdge, quality }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
      const w = Math.max(1, Math.round(img.naturalWidth * scale))
      const h = Math.max(1, Math.round(img.naturalHeight * scale))
      const bitmap = await createImageBitmap(img, {
        resizeWidth: w,
        resizeHeight: h,
        resizeQuality: 'high',
      })
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(bitmap, 0, 0)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
      const bytes = new Uint8Array(await blob.arrayBuffer())
      let bin = ''
      for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
      }
      return { w, h, from: [img.naturalWidth, img.naturalHeight], b64: btoa(bin) }
    },
    { dataUrl, maxEdge: MAX_EDGE, quality: QUALITY }
  )

  const webp = Buffer.from(result.b64, 'base64')
  await writeFile(out, webp)
  before += buf.length
  after += webp.length
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  console.log(
    `${rel.padEnd(28)} ${result.from.join('x').padEnd(10)} → ${`${result.w}x${result.h}`.padEnd(10)} ` +
      `${(buf.length / 1024).toFixed(0).padStart(5)} KB → ${(webp.length / 1024).toFixed(0).padStart(4)} KB`
  )
}

await browser.close()
if (before) {
  console.log(
    `\nTotal ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB ` +
      `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`
  )
} else {
  console.log('Nothing to do — every image already has a .webp. Use --force to re-encode.')
}
