// ─────────────────────────────────────────────────────────────
//  constellations.js  –  The shape of the sky.
//
//  The home page's constellation view is a camera looking at a much
//  larger "world" than the screen; each discipline is an authored
//  constellation placed somewhere in that world.
//
//  WORLD        size of the sky in sky units (the camera shows ~160 units
//               across at zoom 1, so this is roughly 3 screens wide).
//  HOME_CAMERA  where the camera starts — centered on Lyra, since the
//               hero's observation log cites Vega's coordinates.
//
//  Each constellation:
//    name     the figure's name (shown faintly under the label)
//    label    the category word drawn above the figure
//    anchor   world position of the figure's origin
//    color    optional CSS color; defaults to var(--cat-<key>)
//    figure   { points, edges }
//      points are offsets from `anchor` in sky units, y grows downward.
//      They are in PRIORITY order: works fill slots 0..n-1 (sorted by
//      year, then id), so any prefix of `points` must still be a
//      connected figure. Works beyond the last slot become fainter
//      outlying stars around the figure, and unfilled slots render as
//      faint ghost dots so the edges always read complete.
//
//  Adding a work needs nothing here. Adding a category: either add an
//  entry below (plus a --cat-<key> color in index.css), or add nothing
//  and the layout will place it procedurally.
// ─────────────────────────────────────────────────────────────

export const WORLD = { w: 480, h: 300 }

export const HOME_CAMERA = { x: 240, y: 150, zoom: 1 }

export const CONSTELLATIONS = {
  music: {
    name: 'Lyra',
    label: 'music',
    anchor: { x: 240, y: 150 },
    // Vega at the top, then the lyre's parallelogram.
    figure: {
      points: [[0, -22], [-3, -9], [-14, 3], [-4, 21], [7, 9]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]],
    },
  },
  art: {
    name: 'The Canvas',
    label: 'art',
    anchor: { x: 166, y: 118 },
    // A tilted frame — the yearly collections run clockwise from top-left.
    figure: {
      points: [[-16, -10], [14, -14], [12, 12], [-14, 8]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0]],
    },
  },
  video: {
    name: 'Triangulum',
    label: 'video',
    anchor: { x: 345, y: 88 },
    // A play button.
    figure: {
      points: [[-12, -12], [14, 0], [-12, 12]],
      edges: [[0, 1], [1, 2], [2, 0]],
    },
  },
  writing: {
    name: 'The River',
    label: 'writing',
    anchor: { x: 345, y: 215 },
    // A meandering course from source (oldest) to mouth, with one tributary.
    figure: {
      points: [
        [-55, -20], [-42, -8], [-30, 2], [-16, -4], [-2, 6],
        [12, 16], [26, 10], [40, 20], [54, 30], [6, -10],
      ],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [4, 9]],
    },
  },
  code: {
    name: 'The Tree',
    label: 'code',
    anchor: { x: 142, y: 212 },
    // Root, trunk, a fork, two boughs with twigs.
    figure: {
      points: [
        [0, 24], [0, 10], [0, -2], [-12, -10], [12, -9],
        [-20, -20], [-8, -22], [20, -19], [9, -22], [0, -16],
      ],
      edges: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [3, 6], [4, 7], [4, 8], [2, 9]],
    },
  },
}

// Bounding box of a figure's points (relative to its anchor) plus the
// radius of the farthest point — used to hang the label above the figure
// and to start the outlier spiral outside it.
export function figureBounds(figure) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, radius = 0
  figure.points.forEach(([x, y]) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    radius = Math.max(radius, Math.hypot(x, y))
  })
  return { minX, maxX, minY, maxY, radius }
}
