# AI House Bucharest — Landing Page

Single-page event landing for **AI House Bucharest** (June 19–20, 2026, Private Mansion, Otopeni). Curated by Andrei Ilie & Alex Gavril, in partnership with ▲neomixers. Powered by Instantly.ai (main sponsor); supported by ElevenLabs, The Recursive (media), and Bolt (mobility).

## Live URLs

- **Production**: https://ai-house-bucharest.vercel.app
- **Source**: https://github.com/ZUPhq/ai-house-landing
- **Custom domain** (in progress): `aihouse.promocrat.ro`
- **Luma source of truth for tickets**: https://luma.com/uj9v0i78

---

## Tech stack — INTENTIONALLY VANILLA

This is **not** a React/Next/Vite project. There is **no build step**. The choice is intentional:
- so it can be lifted into WordPress/Elementor later if needed
- so any designer can edit without a JS toolchain
- so deploys are instant (just static files)

| Layer | What it is |
|---|---|
| HTML | HTML5, single `index.html` with all sections inline |
| CSS | One file (`style.css`, ~2500 lines), organised top-to-bottom by section with clear comments |
| JS | One file (`script.js`), ES5/ES6 mix, vanilla — no framework |
| Fonts | Poppins from Google Fonts (weights 200–800) |
| Hosting | Vercel (static) |
| Source | GitHub: `ZUPhq/ai-house-landing` |

**No external libraries.** No jQuery, no GSAP, no Three.js, no Tailwind, no React. Every effect is hand-rolled with CSS + vanilla JS.

---

## Project structure

```
ai-house-landing/
├── index.html               ← single page, all sections
├── style.css                ← all styles
├── script.js                ← countdown, observers, scroll-jack, perk reveal
├── assets/
│   ├── ai-house-banner.jpg          (hero KV — portrait)
│   ├── favicon.png
│   ├── logo-promocrat-white.svg     (navbar + footer brand)
│   ├── curators/
│   │   ├── andrei-ilie.jpeg
│   │   └── alex-gavril.jpeg
│   └── partners/
│       ├── instantly.svg
│       ├── elevenlabs.svg
│       ├── the-recursive.png
│       ├── bolt.png
│       └── bolt-tile.svg            (tile with built-in padding for the
│                                     diagonal Bolt pattern on the press-to-reveal)
├── README.md                ← this file
├── ELEMENTOR-NOTES.md       ← legacy notes (somewhat stale)
└── .gitignore
```

---

## Brand book — Promocrat Design System

### Colors (strict — only these, no others)

| Token | Hex | Use |
|---|---|---|
| Bright green (primary) | `#03D777` | CTAs, accents, dots, glow |
| Black | `#000000` | Backgrounds, copy on green |
| White | `#FFFFFF` | Text on dark |
| Light blue | `#03BED7` | Secondary accent (use sparingly) |
| Dark blue | `#002532` | Aurora, deep backgrounds |
| Emerald 300 | `#042726` | Card surfaces, aurora base |
| Emerald 200 | `#082F2F` | Surfaces |
| Emerald 100 | `#0B403A` | Aurora primary blob |

All defined as CSS custom properties in `:root` of `style.css`. Greys are not in the brand — for muted text we use `rgba(255, 255, 255, X)` at lower alpha (`--color-muted: rgba(255,255,255,0.72)`).

### Typography

- **Family**: **Poppins** only
- Weights used: 200, 300, 400, 500, 600, 700, 800
- "promocrat" is **always** written lowercase
- The triangle **▲** is the brand mark — used as bullet, accent, decoration

### Voice

Direct, off-script, anti-corporate. Examples currently on-page:
- "Where AI builders connect off-script"
- "No performative keynotes. No passive audience. No corporate filler."
- "Curated, limited capacity, approval-only"
- "Thousands may apply. Only a curated room gets in."

---

## Page sections (top to bottom)

1. **Hero** — KV banner, "Powered by Instantly" chip, title, description, countdown, CTAs (Buy Tickets + Be a Partner)
2. **About the event** — Lead copy + 3 "negatives" chips + closer + quote + **Bolt press-to-reveal** perk
3. **Powered by** — 4 sponsor cards (Instantly main + ElevenLabs/Recursive/Bolt). On **mobile** becomes a **sticky horizontal scroll-jack** slider.
4. **Curated by** — Andrei Ilie + Alex Gavril profile cards with photos + company logo + LinkedIn link
5. **What to expect** — Vertical **timeline** (8 items) with scroll-driven green rail fill + active item highlighting
6. **Tickets** — 4 ticket tiers (Full Pass €189 featured / Day 2 €119 / Day 1 €89 / Mixer €49) — apply on Luma
7. **Partner with AI House** — Marquee of sponsor logos + Be-a-Partner CTA
8. **Partnership** — Full pitch + 2×2 grid of perks + "Become a Partner" CTA
9. **Footer**

---

## Key UI patterns (so you can extend without breaking)

### 1. Apple Liquid Glass (chip + negatives + navbar)

Real refraction via SVG `feDisplacementMap` filter applied as `backdrop-filter`. Defined inline at top of `<body>` as `<svg class="svg-defs">` with `<filter id="liquid-glass">`. Falls back gracefully on Safari (which doesn't support `url()` in backdrop-filter).

Recipe per element:
```css
background: linear-gradient(135deg, rgba(255,255,255,0.22), 0.06, 0.04, 0.20);
backdrop-filter: url(#liquid-glass) blur(14px) saturate(180%) brightness(1.10);
-webkit-backdrop-filter: blur(14px) saturate(180%) brightness(1.10);
box-shadow:
    inset 0 1.5px 0 rgba(255,255,255,0.40),    /* top specular */
    inset 0 -1px 0 rgba(0,0,0,0.30),            /* bottom rim */
    inset 0 0 0 1px rgba(255,255,255,0.14),     /* hairline */
    0 10px 30px rgba(0,0,0,0.30);               /* outer drop */
```

The navbar skips the `url()` filter because refraction distorts text — uses plain blur + saturate.

### 2. Bolt press-to-reveal (in About section)

- Cover with "We got a surprise for you" → click → 30 brand-green confetti particles fly radially → callout fades in
- Both children share the same grid cell (`display: grid; grid-template-areas: "stack"`) so the parent height transitions smoothly without jumps
- Bolt logo pattern on cover: SVG tile with built-in padding (220×160 viewBox, logo at 110×60 centered) so adjacent logos have visible spacing
- Logic in `script.js` → search for `// BOLT PERK: PRESS-TO-REVEAL + CONFETTI`

### 3. Sponsors sticky horizontal scroll-jack (mobile only)

- `.sponsors-section` is `260vh` tall on mobile
- `.sponsors-content` is `position: sticky; top: 0; height: 100vh`
- On scroll, JS reads progress and translates `.sponsors-grid` horizontally
- After last card, sticky releases → normal vertical scroll resumes to What to expect
- Dots indicator tracks active card; click jumps page scroll to that card's progress position
- Logic in `script.js` → `// SPONSORS: STICKY HORIZONTAL SCROLL (mobile-only)`
- Desktop is unaffected — grid stays a 4-col flex row

### 4. Timeline with scroll-driven rail (What to expect)

- Left vertical rail; green fill grows from top as user scrolls through the section
- Each item has a sticky number marker (01–08) that turns **white** when its item is the active reading zone
- Both effects use IntersectionObserver + scroll-listener (rAF-throttled)
- Logic in `script.js` → `// TIMELINE: ACTIVE NUMBER` + `// TIMELINE RAIL FILL`

### 5. Fade-in on scroll (lazy reveal)

- IntersectionObserver-based; `.fade-in` class on each section
- Inline script in `<head>` sets `html.js` BEFORE first paint → CSS hides sections initially (`html.js .fade-in { opacity: 0; transform: translateY(28px) }`) → observer adds `.is-visible`
- Honours `prefers-reduced-motion: reduce`

### 6. Hover-border-gradient CTA (Be a Partner, in hero)

- "Spot" of brand green that travels around the perimeter of the pill button (TOP → LEFT → BOTTOM → RIGHT) on a 3s loop
- Driven by CSS variables `--spot-x`/`--spot-y` animated through `@property` and `@keyframes`
- On hover, JS takes over and tracks the cursor position — the spot follows the cursor (rAF-throttled)
- Logic in `script.js` → `// HOVER-BORDER-GRADIENT CURSOR TRACKING`

---

## Performance (already wired)

- `content-visibility: auto` on long sections so the browser skips rendering off-screen content
- Animation pause when off-screen — IntersectionObserver toggles `.is-offscreen` on the hover CTA, Bolt perk, chip dot, countdown live-dot
- Low-end device detection — `navigator.deviceMemory < 4 || navigator.hardwareConcurrency < 4` adds `.perf-lite` class on `<html>` which disables backdrop-filter, hides extra aurora blobs, slows animations
- Aurora background (`.aurora` element at top of `<body>`): 4 blurred green/blue blobs + 2 grain layers (static); mobile hides 2 blobs + reduces blur radius
- Every loop animation honours `prefers-reduced-motion: reduce`
- Below-fold images use `loading="lazy"` + `decoding="async"`; hero banner uses `fetchpriority="high"`

---

## Responsive breakpoints

| Width | Treatment |
|---|---|
| ≥ 1180px | Full desktop layout |
| ≤ 1180px | Tablet (2-col tickets/sponsors, smaller section pad) |
| ≤ 900px | Mobile nav (hamburger), hero stacks |
| ≤ 768px | Mobile-optimised — banner hidden in hero, sticky-horizontal sponsors slider activates, curator cards become profile cards (round photo), full-screen nav overlay |
| ≤ 420px | Tiny phones — extra tightening on padding, fonts, grids |

`--section-pad` token shrinks at each breakpoint (44 → 40 → 36 → 32px).

---

## Local development

```bash
cd ai-house-landing
python3 -m http.server 8765
# Open http://localhost:8765
```

No `npm install`, no build, no node_modules. Just static files served from disk. Make changes, hard-refresh in the browser (`Cmd+Shift+R`).

---

## Deploy to Vercel

```bash
cd ai-house-landing
vercel --prod
```

The Vercel project (`ai-house-bucharest` under team/scope `iustinkt`) is already linked — the `.vercel/` folder is local-only (gitignored).

If `.vercel/` is missing on a new machine:
```bash
vercel link
# Choose scope: iustinkt
# Project: ai-house-bucharest
```

(Requires Vercel CLI: `npm i -g vercel`. To use the same Vercel team/scope `iustinkt`, the colleague needs to be invited to that team — ask the project owner.)

Alternative: the colleague can deploy under their own Vercel account by running `vercel link` and creating a new project. The production URL would then be different.

---

## Git workflow

The repo uses HTTPS with a Personal Access Token (PAT) embedded in `origin` URL. The local credential helper is disabled in this repo (`git config --local credential.helper ""`) to prevent macOS Keychain from intercepting auth.

```bash
cd ai-house-landing
git pull
# make changes
git add .
git commit -m "Describe the change clearly"
git push
```

If push fails with **403** on a fresh machine: generate a Classic PAT at https://github.com/settings/tokens (scope: `repo`) and run:
```bash
git remote set-url origin https://ZUPhq:TOKEN@github.com/ZUPhq/ai-house-landing.git
git config --local credential.helper ""
```

---

## Things NOT to do

- ❌ **Don't add a build step.** No Webpack, Vite, Parcel — this is intentionally vanilla so the markup is portable.
- ❌ **Don't introduce non-brand colors.** No purples/oranges/reds/grays beyond the palette above. Muted text = white at lower alpha.
- ❌ **Don't add libraries.** No jQuery, GSAP, Three.js, Tailwind. If you need an effect, hand-roll it with CSS + vanilla JS like the rest.
- ❌ **Don't break `prefers-reduced-motion`.** Every new loop animation must include the override.
- ❌ **Don't commit `.vercel/`.** It's gitignored — contains org/project IDs that should be local.
- ❌ **Don't change ticket copy without checking Luma** (https://luma.com/uj9v0i78). Tickets are the source of truth; landing must mirror them.

---

## Open items / known caveats

- **Custom domain pending**: `aihouse.promocrat.ro` — CNAME was added at registrar but currently resolves to `promocrat.ro` main site. Fix: verify CNAME points to `cname.vercel-dns.com` AND that `aihouse.promocrat.ro` is added under **Vercel → Settings → Domains** of this project.
- **Bolt PNG is green**: in all sponsor / partner contexts we force it to white via `filter: brightness(0) invert(1)`. Same in the Bolt perk callout.
- **PAT in remote URL**: a token is stored in plain text in `.git/config` (remote URL). Rotate periodically — see https://github.com/settings/tokens.
- **iOS sticky quirks**: the sponsors sticky-horizontal pattern relies on `position: sticky` which can have edge-case bugs on older iOS. Test on real devices after layout changes.

---

## How to continue work with Claude (for a colleague picking this up)

Paste the following prompt as your **first message** in a new Claude conversation. Then add your specific task at the end.

---

> I'm working on the **AI House Bucharest** event landing page.
>
> **Stack**: vanilla HTML/CSS/JS (no React, no build step). Hosted on Vercel at https://ai-house-bucharest.vercel.app. Source on GitHub at https://github.com/ZUPhq/ai-house-landing.
>
> The repo's `README.md` has the full context: tech stack, project structure, Promocrat brand book (colors + Poppins font + voice), key UI patterns (Apple Liquid Glass, Bolt press-to-reveal, sponsors sticky horizontal scroll-jack on mobile, scroll-driven timeline, hover-border-gradient CTA), performance optimisations, and conventions. Please read it before suggesting changes.
>
> **Brand colors are strict**: only `#03D777` (bright green), `#000000`, `#FFFFFF`, `#03BED7` (light blue), `#002532` (dark blue), and 3 emeralds (`#042726`, `#082F2F`, `#0B403A`). Font is **Poppins** only.
>
> **No libraries** — everything is hand-rolled CSS + vanilla JS. Don't add build steps, React, jQuery, etc.
>
> **Files**: single `index.html`, single `style.css` (~2500 lines, organised by section with clear comments), single `script.js`. Assets in `assets/`.
>
> **To deploy**: `vercel --prod` from the project folder. **To push to GitHub**: standard `git add/commit/push`.
>
> My task today is: **[DESCRIBE WHAT YOU WANT TO CHANGE]**

---

Edit the last line with the specific change you want. Claude will then have full context and won't ask basic questions about the stack.
