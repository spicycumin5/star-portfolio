// Lays the works out as constellations in the sky's world space. Pure:
// same works + registry in, same layout out. The camera (useSkyCamera)
// decides which part of this world is on screen.
import { CONSTELLATIONS, WORLD, HOME_CAMERA, figureBounds } from '../data/constellations.js'

const GOLDEN_ANGLE = 137.5 * (Math.PI / 180)
// Minimum center-to-center distance (sky units) between two stars. Figure
// stars are pinned where their constellation puts them; this only nudges
// outliers and procedurally placed stars, so authored shapes never warp.
const MIN_STAR_DIST = 6
// A label hangs this far above the top of its figure.
const LABEL_GAP = 7
// Label keep-out box: padded past the raw text box to also clear a star's
// rendered radius, not just its center.
const LABEL_MARGIN = 3.2
const LABEL_HALF_HEIGHT = 4.4
// Work stars render a little bigger than the background field's pinpoints,
// not as solid discs on top of it.
const STAR_SCALE = 0.58
const OUTLIER_SCALE = 0.8
// Parallax: a star's screen position is offset by (star - camera) * depth,
// so bigger |depth| reads as nearer (positive) or farther (negative).
// Figures stay nearly rigid; outliers and the deep field carry the motion.
const FIGURE_DEPTH = 0.06
const OUTLIER_DEPTH = 0.13
// First-view reveal ripples outward from where the camera starts.
const REVEAL_BASE = 0.15
const REVEAL_SPEED = 90 // sky units per second
const REVEAL_LINE_LAG = 0.25
const REVEAL_LINE_DURATION = 2.4
// Categories with no registry entry sit on a ring around the world center.
const FALLBACK_RING = 130
const WORLD_MARGIN = 8
// Decorative, non-interactive dots spread across the whole world so the
// space between constellations isn't empty and panning shows layers at
// different distances. `follow` is how much of the camera's motion the
// layer copies: more follow = farther away.
const FIELD_LAYERS = [
  { follow: 0.55, count: 200, widths: [0.3, 0.42, 0.55], alphas: [0.2, 0.3, 0.42], seed: 11 },
  { follow: 0.3, count: 120, widths: [0.32, 0.46, 0.62], alphas: [0.28, 0.4, 0.52], seed: 23 },
]
const FIELD_PAD = { x: 60, y: 40 }

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function clampToWorld(p) {
  p.x = clamp(p.x, WORLD_MARGIN, WORLD.w - WORLD_MARGIN)
  p.y = clamp(p.y, WORLD_MARGIN, WORLD.h - WORLD_MARGIN)
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Everything about a star's look that isn't its position derives from the
// work's id, so a piece keeps its character wherever the layout puts it.
function starTraits(work, kind, narrow) {
  const sizeStep = ((work.id * 7) % 5) / 4
  const jitter = ((work.id * 13) % 7) / 6 - 0.5
  const depthRange = kind === 'outlier' ? OUTLIER_DEPTH : FIGURE_DEPTH
  return {
    size: (1 + sizeStep * 4 * 0.22) * STAR_SCALE * (kind === 'outlier' ? OUTLIER_SCALE : 1),
    accent: work.id % 5 === 2,
    twinkleDur: 2.2 + (work.id % 4) * 0.7,
    twinkleDelay: (work.id * 0.53) % 3,
    depth: narrow ? 0 : clamp(sizeStep * 2 - 1 + jitter * 0.5, -1, 1) * depthRange,
  }
}

function revealDelayAt(x, y, work) {
  const dist = Math.hypot(x - HOME_CAMERA.x, y - HOME_CAMERA.y)
  return REVEAL_BASE + dist / REVEAL_SPEED + ((work?.id ?? 0) % 3) * 0.05
}

function byYearThenId(a, b) {
  const ya = parseInt(a.year, 10) || 0
  const yb = parseInt(b.year, 10) || 0
  return ya - yb || a.id - b.id
}

function nearest(point, candidates) {
  let best = null
  let bestDist = Infinity
  candidates.forEach((c) => {
    const d = Math.hypot(c.x - point.x, c.y - point.y)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  })
  return best
}

function labelBox(label) {
  return {
    x: label.x,
    y: label.y,
    halfW: label.text.length * 1.15 + LABEL_MARGIN,
    halfH: LABEL_HALF_HEIGHT,
  }
}

function pushOutOfLabel(star, box) {
  const dx = star.x - box.x
  const dy = star.y - box.y
  const overlapX = box.halfW - Math.abs(dx)
  const overlapY = box.halfH - Math.abs(dy)
  if (overlapX <= 0 || overlapY <= 0) return false
  if (overlapX < overlapY) {
    star.x += dx >= 0 ? overlapX : -overlapX
  } else {
    star.y += dy >= 0 ? overlapY : -overlapY
  }
  clampToWorld(star)
  return true
}

// Separates stars that landed too close together and pushes them out of
// label text. Pinned stars never move; a pinned/unpinned pair moves only
// the unpinned one (by the full gap), and a pinned/pinned pair is left
// alone: authored figures are trusted to be legible.
function resolveLayout(stars, labels) {
  const boxes = labels.map(labelBox)
  for (let pass = 0; pass < 10; pass++) {
    let moved = false
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i]
        const b = stars[j]
        if (a.pinned && b.pinned) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        if (dist >= MIN_STAR_DIST) continue
        const gap = MIN_STAR_DIST - dist
        // Coincident stars (dist 0) still need a direction to separate in.
        const ux = dist > 0.001 ? dx / dist : 1
        const uy = dist > 0.001 ? dy / dist : 0
        if (a.pinned) {
          b.x += ux * gap
          b.y += uy * gap
          clampToWorld(b)
        } else if (b.pinned) {
          a.x -= ux * gap
          a.y -= uy * gap
          clampToWorld(a)
        } else {
          a.x -= (ux * gap) / 2
          a.y -= (uy * gap) / 2
          b.x += (ux * gap) / 2
          b.y += (uy * gap) / 2
          clampToWorld(a)
          clampToWorld(b)
        }
        moved = true
      }
    }
    stars.forEach((star) => {
      if (star.pinned) return
      boxes.forEach((box) => {
        if (pushOutOfLabel(star, box)) moved = true
      })
    })
    if (!moved) break
  }
}

function buildField() {
  return FIELD_LAYERS.map((layer) => {
    const rand = mulberry32(layer.seed)
    const parts = layer.widths.map(() => [])
    for (let i = 0; i < layer.count; i++) {
      const x = -FIELD_PAD.x + rand() * (WORLD.w + FIELD_PAD.x * 2)
      const y = -FIELD_PAD.y + rand() * (WORLD.h + FIELD_PAD.y * 2)
      // Skew toward the faint class so the field reads as dust, not stars.
      const r = rand()
      const cls = r < 0.55 ? 0 : r < 0.85 ? 1 : 2
      parts[cls].push(`M${x.toFixed(1)} ${y.toFixed(1)}h0.01`)
    }
    return {
      follow: layer.follow,
      paths: parts.map((segs, i) => ({
        d: segs.join(''),
        width: layer.widths[i],
        opacity: layer.alphas[i],
      })),
    }
  })
}

/**
 * @returns {{
 *   stars: Array<{ key, work, x, y, size, accent, twinkleDur, twinkleDelay, revealDelay, depth, kind, pinned }>,
 *   ghosts: Array<{ key, x, y, category }>,
 *   lines: Array<{ key, from, to, category, revealDelay }>,
 *   labels: Array<{ category, text, name, x, y, depth, revealDelay }>,
 *   anchors: Record<string, { x, y }>,
 *   field: Array<{ follow, paths: Array<{ d, width, opacity }> }>,
 *   revealDuration: number,
 * }}
 */
export function buildLayout(works, registry = CONSTELLATIONS, { narrow = false } = {}) {
  const byCategory = {}
  works.forEach((work) => {
    if (!byCategory[work.category]) byCategory[work.category] = []
    byCategory[work.category].push(work)
  })

  const stars = []
  const ghosts = []
  const lines = []
  const labels = []
  const anchors = {}

  function addLine(from, to, category) {
    lines.push({
      key: `${from.key}-${to.key}`,
      from,
      to,
      category,
      revealDelay: Math.max(from.revealDelay ?? 0, to.revealDelay ?? 0) + REVEAL_LINE_LAG,
    })
  }

  // ── Authored constellations ──
  Object.entries(registry).forEach(([category, def]) => {
    const { anchor, figure } = def
    anchors[category] = { ...anchor }
    const bounds = figureBounds(figure)
    const items = (byCategory[category] || []).slice().sort(byYearThenId)

    // Figure slots, in priority order.
    const slots = figure.points.map(([px, py], i) => {
      const x = anchor.x + px
      const y = anchor.y + py
      const work = items[i]
      if (!work) {
        const ghost = { key: `ghost-${category}-${i}`, x, y, category, revealDelay: revealDelayAt(x, y) }
        ghosts.push(ghost)
        return ghost
      }
      const star = {
        key: work.id,
        work,
        x,
        y,
        kind: 'figure',
        pinned: true,
        revealDelay: revealDelayAt(x, y, work),
        ...starTraits(work, 'figure', narrow),
      }
      stars.push(star)
      return star
    })

    figure.edges.forEach(([i, j]) => {
      if (slots[i] && slots[j]) addLine(slots[i], slots[j], category)
    })

    // Overflow works spiral around the figure as fainter outlying stars,
    // each tied back to its nearest figure star. The spiral is an ellipse
    // hugging the figure's bounding box (not a circle of its radius), so
    // a long figure like the river keeps its outliers close on all sides.
    const figureStars = slots.filter((s) => s.work)
    const cx = anchor.x + (bounds.minX + bounds.maxX) / 2
    const cy = anchor.y + (bounds.minY + bounds.maxY) / 2
    const halfW = (bounds.maxX - bounds.minX) / 2
    const halfH = (bounds.maxY - bounds.minY) / 2
    items.slice(figure.points.length).forEach((work, i) => {
      const angle = i * GOLDEN_ANGLE + 0.7
      const spread = 10 + i * 2.5
      const star = {
        key: work.id,
        work,
        x: cx + Math.cos(angle) * (halfW + spread),
        y: cy + Math.sin(angle) * (halfH + spread),
        kind: 'outlier',
        pinned: false,
        ...starTraits(work, 'outlier', narrow),
      }
      clampToWorld(star)
      star.revealDelay = revealDelayAt(star.x, star.y, work)
      stars.push(star)
      const target = nearest(star, figureStars.length ? figureStars : slots)
      if (target) addLine(star, target, category)
    })

    const members = stars.filter((s) => s.work.category === category)
    labels.push({
      category,
      text: def.label ?? category,
      name: def.name,
      x: anchor.x,
      y: anchor.y + bounds.minY - LABEL_GAP,
      depth: members.length ? members.reduce((sum, s) => sum + s.depth, 0) / members.length : 0,
      revealDelay: Math.min(REVEAL_BASE + 60, ...members.map((s) => s.revealDelay)),
    })
  })

  // ── Categories the registry doesn't know ──
  // A golden-angle ring around the world center keeps any number of them
  // apart from each other; within one, stars spiral out like the old chart.
  let extraIndex = 0
  Object.entries(byCategory).forEach(([category, items]) => {
    if (registry[category]) return
    const ringAngle = extraIndex * GOLDEN_ANGLE
    extraIndex += 1
    const anchor = {
      x: WORLD.w / 2 + Math.cos(ringAngle) * FALLBACK_RING,
      y: WORLD.h / 2 + Math.sin(ringAngle) * FALLBACK_RING * 0.6,
    }
    anchor.x = clamp(anchor.x, 40, WORLD.w - 40)
    anchor.y = clamp(anchor.y, 40, WORLD.h - 40)
    anchors[category] = anchor

    const catStars = items.slice().sort(byYearThenId).map((work, i) => {
      const angle = i * GOLDEN_ANGLE
      const radius = 4 + i * 3.2
      const star = {
        key: work.id,
        work,
        x: anchor.x + Math.cos(angle) * radius,
        y: anchor.y + Math.sin(angle) * radius,
        kind: 'figure',
        pinned: false,
        ...starTraits(work, 'figure', narrow),
      }
      clampToWorld(star)
      star.revealDelay = revealDelayAt(star.x, star.y, work)
      return star
    })
    stars.push(...catStars)

    const added = new Set()
    catStars.forEach((star, i) => {
      catStars
        .map((other, j) => ({ j, dist: Math.hypot(star.x - other.x, star.y - other.y) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = `${Math.min(i, j)}-${Math.max(i, j)}`
          if (added.has(key)) return
          added.add(key)
          addLine(catStars[i], catStars[j], category)
        })
    })

    const top = Math.min(...catStars.map((s) => s.y))
    labels.push({
      category,
      text: category,
      name: undefined,
      x: anchor.x,
      y: top - LABEL_GAP,
      depth: catStars.reduce((sum, s) => sum + s.depth, 0) / catStars.length,
      revealDelay: Math.min(...catStars.map((s) => s.revealDelay)),
    })
  })

  // Runs across every constellation at once. Lines and labels reference
  // these same star objects, so nudging here keeps everything in sync.
  resolveLayout(stars, labels)
  // Line delays were computed before outliers settled; refresh them.
  lines.forEach((l) => {
    l.revealDelay = Math.max(l.from.revealDelay ?? 0, l.to.revealDelay ?? 0) + REVEAL_LINE_LAG
  })

  const revealDuration =
    Math.max(0, ...lines.map((l) => l.revealDelay), ...stars.map((s) => s.revealDelay)) +
    REVEAL_LINE_DURATION

  return { stars, ghosts, lines, labels, anchors, field: buildField(), revealDuration }
}
