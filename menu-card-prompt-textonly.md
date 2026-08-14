# Prompt: Animated Premium Menu Card — The London Shakes (text-only / photo-ready)

> For claude.ai, Claude in a browser, or any Claude without access to my local files.
> Paste everything below the line as a single message.

---

Build me a **premium, highly animated in-restaurant menu card** for a café called **The London Shakes**.

## Context

This is what every customer sees the moment they walk in the door — the first impression of the brand. It must feel expensive, editorial and confident. Michelin-tier printed menu meets modern motion design. Not a food-delivery app. Not a generic restaurant template.

**There is no photography yet.** Carry the entire design on typography, rule work, spacing, colour and motion. This is a constraint, not a limitation — the best printed menus in the world have no photos at all. Do **not** use emoji as food icons, do **not** use placeholder image services, do **not** generate grey `img` boxes.

## Deliverable

A single **self-contained HTML file** — all CSS and JS inline. No CDN, no npm, no external assets, no build step. Any icon or ornament must be inline SVG you author yourself.

It has to work in three places:

1. **Wall-mounted / tabletop screen** (primary) — 1080×1920 portrait and 1920×1080 landscape, read from 1–3 metres away. Type must be legible at that distance.
2. **Customer phone** (secondary) — 375px wide, thumb-scrollable, zero horizontal overflow.
3. **Print** — a `@media print` stylesheet laying the full menu on A4 portrait, clean black-on-white, no animation, no dark background, nothing clipped.

## Brand

- **Name:** The London Shakes
- **Tagline:** Bold Flavours, Editorial Craft, Refined Grace
- **Positioning:** A milkshake bar and cozy eatery in Silchar — premium thick shakes, waffles, loaded burgers, creamy pastas, crisp snacks. British heritage flavour, Indian warmth.
- **Location:** T-22, 3rd Floor, near Goldighi Mall Office, Premtala, Silchar
- **Phone:** +91 97063 88102
- **Currency:** render as `₹109` — no decimals, no "INR", no trailing `.00`

### Design tokens (exact — this is the live brand palette)

**Light theme**
```
--gold:        #9E8043
--gold-bright: #B29555
--gold-pale:   #C8AC6C
--gold-dark:   #78602E
--ink:         #1C1915
--ink-muted:   #3D3728
```

**Dark theme** — the brand deliberately swaps gold → crimson in dark mode. Keep that rule.
```
--crimson:     #E11D2E
--crimson-br:  #FF2E48
--crimson-pale:#F2505F
--crimson-dark:#B21830
--paper:       #1A1714
--surface:     #161410
--panel:       #080604
--cream:       #F2EEE4
--cream-muted: #C8C0AE
--navy:        #1A2E4D
```

**Typography** — no font CDN. Use these families with solid local fallbacks:
- Display / dish names / section headers: `'Cormorant Garamond', Cormorant, Georgia, serif`
- Body: `'EB Garamond', Georgia, serif`
- Labels, prices, small caps, UI: `'Inter', 'Helvetica Neue', system-ui, sans-serif`

**Dark mode is the default** (it reads as more premium on a wall screen), with a light toggle that also respects `prefers-color-scheme`.

## Motion direction

"Highly animated" must mean *choreographed*, never busy.

- **Entrance:** a cinematic open — wordmark draws in via SVG stroke or clip-path, a hairline accent rule sweeps across, sections stagger up. Under 2 seconds total.
- **On scroll:** section headers and items reveal on `IntersectionObserver`, staggered ~40ms per item and capped so long sections don't crawl. Reveal once — never re-animate on scroll-back.
- **Price row:** leader dots between dish name and price draw left-to-right as the row enters.
- **Hover / tap:** the row lifts subtly, the accent warms, a soft glow blooms behind it. Must work on touch via `:active`.
- **Ambient:** slow drifting paper grain and a faint radial bloom behind section headers. Barely perceptible — depth, not decoration.
- **Category nav:** a sticky horizontal rail of category names with an animated indicator tracking the active section via scroll spy; clicking scrolls smoothly to it.
- **Signature moment:** one genuinely memorable flourish — a liquid pour transition on the hero, or self-drawing shake-swirl SVG line art. Pick one and execute it well. Do not add five.

**Hard constraints:** 60fps only — animate `transform` and `opacity`, never `top`/`left`/`width`/`height`. Honour `prefers-reduced-motion: reduce` by killing non-essential animation and showing final states immediately. Nothing loops infinitely in a way that distracts someone eating.

## Page system — the core structural rule

**This is a paged menu card, not a scrolling page.** Read this section carefully; it drives the whole build.

- The menu is divided into **discrete full-viewport pages**, like turning the leaves of a physical menu.
- **Maximum 2 categories per page. Never 3 or more.** One category alone on a page is allowed where the item count demands it.
- **Each page must fit its viewport completely with no internal scrolling.** Nothing clipped, nothing cut off, no scrollbar inside a page. If a page is tight, reduce to a two-column ledger before you reduce type size.
- Navigation: swipe left/right on touch, arrow keys and spacebar on desktop, click/tap zones on the left and right edges, plus a persistent page indicator (e.g. `03 / 08`) and a category rail that jumps straight to a page.
- The **page transition is the signature moment** — make it beautiful. A weighted turn, a liquid dissolve, or a layered slide with parallax between the outgoing and incoming page. One transition, executed superbly, used everywhere. It must run at 60fps and be instant under `prefers-reduced-motion`.
- **Print:** each page maps to exactly one A4 sheet via `page-break-after: always`. Eight pages in, eight sheets out.

### Per-category design identity

**Every category gets its own design.** Not just a different colour — a different *composition*. Vary across categories:

- the grid (single ledger, two-column, offset/asymmetric, centred stack)
- the header treatment (oversized display numeral, vertical side-set title, rule-boxed cartouche, full-width band)
- the accent tone, drawn from the palette (gold family in light, crimson family in dark, with navy as an occasional third)
- an authored SVG ornament unique to that category — a swirl for shakes, a citrus arc for mojitos, a wheat/grain mark for sandwiches, a flame for peri peri, and so on. Inline SVG line art only, no emoji, no clip art.
- the entrance choreography (items cascade down, unfold from the centre, wipe in from the side)

### Paired-page rule — how two categories share one page

When two categories sit on the same page, **the page is designed as a single composition, not two stacked blocks.** The pair must share:

- one page frame, one margin system, one background treatment
- one connective element that spans both — a shared spine rule, a continuous ornamental border, a full-width header band, or a single background gradient the split sits inside
- one entrance choreography, so the page resolves as one motion, not two

Within that shared frame, the two categories stay individually legible — distinct accents, distinct ornaments, distinct sub-layouts. **Vary the split per page** so no two pages divide the same way: horizontal 50/50, weighted 60/40, vertical columns, or a diagonal/offset division.

The test: each page should look like a spread a designer laid out deliberately for those two specific categories — never like a template with two slots filled in.

### Holding it together

Fifteen distinct category designs risk incoherence. Prevent that with a **shared skeleton, varied expression**:

- **Constant across every page:** type scale, margin system, price typography, leader-dot style, diet-tag style, page indicator, footer strip, transition.
- **Varied per category:** grid, header composition, accent, ornament, entrance.

If a page ever looks like it belongs to a different restaurant, the variation went too far.

## Layout direction

- **Page 0 — cover:** a full-bleed typographic hero. Wordmark, tagline, and a "turn" cue. Atmosphere from a deep gradient, grain and an authored SVG ornament — no photo. This is not one of the 8 menu pages.
- Dish rows use the classic fine-dining ledger: name left, leader dots, price right.
- Where a whole category shares one price (Vintage Shakes all ₹109, Chicken Delight all ₹169), show it once as a category-level price badge and drop the repeated per-row prices. Far cleaner, and it buys back vertical space.
- Add small `VEG` / `EGG` / `CHICKEN` markers as refined typographic tags — not emoji. Veg is the default; mark Egg and Chicken explicitly.
- A persistent slim footer strip on every page: address, phone, page indicator, and a quiet "Prices in ₹ · Taxes as applicable".
- **Page 9 — back page:** address, phone, hours, a thank-you line. Set like the closing leaf of a printed menu.
- Generous whitespace, long-form margins. Let it breathe like a printed menu, not a webpage.

## Build it photo-ready — this matters

I am shooting dish photography soon and will drop it in without redesigning. Architect for that now:

1. Store the menu as **one JS data array** at the top of the file. Every item object carries an `img` field, set to `null` for now:
   ```js
   { name: 'Nutella Waffle', price: 195, diet: 'veg', img: null }
   ```
2. Render from that array. Write the item component so that when `img` is a path it renders a **fixed-ratio media frame** (`overflow: hidden`, `object-fit: cover`, `object-position: center`, lazy loading, explicit dimensions), and when `img` is `null` it renders the ledger row. Both paths must already exist and both must look finished.
3. Photos will have **inconsistent aspect ratios** — square, portrait and landscape mixed. The frame must crop to a uniform ratio, never letterbox or stretch.
4. Leave a commented `// PHOTO GRID` block showing exactly how a category flips from ledger mode to grid mode — ideally a single flag per category.
5. The design must look complete and premium **today with zero photos**. Photos should be an enhancement, not the thing holding it together.

## The menu — 74 items, 15 categories, 8 pages

Use this pagination exactly. The pairings are thematic and the item counts are balanced to fit.

---

### PAGE 1 — *The Classics* · 10 items
Two heritage shake families. Pair them warm and traditional.

**Vintage Shakes** — all ₹109
Butterscotch · Classic Kulfi · Mango · Rose · Strawberry · Vanilla

**Choco Love** — all ₹140
Choco Chips · Choco Love · Choco Oreo · Kit-Kat

---

### PAGE 2 — *Fruit & Fun* · 11 items
The playful, colourful end of the shake menu. Brightest page in the deck.

**Fruit 'o' Clock** — all ₹140
Banana Blast · Banana Burst · Blue Blast · Kiwi Cuddle · Melting Pan · Raspberry · Rose Rabdi

**The FuntaStick Shakes** — all ₹120
Choco Kulfi · Choco Strawberry · Chocolate Paan · Kesar Badam

---

### PAGE 3 — *Cold & Refreshing* · 11 items
Coffee against citrus. Coolest, crispest page — lean on the navy accent here.

**Cold Coffee** — all ₹99
Choco Coffee · Cold Coffee · Mango · Roasted Hazelnut Coffee

**Mojito**
- Blue Magic — ₹119
- Cojito — ₹119
- Green Apple — ₹119
- Litchi — ₹119
- Mango Lime — ₹119
- Radusion — ₹119
- Blueberry — ₹129

---

### PAGE 4 — *Sweet Finish* · 8 items
Lassi and dessert. The most indulgent page — richest treatment in the deck.

**From London To India** — all ₹129
Mango Lassi · Paan Lassi

**Waffles**
- Choco Ice Cream Waffle — ₹165
- Ice Cream Waffle — ₹165
- Kit-Kat Waffle — ₹165
- Oreo Waffle — ₹165
- Choco Loaded Waffle — ₹185
- Nutella Waffle — ₹195

---

### PAGE 5 — *The Sandwich Bar* · 13 items
**Single category — this one gets the whole page.** 13 items, so use a two-column ledger and let the category own the full spread. Make it feel like a deliberate centrepiece, not an overflow.

**Sandwiches**
- Butter Toast — ₹50
- Cheese Butter Toast — ₹60
- Veg Grilled Sandwich — ₹80
- Rice Creamy Sandwich — ₹90
- Veg Mayo Sandwich — ₹98
- Veg Mayo Cheese Sandwich — ₹105
- Chocolate Sandwich — ₹119
- Paneer Sandwich — ₹119
- Veg Mayo Cheese Corn Sandwich — ₹129
- Veg Mayo Corn Sandwich — ₹129
- Veg Mayo Paneer Corn Sandwich — ₹129
- Egg Sandwich — ₹139 *(EGG)*
- Chicken Sandwich — ₹149 *(CHICKEN)*

---

### PAGE 6 — *Stacked & Loaded* · 8 items
Burgers and chicken. Boldest, heaviest page — strongest crimson/gold weight.

**Burgers**
- Veg Burger — ₹119
- Paneer Cheese Burger — ₹149

**Chicken Delight** — all ₹169 *(all CHICKEN)*
Chicken Burger · Chicken Fingers · Chicken Nuggets · Chicken Patty · Chicken Popcorn · Chicken Wings

---

### PAGE 7 — *Hot & Crispy* · 9 items
Fries and Maggi — the comfort page. Casual, warm, a little more relaxed than page 6.

**Fries**
- Spice Fries — ₹110
- BBQ Fries — ₹139
- Peri Peri Fries — ₹139
- Creamy Cheesy Fries — ₹149

**Maggi**
- Veg Maggi — ₹78
- Tandoori Maggi — ₹79
- Paneer Maggi — ₹119
- Egg Maggi — ₹129 *(EGG)*
- Chicken Maggi — ₹149 *(CHICKEN)*

---

### PAGE 8 — *From the Pan* · 4 items
Only 4 items — the quietest, most elegant page. Use the space; do not inflate the type to fill it. Let this one close the menu calmly.

**Pasta**
- Spice Masala Pasta — ₹165
- Egg Pasta — ₹175 *(EGG)*
- Chicken Pasta — ₹185 *(CHICKEN)*

**Spaghetti**
- Chicken Spaghetti — ₹195 *(CHICKEN)*

## Rules

- Use **only** the items and prices above. Do not invent dishes, descriptions, or "chef's recommendation" tags I didn't give you.
- Spell every item name exactly as written above.
- Follow the page assignments exactly. **Never put 3+ categories on a page.**
- No frameworks, no npm, no CDN, no external assets of any kind.

**Before you tell me it's done, verify:**
1. All **74 items** render across **8 pages** — count them.
2. No page has more than 2 categories.
3. No page scrolls internally or clips content at 1080×1920, at 1920×1080, and at 375px wide.
4. Every one of the 15 categories has a visibly different design from the others.
5. Each paired page reads as one composition, and no two pages use the same split.
6. Print preview produces 8 clean A4 sheets.

Then show me screenshots of pages 1, 3, 5 and 8 in dark mode, page 1 in light mode, and one page on mobile.
