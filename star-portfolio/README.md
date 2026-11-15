# ✦ Star Portfolio

A multidisciplinary portfolio site built with **React + Vite + React Router**.
Dark celestial aesthetic — midnight backgrounds, warm gold accents, animated star field.

## Pages

| Route | Page |
|-------|------|
| `/` | Home — filterable work gallery |
| `/work/:id` | Work detail — full piece view |
| `/about` | About — bio, disciplines, selected credits |
| `/contact` | Contact — form + social links |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Customising Your Content

### 1. Your name & nav logo
Open `src/App.jsx` — find `Nav` — then open `src/components/Nav.jsx` and replace **"Your Name"** with your actual name.

### 2. Your work / portfolio pieces
All content lives in **`src/data/works.js`**. Each entry looks like:

```js
{
  id: 1,                        // unique number — used in the URL /work/1
  category: 'music',            // 'music' | 'art' | 'writing' | 'code'
  emoji: '🎵',                  // placeholder thumbnail — replace with image path
  bg: '#1a1330',                // thumbnail background color
  title: 'Dusk Transmissions',
  year: '2024',
  desc: 'Short tagline for the card.',
  tags: ['ambient', 'EP'],      // optional
  body: `Long description shown on the detail page.
  
  Supports multiple paragraphs — just leave a blank line between them.`,
  link: 'https://...',          // optional external link
  linkLabel: 'Listen on Spotify', // text for the link button
}
```

To add a new category, also add it to the `CATEGORIES` array at the bottom of `works.js`.

### 2b. The sky (constellation view)
The home page's constellation view is a free-roam camera over a world several screens wide. Its shape lives in **`src/data/constellations.js`**: one entry per discipline with a `name`, a world `anchor`, and a `figure` (points + edges drawn relative to the anchor). Works fill the figure's points in year order; any extra works become fainter outlying stars around it, so adding work needs no layout changes. A category with no entry is placed procedurally. `HOME_CAMERA` is where visitors start, and `WORLD` is the sky's size. Each discipline's color is a `--cat-<key>` variable in `src/index.css`.

### 3. Adding real images
In `WorkCard.jsx`, replace the emoji `<span>` with an `<img>`:
```jsx
<img src={work.image} alt={work.title} className={styles.image} />
```
And add an `image` field to each work entry pointing to a file in `public/images/`.

### 4. About page
Edit `src/pages/About.jsx` — update the bio paragraphs, disciplines list, and selected credits directly in the component.

### 5. Contact form
The form currently logs to the console. To send real emails:
- **Formspree**: set `action="https://formspree.io/f/YOUR_ID"` on the `<form>` and remove the `onSubmit` handler.
- **EmailJS**: install `@emailjs/browser` and call `emailjs.send(...)` inside `handleSubmit`.

### 6. Social links
Edit the `SOCIAL_LINKS` array at the top of `src/pages/Contact.jsx`.

---

## Project Structure

```
star-portfolio/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Root — routing
│   ├── index.css         # Global tokens & base styles
│   ├── data/
│   │   └── works.js      # ← Your portfolio content lives here
│   ├── hooks/
│   │   └── useStarfield.js  # Animated star canvas logic
│   ├── components/
│   │   ├── Nav.jsx / .module.css
│   │   ├── StarCanvas.jsx / .module.css
│   │   └── WorkCard.jsx / .module.css
│   └── pages/
│       ├── Home.jsx / .module.css
│       ├── WorkDetail.jsx / .module.css
│       ├── About.jsx / .module.css
│       └── Contact.jsx / .module.css
```

---

## Design Tokens

All visual variables are in `src/index.css` under `:root`:

```css
--midnight   deep page background
--surface    card / input backgrounds
--gold       primary accent colour
--gold-dim   translucent gold for borders
--gold-glow  very faint gold for hovers
--text       primary text
--muted      secondary / body text
--ff-serif   Cormorant Garamond
--ff-sans    Jost
```
