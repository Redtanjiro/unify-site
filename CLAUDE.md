# CLAUDE.md: Unify website handoff

You're picking up the Unify website. The opening sequence and the page shell are built and pushed. **Your job is to build the rest of the site, section by section, from the brief below**, without breaking what's already there.

Owner: Neel Parikh (designer). Repo: `https://github.com/Redtanjiro/unify-site` (branch `main`). Static site: plain HTML, CSS and JS, no build step and no dependencies.

---

## 0. Read first

1. This file.
2. `index.html`, `assets/css/main.css` and `assets/js/main.js`, all of them. They're short (about 200 lines each).
3. **The brief.** The source of truth for content is the company profile PDF one folder up:
   - `../Unify — Company Profile 100 page template.pdf`: all content, chapter by chapter (summarised in §4)
   - `../Unify — Company Presentation template.pdf`: the eight-slide condensed version
   - `../Unify proposal and quotation template.pdf`: proposal format and payment terms

   §4 has everything you need from them. Open the PDFs only to check wording.

**Run locally.** The monogram is loaded with `fetch()`, so it won't work from `file://`:
```bash
python3 -m http.server 8000   # → http://localhost:8000
```

---

## 1. What Unify is (this overrides the prototype copy)

**Unify · Events & Experiences** is a **destination wedding company for couples abroad, starting with the US, who want to marry in India.** It is backed by **25 years of Markcom's** live-event experience. It sells *certainty* (one accountable team in India, itemised pricing in US dollars, a planner in your time zone) as much as beauty.

The prototype copy was written before this positioning was set. It mentions "Brand & corporate", "Celebrations" and a generic events house. **Replace it with the profile's content.** Keep the prototype's luxury tone.

Lines to use (from the profile):
- **Come home to say I do.** (main line)
- Destination weddings in India, planned for couples who live everywhere else.
- Married in India. Planned from anywhere.
- You bring the love story. We'll handle the distance.
- Sleep in New Jersey. Get married in Udaipur.
- One team in India. Every detail handled.
- Many planners sell beautiful weddings. Few sell certainty.

Spelling follows the profile: British spellings (itemised, colour, organisation) with prices in **USD**.

---

## 2. What's built. Don't break it.

### Opening sequence (`#intro`, `main.js`)
An Indian wedding invitation. The envelope arrives, the visitor breaks the wax seal (or clicks the envelope, presses Enter or Space, or waits 9 s), the flap folds back, and the card is **pulled out and up in one continuous motion** until it fills the screen and becomes the hero film.

Rules, all learned the hard way:
- **No 3D on the envelope.** The flap is a flat `scaleY(1 → -1)` with the face swapping when it's edge-on. A `rotateX` flap slices through the card and flickers.
- **The pull is one Web Animation** sampled from a single curve (`pull()`, 60 keyframes, sine in-out, 3000 ms). Don't drive it with `requestAnimationFrame` and style writes, and don't split it into "rise, then grow". That caused the stutter and the "pop" Neel rejected.
- Growth eases in from zero (`Math.pow(ss(.08,1,p),1.35)`) while the card's top edge travels steadily to `y = 0`, with `transform-origin: 50% 0`.
- Reduced motion gets a 300 ms fade. **Skip** and **Open the invitation again** (footer) must keep working. Replay cancels only WAAPI animations, not CSS ones.

### Hero film (`.hero`)
- `position: fixed`, full screen. Jal Mahal, Jaipur, muted, inline and looped. `jaipur.mp4` (1600px, about 2.9 MB) on wide screens and `jaipur-m.mp4` (720px, about 0.4 MB) at ≤760px. The source is chosen in JS.
- Wordmark: **UNIFY** and **EVENTS & EXPERIENCES** start under the header and float down to the bottom-left and bottom-right corners (`.hw`, 3.6 s). On phones they stack at bottom left.
- The film pauses once the pocket fully covers it.

### Envelope pocket (`.sheet`) and invitation card (`.invite`)
The page *is* the invitation pulled from its envelope:
- `.sheet` is ivory paper (`--paper`) that starts one screen down and scrolls up over the film. It has a gold hairline border and the **broken bottom half of the wax seal** on its top edge.
- `.sheet-head` is the heading on the paper, above the card.
- `.invite` is the white card holding all page content. It rises faster than the pocket for the first screen of scroll (`--lift` in `onScroll()`).
- The footer sits on the paper below the card.
- The header is transparent and ivory over the film, then turns `--paper` once the pocket reaches the top.
- **All new sections go inside `.invite`**, inside the right `.view`.

### Pages and routing
Hash routing in `main.js`: `views = ['home','about','experiences','portfolio','enquire']`. Each page is a `<div class="view" id="v-NAME">`. Inner pages add `body.inner`, which hides the film, seal and sheet-head and opens straight onto the pocket.

### Logo
`assets/logo/unify-monogram.svg` is fetched as text and every fill is recoloured to `currentColor`, so `.mono` takes any colour: gold on the seals, ivory on the film, maroon on paper. `unify-lockup.svg` is used in the footer. `unify-monogram-ivory.svg` is the fallback.

### Cache-busting
CSS and JS are linked as `main.css?v=7` and `main.js?v=7`. **Bump the number on every push** that changes them.

---

## 3. Design system (use it, don't add a new one)

Tokens are in `:root` in `main.css`:

| Token | Value | Use |
|---|---|---|
| `--maroon` | `#6E1F2A` | Headings, links, seal, CTA band |
| `--marigold` | `#C99A4A` | Gold: seal monogram, hairline borders, small ornaments |
| `--ivory` | `#FAF5EA` | Text on film and maroon |
| `--teal` | `#1F5F5B` | Form status text; sparing detail colour |
| `--blush` | `#E8B9B0` | Labels on maroon |
| `--paper` / `--paper-in` | `#F4EDE2` / `#E9DFD0` | Envelope stock |
| `--bg` | `#FFFFFF` | The invitation card |
| `--fg`, `--muted`, `--line` | | Body text, secondary text, hairlines |

- **Type:** Noto Serif Display (headings, weights 200, 300 and 400) and Noto Serif (body). There's no sans-serif. Small uppercase labels use `.label` (11px, 0.22em tracking).
- **Look:** a luxury printed invitation. Flat, 0 radius, hairline rules, generous whitespace. No drop shadows except the pocket and card. No filled buttons: actions are `.link` (uppercase text, underline on hover, `→`).
- **Existing components to reuse:** `.band` (section spacing), `.page-head`, `.statement`, `.split` (label left, content right), `.list` + `.row` (numbered rows I, II, III), `.steps` + `.step` (numbered columns), `.values`, `.cols2`, `.plates` + `.plate` (photo placeholders with `.tag`), `.cta-band`, `form.enq`.
- **New components you'll need** (build them in the same language): collection or tier cards, a comparison table, an FAQ (`<details>`/`<summary>`), a stat row, a timeline, a "worry → answer" table, a case study block, a testimonial block, a destination quiz, and a time-zone "while you sleep" strip.
- Only number sections when the order is real, like the process steps or the timeline.
- Breakpoints are 860px and 640px. The page must not scroll sideways at 375px.

---

## 4. The brief: sections to build

Chapters from the company profile, with their content. **`[__]` means the client hasn't supplied it yet. Leave it as a visible placeholder (style it with `.draft`). Never invent numbers, prices, names, venues, client logos or testimonials.**

### Home (`#home`): a summary that leads to each page
1. **Sheet-head:** "Come home to say I do." Sub-line: *Destination weddings in India, planned for couples who live everywhere else.*
2. **Who we are:** "India's weddings, made easy for couples who live elsewhere." Couples abroad don't lack inspiration; they need certainty across time zones, currencies, vendors and families. Unify is a single accountable team in India, backed by 25 years of Markcom.
3. **Our promise:** three columns: *One team in India* (a dedicated planner and an on-ground team, working while you sleep) · *25 years of Markcom* (process and partners) · *Every detail, handled* (guests, logistics, rituals).
4. **What we do:** the six services as short rows, linking to Services.
5. **Where:** the six destinations as plates, linking to Destinations.
6. **How it works:** five steps (see How we work).
7. **Investment teaser:** four collections, linking to Investment.
8. **CTA band:** "Let's plan it together." Consultations offered in US and Indian hours.

### About (`#about`): chapters 01 and 02
- **A note from our founder:** "For twenty-five years, Markcom has run large events across India, with the quiet discipline that keeps every one of them on time. We built Unify for couples who live abroad and want to marry in India: people who need certainty as much as beauty, and a team they can trust from twelve thousand kilometres away. We would be honoured to bring you home for yours." Signed `[Founder name]`, Founder, Unify · Markcom.
- **Why Unify:** "Many planners sell beautiful weddings. Few sell certainty."
- **Values:** Certainty (clear pricing, timelines, contacts) · Care (for the couple, the parents and every guest) · Craft (the execution details others overlook) · Tradition (respect for ritual, with room for your own touch).
- **The Markcom legacy:** stat row: 25 years · `[__]` events delivered · `[__]` cities · `[__]` guests hosted.
- **The Markcom Standard:** a checklist attached to every proposal: written timelines for every event · backup plans for weather, power and vendors · defined on-site team ratios · itemised, written quotes · a vetted vendor network · a run-of-show for every ceremony.
- **Behind the scenes:** run-of-shows, backstage crews and control rooms, the corporate-grade process.
- **Trusted by:** a client logo grid of `[Client logo]` × 8 placeholders.
- **Our word to parents** (pull quote): "Twenty-five years of family celebrations, now made easier for your family abroad."

### Who we serve: chapter 03 (a section on About, or its own page)
- **Riya & Karan**, the second-generation couple, 28–33, NJ/CA/TX/IL. *Want* a grand multi-day heritage wedding done properly. *Worry about* overcharging, disorganisation, rituals done wrong. *Reassured by* real weddings, transparent pricing, an easy planner.
- **Aman & Priya**, India-born professionals, 30–37, in the US 5–10 years. *Want* zero stress, clarity, reliability. *Worry about* missing details from afar, time lost on calls. *Reassured by* a clear process, one contact, quick replies, itemised proposals.
- **The Patels**, parents and decision-makers, 55–65. *Want* rituals done correctly, elders' comfort, reputation, value. *Worry about* being cheated, poor guest experience, disrespect of tradition. *Reassured by* 25 years of history, references, a team they can meet.
- **"Every worry has an answer"** table (worry → how Unify answers):
  - "I can't plan from the US." → One planner, calls in your hours, weekly WhatsApp and video updates.
  - "Who can we trust in India?" → 25 years of Markcom, vetted vendors, written and itemised quotes.
  - "What will it cost?" → Budget tiers in dollars up front, no surprise additions.
  - "Guests are flying in." → Room blocks, an arrival desk, transfers, a guest helpdesk.
  - "Which destination?" → Destination quiz, shortlists, site visits, video walk-throughs.
  - "Will the rituals be right?" → Pandit coordination and a run-of-show for every ceremony.
  - "What if something goes wrong?" → Plans for weather, power and vendor no-shows, from decades on site.

### Services (`#services`, replacing `#experiences`): chapter 04
Six services, each with a headline, a line, and a **What's included** list:
1. **Concierge planning:** "One planner who knows your wedding by heart." Included: a dedicated planner, start to finish · calls in your time zone · weekly WhatsApp and video updates · a shared planning timeline · vendor sourcing, briefs and contracts · budget tracked against your proposal.
2. **Destinations & venues:** "The right place, chosen with you." Included: destination guidance and quiz · shortlists matched to guests and budget · site visits by our own team · virtual walk-throughs · room-block negotiation · permits and venue logistics.
3. **Rituals & ceremonies:** "Every ritual, done right." Included: pandit and priest coordination · rituals for both families' traditions · family-role planning · a run-of-show for every ceremony · ritual guides for non-Indian guests · ceremony materials and setup.
4. **Guest experience:** "Every guest, looked after." Included: room blocks and hotel liaison · an airport arrival desk · transfers to the hotel and every venue · personal guest itineraries · a guest WhatsApp helpdesk · comfort planning for elders.
5. **Design & celebration:** "A celebration that looks like you." Included: moodboards and colour stories · mandap and stage design · floral and décor direction · lighting and sound · stationery and signage · sangeet and entertainment.
6. **Contingency:** "Calm, whatever the weather." Included: weather backup spaces and cover · power backup and generators · standby vendors · on-site team ratios · an event control room · day-of run-of-show management.

Also on this page:
- **"You're in America. We're in India."** A time-zone strip: *While you sleep in New Jersey,* florists arrive in Udaipur for the mandap fitting · *On your morning commute,* the caterer runs an evening tasting of your menu · *Through your working day,* room blocks are confirmed and contracts signed · *When you get home,* your weekly video update is waiting.
- **The guest journey:** Before travel · Arrival · Transfers · The stay · Departure (details in the profile, p36).
- **The ceremonies:** Mehndi · Haldi · Sangeet · The wedding · Reception, each with one line (p37).
- **Behind every function:** Flowers · Power · Sound · Weather · Vendors · Guests (p38).

### Destinations (`#destinations`): chapter 05
"Palaces, forts, beaches and backwaters." Six destinations, each with a plate, a one-line description and an at-a-glance panel:

| Destination | Line | Why here | Best months | Venue types |
|---|---|---|---|---|
| Udaipur | The city of lakes and palaces | Lake palaces; strongest interest from couples abroad | Oct–Mar | Palace hotels, lakeside lawns, havelis |
| Jaipur | The Pink City's palaces, forts and gardens | Palaces, forts and gardens | Oct–Mar | Palace hotels, fort courtyards, garden estates |
| Jodhpur | The Blue City, beneath a desert fort | Dramatic forts, wide desert views | Oct–Mar | Fort terraces, palace hotels, desert camps |
| Goa | Sea, sand and an unhurried coastal rhythm | Relaxed beach celebrations | Nov–Feb | Beachfront resorts, villas, riverside lawns |
| Kerala | Backwaters, palms and a quieter kind of luxury | Intimate, nature-led, on the water | Sep–Mar (after the monsoon) | Backwater resorts, heritage homes, beaches |
| Gujarat | Heritage homes, and for many families, a homecoming | Heritage, close to family roots | Nov–Feb | Heritage palaces, havelis, garden estates |

Guest capacity, budget range and venues are `[__]`. Then:
- A **compare table** (destination · best for · season · guests · from).
- **"Find your destination in four questions":** a quiz (how many guests will travel · which months suit your family · palace, fort, beach or backwater · what budget band feels right) → suggested destinations, then "a planner follows up with a shortlist". Build it as a front-end quiz with simple scoring from the table above.
- **The Unify Venue Collection:** a `[Partner hotel]` × 6 grid. "Priority dates and preferred rates through Markcom's long-standing hotel relationships."

### How we work (`#process`): chapter 06
- **Five steps:** 01 Discovery call · 02 Itemised proposal (within five days) · 03 Planning together · 04 The celebration · 05 Every guest home. Each step has a "You receive" line (p67–71).
- **Twelve-month timeline:** 12 mo discovery call, destination, date · 10 mo venue booked, save-the-dates · 8 mo core vendors, room blocks · 6 mo design direction, ceremonies · 3 mo guest travel, itineraries · 1 mo final run-of-show · wedding week, the team on the ground.
- **Your client space:** a private space for timeline, budget, vendors and guest list. Describe it only; there's no app to build.
- **Service standards** (stat row): **2 hrs** to reply, within business hours · **3 days** to offer a consultation · **5 days** to send your itemised proposal · **Weekly** updates by WhatsApp and video.

### Our work (`#work`, replacing `#portfolio`): chapter 07
- Three **case studies**, each with a header (couple, destination, month/year, guests, functions, travelling from), the story (headline, the brief, what we did, the outcome) and a gallery. All `[__]` for now; use plates.
- **In their words:** three testimonials, all `[Testimonial]` placeholders.

### Investment (`#investment`): chapter 08
- **Collections:** Intimate (50–100 guests) · Classic (100–250) · Grand (250–400) · Palace (400+), each "From `[$__]`". "Indicative ranges, to help you plan. Every proposal is itemised, in writing, with no surprise additions."
- **Included in every collection:** a dedicated planner · venue sourcing and negotiation · guest travel, room blocks and transfers · vendor management across every function.
- **Sample proposal:** an itemised table (planning, venue, accommodation, décor, catering, photography and film, total), all `[$__]`.
- **Payment schedule:** `[__]%` on signing · at `[__]` months · at `[__]` months · `[__]` days before.
- **FAQ:** Do you quote in dollars? Yes, every proposal is itemised in USD · Are there hidden costs? No, anything not in your proposal needs written approval · Can guests pay their own travel? Yes, we can arrange room blocks guests book themselves · What if our plans change? `[policy TBC]`.

### Team & contact (`#enquire`): chapter 09
- **Our team:** "In New Jersey and in India", four `[Name] · [Role] · [City]` cards.
- **Partners:** photographers · bridal boutiques · creators · cultural networks, all `[once signed]`.
- **Planning FAQ:** How far ahead? Twelve months is ideal, but shorter works · Visit India first? No, we plan by video and in person from the US · Guest visas? `[TBC]` · Multi-faith weddings? `[TBC]`.
- **Next steps:** 01 Book a call (US or Indian hours) · 02 Share your vision · 03 Receive your proposal (itemised, within five days).
- **Enquiry form.** Rework the existing `form.enq` around the discovery call: names · email · phone/WhatsApp · where you live (city, US) · preferred call hours (US / India) · destination(s) of interest (the six plus "not sure") · approximate date · guest count · budget band (the four collections) · message. It stays front-end only, with no backend yet; keep the "prototype doesn't send" note.
- **Contact block:** `[name@unify.com]` · `[+1 ___ ___ ____]` · WhatsApp · `[unify.com]`. Show the address and number as selectable text, not just `mailto:` or `tel:`.
- **Terms ("The fine print, plainly"):** booking, payments, changes, cancellation, third-party vendors, force majeure, all `[TBC]`. A footer-linked section is enough.

### Footer
Add the main line, page links, the contact placeholders, WhatsApp, "Consultations offered in US and Indian hours", and "A Markcom company" (wording to confirm with Neel). Keep **Open the invitation again**.

---

## 5. Navigation (needs Neel's call; ask before finalising)

The Figma frame has **three links** right of a centred monogram. There are now seven destinations. Recommended: keep three in the bar (**Services · Destinations · Enquire**) and add a **Menu** that opens a full-screen paper overlay listing all pages. Update `views`, `href`s and the footer when you rename `experiences` → `services` and `portfolio` → `work`.

## 6. Assets still to come (leave placeholders)

Event photography (every `.plate`), destination photos, venue names, team photos, client and hotel logos, all prices and numbers, contact details, the founder's name, testimonials, the final venue film. The film swap keeps the same filenames; export commands are in `README.md`.

## 7. Working rules

- Build one chapter at a time. After each, check it at 1440px and 375px, in reduced-motion mode, and with a full replay of the invitation.
- Keep everything inside `.invite` / `.view` and use the tokens; no new colours or fonts.
- No libraries unless Neel asks. Three.js was mentioned as a maybe for later, not now.
- Keep the copy in the luxury tone: short, warm, certain. Avoid exclamation marks and hype.
- Accessibility: real headings in order, `<details>` for FAQs, labelled form fields, visible focus states, alt text on real images.
- **README.md is stale.** It still says the logos are missing. Update it when you finish.
- Commits follow the existing style: `feat: …` / `fix: …` with a bullet body. Bump `?v=` when CSS or JS change. Push to `origin main` only when Neel asks.

## 8. Open questions for Neel

1. Navigation: three links plus a Menu overlay (§5)?
2. Separate pages for Who we serve and How we work, or sections on About and Services?
3. Should "Events & Experiences" stay in the hero wordmark now that the positioning is weddings only?
4. Footer endorsement wording: "A Markcom company"?
5. Is the planning PDF from the earlier brief different from this company profile? If so, put it in `../` and reconcile.
