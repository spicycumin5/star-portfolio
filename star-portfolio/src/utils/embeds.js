// Helpers for turning a plain `link` URL into an embeddable player or a
// parsed GitHub repo reference, used by WorkDetail.

export function getVideoEmbedUrl(url) {
  if (!url) return null
  let u
  try {
    u = new URL(url)
  } catch {
    return null
  }

  const host = u.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = u.searchParams.get('v')
    if (id) return `https://www.youtube.com/embed/${id}`
    if (u.pathname.startsWith('/shorts/')) {
      const shortId = u.pathname.split('/')[2]
      if (shortId) return `https://www.youtube.com/embed/${shortId}`
    }
    return null
  }

  if (host === 'vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean)[0]
    return id ? `https://player.vimeo.com/video/${id}` : null
  }

  return null
}

export function parseGithubUrl(url) {
  if (!url) return null
  let u
  try {
    u = new URL(url)
  } catch {
    return null
  }

  if (u.hostname.replace(/^www\./, '') !== 'github.com') return null

  const [owner, repo] = u.pathname.split('/').filter(Boolean)
  if (!owner || !repo) return null

  return { owner, repo: repo.replace(/\.git$/, '') }
}
