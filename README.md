# Unify — Events & Experiences · Website prototype

Unify is a destination wedding company for couples abroad, starting with the US, who want to marry in India, backed by 25 years of Markcom. This is a static, single-page prototype of its website, built from the company profile (`../Unify — Company Profile 100 page template.pdf`) and the 8-page brochure (`../Unify 8 page brochure - brand fixed.pdf`). See `CLAUDE.md` for the full brief. The visit opens with an Indian wedding invitation: the visitor breaks a wax seal, the envelope flap folds back, and the card is pulled out and up in one motion until it becomes a full-screen venue film. The rest of the site is the envelope pocket sliding up over the film, with the white invitation card rising inside it.

No build step and no dependencies: plain HTML, CSS and JavaScript.

---

## Logo files

The three logo SVGs in `assets/logo/` were traced from the Direction A slides in "Unify — Logo Directions.pdf". Replace them with the designer's master vectors when available, keeping these names:

| File | What it is | Used for |
|---|---|---|
| `assets/logo/unify-monogram.svg` | U‑V monogram with the four-point spark (Direction A), single colour (ink) | Header, wax seals, envelope card, statement ornament, favicon |
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
├── index.html              Page markup: invitation, header, menu, hero film, envelope pocket, ten pages, footer, Enquire panel, gallery viewer
├── assets/
│   ├── css/main.css        All styles; design tokens at the top in :root
│   ├── js/main.js          Invitation, hero film, scroll, routing, menu, Enquire panel, gallery + viewer, clocks, counters, quiz, forms
│   ├── video/
│   │   ├── jaipur.mp4         Hero film (Jal Mahal, Jaipur) · 1600px wide, H.264, no audio, ~2.9 MB, loops
│   │   ├── jaipur-m.mp4       Same film at 720px (~0.4 MB), served to phones by main.js
│   │   └── jaipur-poster.jpg  First frame; shown on the envelope card and while the film loads
│   └── logo/               Monogram (ink + ivory) and lockup SVGs
├── CLAUDE.md               Handoff brief: positioning, rules, section-by-section content
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
- `position: fixed` and full screen. The Jaipur film plays muted, inline and looped. Screens 760px wide or narrower get `jaipur-m.mp4`.
- **UNIFY** and **EVENTS & EXPERIENCES** start just under the header and float down to the bottom-left and bottom-right corners (`.hw`, 3.6 s). On phones both settle at bottom left.
- The film pauses once the pocket fully covers it, to save battery.

### 3. Envelope pocket (`.sheet`) and invitation card (`.invite`)
- The pocket starts one screen down and scrolls up over the film. It has a gold hairline border and the broken half of the wax seal on its top edge.
- The white card inside rises slightly faster than the pocket for the first screen of scrolling (`--lift`, set in `onScroll()`), so it reads as the invite being pulled out.
- The header is clear over the film and turns the paper colour once the pocket reaches the top.

### 4. Pages and navigation
Hash routing, all in one file (`views` in `main.js`): `#home`, `#about`, `#services`, `#destinations`, `#process` (How we work), `#work`, `#gallery`, `#investment`, `#enquire` (team, contact and form) and `#terms` (linked from the footer). Section links open their page and scroll to the section (`anchors`): `#quiz`, `#standard`, `#meaning`, `#serve`, `#form`. The old prototype links `#experiences` and `#portfolio` redirect to `#services` and `#work`. Inner pages skip the film and open straight onto the pocket and card.

**Home**, in order: two teams with live New Jersey and Udaipur clocks · the 16 events and occasions · six regions · quiz teaser · legacy counters (25 · 100+ · 50+) · a 12-tile gallery · services summary · testimonials · the shared call-to-action band.

**Gallery** (`#gallery`): 24 placeholder tiles from the `G` array in `main.js`, filtered by Décor, Rituals, Families, Venues and Films. Any tile opens the fullscreen viewer (arrows, swipe, Esc). Add a 4th `src` field to an entry in `G` and the tile shows that file.

**Enquire tab**: a maroon tab on the right edge (bottom-right on phones) appears once you scroll past the film, on every page except Enquire. It opens a side panel with a short discovery-call form.

The header keeps three links (Services · Destinations · Enquire) right of the centred monogram, with **Menu** on the left. Menu opens a full-screen paper overlay listing every page; it closes with Escape, keeps focus inside while open, and returns focus to the Menu button. On phones only the monogram and Menu show.

### 5. Destination quiz (`#quiz` on Destinations)
Six questions (guests, months, setting, feel, family roots, budget band). `rankQuiz()` scores each destination out of 12 on setting, feel, roots, season and scale (`DEST` in `main.js`) and shows it as a % match. The closest match shows straight away; the rest are blurred until the visitor adds an email. **Get my venue shortlist** carries the picks, budget band and email into the enquiry form. Budget doesn't change the scoring, because there are no prices yet.

### 6. Enquiry form
Built around the discovery call: names, email, phone or WhatsApp, where you live, preferred call hours, destinations, date, guests, budget band, message. Front-end only: it checks the names and email and shows a thank-you line. **It does not send anything**, and neither do the Enquire panel or the quiz email gate. Connect it to a form service (Formspree, Netlify Forms, or the client's CRM) before launch.

### 7. Placeholders
Anything the client hasn't supplied appears as a visible gold placeholder (`.draft`, e.g. `[__]`, `[$__]`, `[Founder name]`). Never replace one with an invented number, price, name, venue, logo or testimonial.

---

## Still placeholder

- [x] Logo SVGs: traced from the Direction A slides in "Unify — Logo Directions.pdf". Swap in the designer's master vectors when available
- [ ] Final venue film: swap `assets/video/jaipur.mp4`, `jaipur-m.mp4` and `jaipur-poster.jpg`, keeping the same names
- [ ] Event, destination and team photography for every `.plate` ("photo to come"), and gallery photos and films (`G` in `main.js`)
- [ ] Prices: collections, destination budget ranges, sample proposal, payment schedule
- [ ] Markcom numbers (100+ events and 50+ awards are from the brochure and unverified; events delivered, cities and guests are `[__]`), founder name, team, client and hotel logos, partners
- [ ] Ritual descriptions under "The meaning behind the moment": cultural check
- [ ] Destinations: brochure regions (home) vs profile cities (Destinations page, quiz, form)
- [ ] Case studies and testimonials
- [ ] Contact details (email, phone, WhatsApp, domain)
- [ ] Policies: changes and cancellation, guest visas, multi-faith weddings, terms
- [ ] Enquiry form backend

## Video export settings (for the final film)

```bash
ffmpeg -i source.mp4 -an -vf "scale='min(1600,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart \
  assets/video/jaipur.mp4
ffmpeg -ss 1 -i assets/video/jaipur.mp4 -frames:v 1 -q:v 4 assets/video/jaipur-poster.jpg
```
Aim for under 4 MB. `-an` strips audio and `+faststart` lets it start playing before it has fully downloaded.

## Deploy

Any static host works: GitHub Pages, Netlify or Vercel. Push the folder as-is with `index.html` at the root. Live preview: https://redtanjiro.github.io/unify-site/ (GitHub Pages from `main`). Bump `?v=` on the CSS and JS links whenever they change, so returning visitors get the new files.
