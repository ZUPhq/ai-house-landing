# AI House — Elementor / WordPress Port Notes

This prototype is built with vanilla HTML/CSS/JS so it can be lifted into
Elementor section-by-section. Each `<section>` corresponds to one Elementor
Section.

## Global Tokens (Elementor → Site Settings → Global Colors)

| Token name        | Hex       | Use                       |
|-------------------|-----------|---------------------------|
| Primary           | `#03D777` | CTAs, accents, glow       |
| Secondary         | `#00DA89` | Secondary accents         |
| Text              | `#FFFFFF` | Body text                 |
| Muted             | `#B9B9B9` | Subtitles, lead copy      |
| Background        | `#000000` | Page background           |
| Surface           | `#0A0A0A` | Card backgrounds          |

**Typography**: Poppins 200 / 300 / 400 / 500 / 600 / 700.

## Section → Widget map

| HTML section          | Elementor widgets to use                                |
|-----------------------|---------------------------------------------------------|
| `.site-header`        | Header template + Nav Menu + 2× Button                  |
| `.hero`               | Section (2 cols) → Heading + Text + Buttons + Image     |
| `.partners-strip`     | Section (2 cols) → Heading + Button + Logo Carousel     |
| `.countdown-section`  | Section → Heading + **Countdown** widget (Elementor Pro)|
| `.about-section`      | Section → Heading + Icon Boxes (4 cols)                 |
| `.agenda-section`     | Section → 2× Inner Sections with Heading + Icon List    |
| `.tickets-section`    | Section → 4× **Price Table** widgets                    |
| `.partner-section`    | Section (2 cols) → Heading + Text + Button + Card       |
| `.site-footer`        | Footer template → 4 columns                             |

## Countdown widget

If using Elementor Pro Countdown widget:
- Set target to **2026-06-19 09:00** Europe/Bucharest
- Style values with primary color, Poppins 700, ~84px desktop
- Match label letter-spacing 2.5px, uppercase

If using a custom HTML widget, copy the markup from `index.html`
inside `<section class="countdown-section">` and load `script.js`.

## Partners slider

The CSS in `style.css` uses a pure-CSS `@keyframes partners-scroll`
infinite marquee. For Elementor port, prefer **Premium Addons → Logo Carousel**
or **Essential Addons → Logo Carousel** (both already installed on
promocrat.com per the inspiration site). Set:
- Slides to show: 6
- Autoplay: on, speed 35s
- Loop: on
- Pause on hover: off

## Tickets

All "Apply" buttons currently link to the Luma page
`https://luma.com/uj9v0i78`. In Elementor, set each Price Table
button URL to the same Luma page, or to the specific Luma ticket
deep link once available.

## Image assets

- `assets/ai-house-banner.jpg` — original AI House banner used in the hero.

## Notes on the design

- Color and font tokens mirror the inspiration site `promocrat.com/conference`
  (Poppins, `#03D777` primary, black background).
- Glow effects use `text-shadow` and `box-shadow` with the primary color
  at 0.4-0.6 alpha — kept subtle so it does not fight the banner.
