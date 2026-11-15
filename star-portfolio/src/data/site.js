// Site-wide metadata. Shared by the in-app page titles (usePageMeta) and
// the build step that writes per-page <head> tags for link previews
// (scripts/prerender-meta.mjs).
//
// SITE_URL: the public origin, no trailing slash — e.g. 'https://kyumin.dev'.
// Link previews on Slack/iMessage/LinkedIn need absolute image URLs, so
// until this is filled in, share cards fall back to a relative image path
// (which most scrapers ignore).
export const SITE_URL = ''

export const SITE_NAME = 'Kyumin Han'
export const DEFAULT_TITLE = 'Kyumin Han — Field notes from a working observatory'
export const DEFAULT_DESCRIPTION =
  'A multidisciplinary portfolio of music, art, video, writing, and code by Kyumin Han, charted across five instruments of one working sky.'
export const DEFAULT_IMAGE = '/images/seaside-headshot.webp'

export function absoluteUrl(path) {
  if (!path) return path
  if (/^https?:\/\//.test(path)) return path
  return SITE_URL ? `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}` : path
}

// Readable name for where an external piece lives ("Substack", "GitHub").
export function sourceName(url) {
  if (!url) return null
  let host
  try {
    host = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
  if (host.endsWith('substack.com')) return 'Substack'
  if (host.endsWith('medium.com')) return 'Medium'
  if (host.endsWith('github.com')) return 'GitHub'
  if (host === 'docs.google.com') return 'Google Docs'
  if (host.endsWith('spotify.com')) return 'Spotify'
  if (host.endsWith('youtube.com') || host === 'youtu.be') return 'YouTube'
  return host
}
