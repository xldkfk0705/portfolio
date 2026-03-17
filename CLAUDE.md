# CLAUDE.md

## Project Overview

Static portfolio website for Tenny Kwon — built with vanilla HTML, CSS, and JavaScript (no frameworks or build tools).

## Project Structure

```
index.html              - Main portfolio page
js/main.js              - Theme toggle, navigation, network canvas animation
styles/main.css         - Styling with dark/light theme system (CSS custom properties)
projects/               - Individual project detail pages (6 HTML files)
assets/images/          - Profile images
```

## Running Locally

No build step required. Serve as static files:

```bash
python -m http.server 8000
# Visit http://localhost:8000/
```

## Key Technical Details

- **Theming**: Dark mode (default, `#39FF14` accent) / Light mode (`#1DB954` accent), persisted via `localStorage`
- **External dependency**: Google Fonts ("Inter")
- **Browser APIs**: Canvas API (network graph), Intersection Observer (nav highlighting), `requestAnimationFrame`
- **Responsive**: CSS Grid/Flexbox, mobile-first with breakpoints at 768px and 1200px
- **Accessibility**: Semantic HTML, ARIA labels, `prefers-reduced-motion` support

## Code Conventions

- JavaScript uses ES5/IIFE pattern
- CSS uses section comment separators (`/* === SECTION === */`)
- No linting or testing tools configured
