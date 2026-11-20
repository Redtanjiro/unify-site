# CLAUDE.md: Unify website handoff

*Updated 20 November 2026, after the v11 rebuild (commit `feat: rebuild v11…`).*

> **About v11.** The first v11 (home rebuilt from the brochure) was made in another session and never reached this repo. It was rebuilt here from that session's handoff, the 8-page brochure and the company profile. Where the handoff named content it didn't include, the gap was filled from the PDFs. **Neel's 20 Nov Services board was not available**, so the Services copy below is written from the profile. Check it against his board.

You're picking up the Unify website. The site is built end to end as a static prototype. Your job is to keep refining it from Neel's direction **without breaking what's already there**.

- Owner: Neel Parikh (designer). He sends a Figma board or reference image with short notes and iterates quickly. He notices motion quality: smooth, single gestures, no "pops".
- Repo: `https://github.com/Redtanjiro/unify-site`, branch `main`. Live preview: `https://redtanjiro.github.io/unify-site/` (GitHub Pages from `main`). Local folder on Neel's Mac: `~/Desktop/Media Mushroom/unify/unify-site/`.
- Stack: plain HTML, CSS and JS. No build step, no dependencies, no libraries unless Neel asks.

---

## 0. Read first

1. This file.
2. `index.html`, `assets/css/main.css`, `assets/js/main.js`, all of them.
3. Brand rules: `../Unify-Brand-Guidelines.pdf` (v1.0). Content: `../Unify — Company Profile 100 page template.pdf` and `../Unify 8 page brochure - brand fixed.pdf`. Open the PDFs to check wording, not to redesign.

**Run locally.** The monogram is loaded with `fetch()`, so `file://` won't work:
```bash
python3 -m http.server 8000   # → http://localhost:8000
```

---

## 1. What Unify is

**Unify · Events & Experiences** is a destination wedding company for couples abroad (starting with the US) who want to marry in India, backed by **25 years of Markcom**. It sells certainty: one accountable team, a planner in your time zone, itemised pricing in US dollars.

**Voice:** short, warm, certain. British spelling, prices in USD. Headlines in sentence case.
- **Never use:** dream wedding, magic/magical, bespoke, curated/curation, exclamation marks, hype, invented figures, unsigned partners.
- **Lines to use:** *Come home to say I do.* · *Destination weddings in India, planned for couples who live everywhere else.* · *One team in India. Every detail handled.* · *You bring the love story. We'll handle the distance.* · *Married in India. Planned from anywhere.* · *Sleep in New Jersey. Get married in Udaipur.*

**Logo:** Direction A, the U‑V monogram with a four-point spark. Direction B (U‑n‑Y arch) is dead; never use it. Marigold never sits on ivory or white.

---

## 2. Don't break these

### Opening invitation (`#intro`, `open()`, `foldFlap()`, `pull()` in `main.js`)
The envelope arrives; the visitor breaks the seal (or clicks, presses Enter or Space, or waits 9 s); the flap folds back; the card is pulled out and up in **one continuous motion** into the hero film.
- **No 3D on the flap.** It's a flat `scaleY(1 → -1)` with the face swapped edge-on. `rotateX` slices through the card and flickers.
- **The pull is one Web Animation**: 60 keyframes from one sine in-out curve, 3000 ms. Don't drive it with `requestAnimationFrame`, and don't split it into "rise, then grow". That made the stutter and "pop" Neel rejected.
- Growth eases in from zero (`Math.pow(ss(.08,1,p),1.35)`) while the card's top edge travels to `y = 0`, `transform-origin: 50% 0`.
- Reduced motion gets a 300 ms fade. **Skip** and footer **Open the invitation again** (`resetIntro()`) must keep working. Replay cancels only WAAPI animations, not CSS ones.

### Hero film, pocket and card
- `.hero` is fixed full-screen: Jal Mahal, Jaipur. `jaipur.mp4` (1600px) or `jaipur-m.mp4` (720px, ≤760px), chosen in JS. It's a stock clip; real footage will replace it **with the same filenames**.
- The UNIFY / EVENTS & EXPERIENCES wordmark (`.hw`) drifts to the bottom corners over 3.6 s.
- `.sheet` is the ivory envelope pocket that scrolls up over the film, with the broken half-seal on its top edge. `.sheet-head` carries the main line and the "Book a discovery call →" link.
- `.invite` is the white card that holds **all page content**. It rises faster than the pocket for the first screen (`--lift` in `onScroll()`).
- **All new sections go inside `.invite`, inside the right `.view`.**

### Routing (`route()`)
- Hash routes: `views = ['home','about','services','destinations','process','work','gallery','investment','enquire','terms']`. Each page is `<div class="view" id="v-NAME">`. Inner pages add `body.inner` (no film, seal or sheet-head).
- `moved` redirects old links (`experiences → services`, `portfolio → work`).
- `anchors` maps section hashes to their page and scrolls to them: `#quiz → destinations`, `#standard` and `#meaning → services`, `#serve → about`, `#form → enquire`. Add to it when you link to a section on another page. `route()` calls `onScroll()` before measuring, so `--lift` is already 0.
- `route()` is called once at the **end** of `main.js`, after the panel and gallery code, because it calls `closePanel()` and `closeLb()`. Keep it last.

### Cache-busting
CSS and JS are linked as `main.css?v=11` and `main.js?v=11`. **Bump both on every push that changes either.**

---

## 3. Design system

Tokens in `:root` in `main.css`. Use them; add no new colours or fonts.

| Token | Value | Use |
|---|---|---|
| `--maroon` / `--head` | `#6E1F2A` | Headings, links, seal, maroon bands, the Enquire tab |
| `--marigold` | `#C99A4A` | Hairlines, sparks, small ornaments. Text only on maroon and at 18pt or larger |
| `--ivory` | `#FAF5EA` | Text on film and maroon |
| `--teal` | `#1F5F5B` | Form status notes |
| `--blush` | `#E8B9B0` | Labels on maroon |
| `--paper` / `--paper-in` | `#F4EDE2` / `#E9DFD0` | Envelope stock, menu, enquiry panel |
| `--bg` | `#FFFFFF` | The invitation card |
| `--fg` `--muted` `--line` | `#3A2226` `#7C6662` `#E4D8D0` | Body, secondary, hairlines. **Open:** should become the guideline neutrals Ink `#1E1E1E`, Body `#5E554D`, Label `#6B625A`, Hairline `#DCCFB8` |

- **Type:** Noto Serif Display for headings and big numbers (200, 300, 400), Noto Serif for body. No sans-serif. Small uppercase labels are `.label` (11px, 0.22em).
- **Look:** a printed invitation. Flat, square corners, hairline rules, wide margins, an eyebrow `.label` above every headline. No shadows except the pocket, card and quiz gate. No gradients except the dark fade on photos.
- **Actions** are `.link` (uppercase text + `→`, underline on hover), never filled buttons. The one exception is the floating Enquire tab (maroon ground, gold inset hairline), which Neel asked to be always visible. It sits on the right edge on desktop and bottom-right on phones.
- **Spark:** `.spark` is the logo's four-point star drawn with `clip-path`, used in place of icons.
- **Breakpoints:** 860px and 640px. The page must never scroll sideways at 375px.
- **Placeholders:** `.draft` (marigold) for any `[__]` text; `.plate` + `.tag` for missing photos.

---

## 4. Site map (what's on each page now)

### Home (`#v-home`), in Neel's order
1. **Sheet-head:** "Come home to say I do." + subline + "Book a discovery call →" (to `#enquire`).
2. **Two teams, one celebration** (`.teams`): "Wedding planning that feels *like a vacation.*", the US/India paragraph (brochure p.4), and two live clocks (`.clocks`, New Jersey `America/New_York`, Udaipur `Asia/Kolkata`) with the hour gap between them.
3. **Events & occasions** (`.occ`): a 4 × 4 grid (2 columns on tablet and phone), each tile with a gold `.spark`. All 16 names come from brochure p.6, in its order: Kankotri Lekhan, Engagement, Ganesh Sthapan, Mehendi, Haldi / Carnival, Garba / Dandia, Sangeet, Bhaat / Mameru, Bachelors / Bachelorette, Baraat, Milni, Wedding, Reception, Anniversary, Birthday, Reunion.
4. **Celebrate across India** (`.regions`): Rajasthan, The Himalayas, Banaras, Goa, South India, Gujarat (brochure p.7), each linking to `#destinations`.
5. **Destination quiz teaser** (`.quiz-teaser`): a maroon band linking to `#quiz`.
6. **Our legacy** (`.stats.legacy`): 25 · 100+ · 50+ (brochure p.5), counting up on scroll (`[data-count]`, `data-suffix`).
7. **Moments we've created** (`#homeGallery.masonry[data-gallery]`): 9 photo + 3 film tiles drawn from `G`, then "View full gallery →".
8. **Services summary**: "Everything, handled." + six rows linking to `#services`.
9. **Testimonials**: three `[Testimonial]` placeholders.
10. **CTA band** (shared): "Let's plan it together."

### About (`#v-about`)
Page head, a six-plate photo strip (`.who-strip`), founder letter, values, Markcom legacy stats, a short **Unify Standard** pointer (links to `#standard`), behind the scenes, client logos, pull quote, personas (`#serve`), worry → answer table.

### Services (`#v-services`)
- "Everything, handled." / "Six services. One team. A celebration that arrives ready."
- Six `.svc` blocks, each with an **Includes** list: Venues and destinations · Planning and production · Design, décor and wedding branding · Food, music and entertainment · Guest experience and hospitality · Photography, films and on-ground management. (Neel's board said "Venue and Destination Curation". It was renamed because *curation* is on the avoid list. Confirm with Neel.) Includes lists come from the profile's service pages, regrouped; "A wedding monogram and identity", "Caterer tastings, shared on video" and "Shot lists for every ceremony" are new and need Neel's OK.
- **The guest journey** (`.steps.six`): Invitation · Travel · Arrival · Stay · Celebration · Departure.
- **Ceremonies, done right.** (statement, from profile p.27).
- **The meaning behind the moment** (`#meaning`, `.rites`): Saptapadi (Hindu), Laavan (Sikh), Nikah (Muslim), Ara Antar (Parsi). The descriptions need checking by someone from each tradition before launch.
- **Behind every function.** (statement paragraph, from the profile's six behind-the-scenes items).
- **The Unify Standard** (`#standard`): seven promises, the profile's six Markcom Standard items plus "Weekly updates by WhatsApp and video" (profile p.74).
- "You're in America. We're in India." time-zone strip (`.tz`).

### Destinations (`#v-destinations`)
Six city profiles (Udaipur, Jaipur, Jodhpur, Goa, Kerala, Gujarat), the compare table, the **six-question quiz** (`#quiz`), and the partner hotel grid.

### Gallery (`#v-gallery`)
Filter buttons (`.gfilter`, `aria-pressed`: All · Décor · Rituals · Families · Venues · Films) over a 24-tile masonry built from the `G` array in `main.js`.

### How we work, Our work, Investment, Enquire, Terms
Unchanged from the company-profile build. All prices, percentages, names, venues and policies are `[__]`.

### Global overlays (after `</main>`)
- `#menu`: full-screen menu listing every page (Gallery included).
- `#enqFab` + `#enqScrim` + `#enqPanel`: floating Enquire tab and side panel with a short discovery-call form (`#enqQuick`).
- `#lb`: fullscreen gallery viewer.

---

## 5. How the JS pieces work (`main.js`, in order)

| Piece | What to know |
|---|---|
| Monogram loader | Fetches `unify-monogram.svg`, recolours fills to `currentColor`, injects it into every `.mono`. |
| Intro | See §2. Don't touch without reading those rules. |
| `onScroll()` | Header solid state, `--lift`, pauses the film once it's covered, and shows `#enqFab` (`.on`) once you're past 55% of the hero, on every page except Enquire. |
| `route()` / menu | See §2. The menu, panel and viewer all use `body.menu-open` (via `lock()`) to lock scroll and hide the Enquire tab. `trap()` is the shared focus trap; one `keydown` listener handles Esc, Tab and the viewer's arrows for whichever overlay is open. |
| Panel | `openPanel()` / `closePanel()`, focus trap, Esc, scrim click. `#enqQuick` validates names and email only. |
| Gallery data | `G = [[ratio, kind, caption], …]` with ratio `wide`/`tall`/`sq` and kind `Décor`/`Rituals`/`Families`/`Venues`/`Films`. `tileHTML()` already reads a 4th field, `src`: add it when photos arrive and the tile shows the image (films get `data-type="video"`). |
| Viewer | Any `.tile` inside `[data-gallery]` opens it (one delegated click listener). Arrows, swipe, Esc, focus trap, focus returns to the tile. A tile with `data-src` shows the file instead of the placeholder. |
| Clocks | `tick()` every 30 s via `Intl.DateTimeFormat`. It draws the hands and computes the gap, so DST is handled (10½ hours in northern winter, 9½ in summer). |
| Counters | `IntersectionObserver` (threshold 0.6), 1.8 s ease-out. Reduced motion shows the final number. |
| **Quiz** | `DEST` holds per-city scores (`settings`, `feel`, `from`, `months`, `scale`); `rankQuiz()` turns them into a % match out of 12 (setting 3 + feel 3 + roots 3 + season 2 + scale 1). The top match shows free. The rest are blurred behind `.gate` until an email is entered (`unlock()`). The gate is a `<div>`, **not a `<form>`**: it sits inside `#quizForm` and nested forms are dropped by the parser. "Get my venue shortlist →" pre-fills the enquiry form's destinations (top in-season three once unlocked, else the top match), band and email. The scores are judgement calls from the profile's at-a-glance pages; Neel may want to tune them. |
| Forms | None of the three forms sends anything; each shows a "prototype doesn't send" note. |

---

## 6. Never invent. Still open on content.

**`[__]` means the client hasn't supplied it. Leave it visible with `.draft`. Never fill gaps with plausible numbers, names, venues, prices, logos, testimonials or partners.**

Open now:
1. **100+ events and 50+ awards** are in the brochure (p.5) and on the site, but **unverified**. Confirm with Markcom before launch. (About still shows `[__]` for events delivered, cities and guests.)
2. **Destinations don't match.** The home cards use the brochure's regions; the Destinations page, compare table, quiz `DEST` and enquiry checkboxes use the profile's six cities. Once Neel picks one list, carry it everywhere.
3. **Scope beyond weddings.** Birthday, Anniversary and Reunion are in the occasions grid. Is Unify weddings-only? That also decides whether "Events & Experiences" stays in the wordmark.
4. **Ritual descriptions** in `#meaning` need a cultural check.
5. **Services copy** needs checking against Neel's 20 Nov board (see the note at the top).
6. All photography, films, venue names, prices, team, testimonials, client and hotel logos, contact details, the founder's name.

---

## 7. Backlog (technical)

- **Logo SVGs are traced, not masters.** Swap in the master vectors with the same names: `assets/logo/unify-monogram.svg`, `unify-monogram-ivory.svg`, `unify-lockup.svg`. Horizontal lockups exist in `../logo-horizontal/` if the header moves to one.
- **Neutrals:** move `--fg`, `--muted`, `--line` to the guideline values (§3), and check contrast after.
- **Forms need a backend:** the enquiry form, the quick panel and the quiz email gate. Options: Formspree, Netlify Forms, or the client's CRM.
- **Hosting and domain** aren't set. GitHub Pages is a preview only.
- **Masonry columns** can end unevenly (CSS columns). Fine for now. If Neel minds, switch to a JS-balanced or fixed-row grid.
- **Real gallery media:** add files under `assets/gallery/`, compress (≤ 300 KB images, ≤ 3 MB films, posters for videos), and add `src` as the 4th field in `G`.

---

## 8. Working rules and checks

- One section at a time. After each change, check:
  - 1440px and 375px (no sideways scroll: `document.documentElement.scrollWidth` equals the viewport width)
  - reduced motion
  - a full invitation replay from the footer
  - no console errors
  - keyboard: Tab through the menu, panel and viewer, then Esc out of each
- Real headings in order, labelled fields, visible focus, alt text on real images, `<details>` for FAQs.
- Run new copy past the avoid list in §1.
- Commits: `feat: …` / `fix: …` with a bullet body. Bump `?v=`. **Push to `origin main` only when Neel asks.**
- For checks: skip the intro with `#skip`, then change pages with `location.hash = 'NAME'` (a `goto` to a new hash doesn't reload, so `#skip` won't be there again). In Claude's hidden browser pane, `requestAnimationFrame` and transitions may not run, so don't rely on them for layout, and give animations extra time.

## 9. Decisions waiting on Neel

1. Which destination list: brochure regions or profile cities (§6.2).
2. Weddings only, or broader occasions (§6.3).
3. "Venues and destinations" vs his "Venue and Destination Curation".
4. The rebuilt Services copy and the three new Includes items (§4).
5. Footer endorsement wording (currently "A Markcom company").
6. Whether the header should use the horizontal lockup.
