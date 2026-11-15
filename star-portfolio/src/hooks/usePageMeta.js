import { useEffect } from 'react'
import {
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  absoluteUrl,
} from '../data/site'

function setMeta(selector, attrs, content) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Keeps the tab title and share tags in step with the page being viewed.
// (Scrapers that build link previews don't run this — the build step in
// scripts/prerender-meta.mjs writes the same tags into static HTML for
// them. This covers tabs, history, bookmarks and in-app navigation.)
export function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    const img = absoluteUrl(image || DEFAULT_IMAGE)
    document.title = fullTitle
    setMeta('meta[name="description"]', { name: 'description' }, desc)
    setMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle)
    setMeta('meta[property="og:description"]', { property: 'og:description' }, desc)
    setMeta('meta[property="og:image"]', { property: 'og:image' }, img)
  }, [title, description, image])
}
