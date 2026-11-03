# Unify — Events & Experiences · Website prototype

A static, single-page prototype for the Unify website. The visit opens with an Indian wedding invitation: the visitor breaks a wax seal, the envelope flap folds back, and the card is pulled out and up in one motion until it becomes a full-screen venue film. The rest of the site is the envelope pocket sliding up over the film, with the white invitation card rising inside it.

No build step and no dependencies: plain HTML, CSS and JavaScript.

---

## Before you push: add the logo files

The three logo SVGs are **not in this folder**. They live in the brand deck artwork. Export them from the approved Direction B files and save them with these exact names:

| File | What it is | Used for |
|---|---|---|
| `assets/logo/unify-monogram.svg` | U‑n‑Y monogram with the star, single colour (ink) | Header, wax seals, envelope card, statement ornament, favicon |
| `assets/logo/unify-monogram-ivory.svg` | Same monogram in ivory `#FAF5EA` | Fallback if the script can't recolour the monogram |
| `assets/logo/unify-lockup.svg` | Full lockup: monogram + UNIFY + EVENTS & EXPERIENCES, ink | Footer |

The script loads `unify-monogram.svg` as text and recolours every `fill` to `currentColor`, so one file serves gold (seal), ivory (on the film) and maroon (on paper). Keep that file as filled paths with no background rectangle.

---

## Run it locally

The monogram is fetched with `fetch()`, which browsers block on `file://`. Use any static server:

```bash
cd unify-site
python3 -m http.server 8000
# open http://localhost:8000
```

or `npx serve .`

---

## Structure

```
unify-site/
├── index.html              Page markup: invitation, header, hero film, envelope pocket, five pages, footer
├── assets/
│   ├── css/main.css        All styles; design tokens at the top in :root
│   ├── js/main.js          Invitation sequence, hero film, scroll behaviour, page routing, enquiry form
│   ├── video/
│   │   ├── jaipur.mp4         Hero clip 1 (Jal Mahal, Jaipur) · 1600px wide, H.264, no audio
│   │   ├── village.mp4        Hero clip 2 (hillside village) · 14 s
│   │   ├── fields.mp4         Hero clip 3 (wheat field at sunset) · 14 s
│   │   └── jaipur-poster.jpg  First frame; shown on the envelope card and while the film loads
│   └── logo/               ← add the three SVGs listed above
├── .gitignore
└── README.md
```

## Brand tokens (`assets/css/main.css`, `:root`)

| Token | Value | Role |
|---|---|---|
| `--maroon` | `#6E1F2A` | Headings, links, wax seal, call-to-action band |
| `--marigold` | `#C99A4A` | Monogram on the seal, fine gold borders |
| `--ivory` | `#FAF5EA` | Text on the film |
| `--teal` | `#1F5F5B` | Form confirmation text |
| `--blush` | `#E8B9B0` | Small labels on maroon |
| `--paper` | `#F4EDE2` | Envelope and pocket stock, solid header |
| `--paper-in` | `#E9DFD0` | Inside of the envelope |

Type: **Noto Serif Display** for headings, **Noto Serif** for body text (Google Fonts, linked in `index.html`).

---

## How the page works

### 1. The invitation (`#intro`)
1. The envelope arrives on white. The visitor clicks the seal, anywhere on the envelope, or presses Enter or Space. If nobody does, it opens by itself after 9 seconds. **Skip** goes straight to the site.
2. `foldFlap()`: the flap folds back over its top edge. It's a flat `scaleY(1 → -1)` with the outside face swapping to the inside face when the flap is edge-on. There is deliberately no 3D here: a 3D flap slices through the card and flickers.
3. `pull()`: the card rises out of the pocket and keeps going until it fills the screen while the envelope sinks and fades. It is one Web Animation sampled from a single curve (60 keyframes), so it runs off the main thread with no second "pop". The card's top edge travels steadily to the top of the screen, and growth eases in from zero.
4. The overlay fades, the film is already playing beneath it, and the wordmark starts drifting down.

Timing knobs in `main.js`: `FD` (flap, 820 ms), `D` (pull, 3000 ms), and the `ss(...)` ranges inside `pull()` that control when growth and the envelope fade start.

**Open the invitation again** in the footer replays it. Visitors with *reduce motion* turned on get a short fade instead.

### 2. Hero film (`.hero`)
- `position: fixed` and full screen. Three clips (Jal Mahal → village → fields) play muted and inline, cross-fading 1.6 s before each ends, on a loop (`XF` in `main.js`).
- **UNIFY** and **EVENTS & EXPERIENCES** start just under the header and float down to the bottom-left and bottom-right corners (`.hw`, 3.6 s). On phones both settle at bottom left.
- The film pauses once the pocket fully covers it, to save battery.

### 3. Envelope pocket (`.sheet`) and invitation card (`.invite`)
- The pocket starts one screen down and scrolls up over the film. It has a gold hairline border and the broken half of the wax seal on its top edge.
- The white card inside rises slightly faster than the pocket for the first screen of scrolling (`--lift`, set in `onScroll()`), so it reads as the invite being pulled out.
- The header is clear over the film and turns the paper colour once the pocket reaches the top.

### 4. Pages
Hash routing, all in one file: `#home`, `#about`, `#experiences`, `#portfolio`, `#enquire`. Inner pages skip the film and open straight onto the pocket and card.

### 5. Enquiry form
Front-end only: it checks the name and email and shows a thank-you line. **It does not send anything.** Connect it to a form service (Formspree, Netlify Forms, or the client's CRM) before launch.

---

## Still placeholder

- [x] Logo SVGs: traced from the Direction B slides in "Unify — Logo Directions.pdf". Swap in the designer's master vectors when available
- [ ] Final venue films: swap `jaipur`, `village`, `fields` (.mp4 + -poster.jpg) in `assets/video/`, keeping the same names
- [ ] Event photography for every `.plate` block ("photo to come")
- [ ] Final copy; the current text is draft in the luxury tone
- [ ] Contact details (`hello@unify.example`), social links
- [ ] Enquiry form backend
- [ ] Page list to be checked against the planning brief (testimonials, team, planning-from-overseas section, WhatsApp contact)

## Video export settings (for the final film)

```bash
ffmpeg -i source.mp4 -an -vf "scale='min(1600,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart \
  assets/video/jaipur.mp4
ffmpeg -ss 1 -i assets/video/jaipur.mp4 -frames:v 1 -q:v 4 assets/video/jaipur-poster.jpg
```
Aim for under 4 MB. `-an` strips audio and `+faststart` lets it start playing before it has fully downloaded.

## Deploy

Any static host works: GitHub Pages, Netlify or Vercel. Push the folder as-is with `index.html` at the root.

### Suggested first commit

```
feat: Unify website prototype

- Wedding-invitation opening: seal, flap fold, continuous card pull into the hero film
- Fixed Jaipur hero film with drifting UNIFY / EVENTS & EXPERIENCES wordmark
- Envelope-pocket layout for the rest of the site with rising invitation card
- Home, About, Experiences, Portfolio and Enquire pages (hash routing)
- Brand tokens: Unify palette, Noto Serif Display / Noto Serif
```
