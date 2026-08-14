# Prompt: Animated Premium Menu Card — The London Shakes

> Paste everything below the line into Claude Code as a single message.

---

Build me a **premium, highly animated in-restaurant menu card** for a café called **The London Shakes**.

## Context

This menu card is what every customer sees the moment they walk in the door — it is the first impression of the brand. It must feel expensive, editorial, and confident. Think Michelin-tier printed menu meets a modern motion-designed web experience. Not a food-delivery app. Not a generic restaurant template.

## Deliverable

`menu-card.html` plus the `menu-card-assets/` folder that ships with this prompt. All CSS and JS inline in the HTML — no CDN, no npm, no build step. Images load from `menu-card-assets/dishes/`, so keep the HTML file as a sibling of that folder. It must work by double-clicking the file.

It has to work in three places:

1. **Wall-mounted / tabletop screen** (primary) — 1080×1920 portrait and 1920×1080 landscape, viewed from 1–3 metres away. Type must be readable at that distance.
2. **Customer phone** (secondary) — 375px wide, thumb-scrollable, no horizontal overflow anywhere.
3. **Print** — a `@media print` stylesheet that lays the full menu out on A4 portrait in clean black-on-white with no animation, no dark background, and no clipped items.

## Brand

- **Name:** The London Shakes
- **Tagline:** Bold Flavours, Editorial Craft, Refined Grace
- **Positioning:** A milkshake bar and cozy eatery in Silchar — premium thick shakes, waffles, loaded burgers, creamy pastas and crisp snacks. British heritage flavour, Indian warmth.
- **Location:** T-22, 3rd Floor, near Goldighi Mall Office, Premtala, Silchar
- **Phone:** +91 97063 88102
- **Currency:** Indian Rupee — render as `₹109`, no decimals, no "INR", no trailing `.00`

### Design tokens (use these exactly — they are the live brand palette)

**Light theme**
```
--gold:        #9E8043
--gold-bright: #B29555
--gold-pale:   #C8AC6C
--gold-dark:   #78602E
--ink:         #1C1915
--ink-muted:   #3D3728
```

**Dark theme** (the brand deliberately swaps gold → crimson in dark mode — keep that rule)
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

**Typography** — load via `@font-face` from Google Fonts is NOT allowed (no network). Use these families with robust local fallbacks:
- Display / dish names / section headers: `'Cormorant Garamond', 'Cormorant', Georgia, serif`
- Body / descriptions: `'EB Garamond', Georgia, serif`
- Labels, prices, small caps, UI: `'Inter', 'Helvetica Neue', system-ui, sans-serif`

Make **dark mode the default** (it reads as more premium on a wall screen), with a light-mode toggle that also respects `prefers-color-scheme`.

## Motion direction

"Highly animated" must mean *choreographed*, never busy. Everything below is CSS-first; use JS only for scroll observation and the toggle.

- **Entrance:** a cinematic open — the wordmark draws in (SVG stroke or clip-path reveal), a hairline gold/crimson rule sweeps across, then sections stagger up. Total under 2 seconds.
- **On scroll:** each section header and its items reveal on `IntersectionObserver` with a staggered `transition-delay` (roughly 40ms per item, capped so long sections don't crawl). Reveal once — never re-animate on scroll-back.
- **Price row:** the leader dots between dish name and price draw left-to-right as the row enters.
- **Hover / tap:** dish row lifts subtly, the accent colour warms, a soft glow blooms behind it. Must also work on touch (`:active`).
- **Ambient:** a very slow drifting grain/paper texture and a faint radial light bloom behind section headers. Barely perceptible — it should register as depth, not decoration.
- **Category nav:** a sticky horizontal rail of category names with an animated underline/pill that tracks the active section via scroll spy. Clicking scroll-snaps smoothly to that section.
- **Signature moment:** one genuinely memorable flourish — e.g. a liquid/pour transition on the hero, or shake-swirl SVG line art that self-draws once. Pick one, execute it well, do not add five.

**Hard constraints on motion:** 60fps only — animate `transform` and `opacity`, never `top`/`left`/`width`/`height`. Honour `prefers-reduced-motion: reduce` by disabling all non-essential animation and showing final states immediately. Nothing may loop infinitely in a way that's distracting to someone eating.

## Images

Real dish photography ships with this prompt in `menu-card-assets/`. **43 of the 74 items have a photo; 31 do not.** That imbalance is the central design problem — solve it deliberately, do not paper over it.

- `menu-card-assets/manifest.json` maps every photo to its item: `{ name, category, price, file, w, h, kb }`. **Read this file first** and drive the build from it — match photos to items by the `file` path in the manifest, never by guessing filenames.
- Filenames follow `dishes/<category-slug>--<item-slug>.jpg`, e.g. `dishes/waffle--nutella-waffle.jpg`, `dishes/mojito--blue-magic.jpg`.
- Photos are JPEG, 13–106 KB each, ~1.8 MB total.
- **Aspect ratios are inconsistent** — square (400×400, 600×600), portrait (400×600, 335×597), landscape (686×386, 678×452), and one small 183×275. Never letterbox or stretch. Use a fixed-ratio frame with `object-fit: cover` and `object-position: center` so every tile is visually uniform regardless of source.
- The smallest file (183×275) will look soft if blown up large — cap displayed size so it stays crisp, or give it a smaller tile.

**Handling the 31 items with no photo — this is the important part.** Do not leave holes and do not generate placeholder images.

Use a **two-tier layout**: photo-led items become visual cards; text-only items stay as elegant ledger rows. Both must feel intentional, like the card was designed that way.

- Photo-led categories (every item has a photo): **Fruit 'o' Clock, The FuntaStick Shakes, Cold Coffee, Mojito, Waffles, Burgers, Fries, Maggi, Pasta, Spaghetti** — render as a photo grid.
- Text-only categories (no item has a photo): **Vintage Shakes, Choco Love, From London To India, Sandwiches, Chicken Delight** — render as premium typographic ledger sections. Give these a distinct treatment so they read as a deliberate change of rhythm: heavier rules, a tinted panel, larger display type, generous leading. A well-set text section beats a grid full of empty boxes.
- For a text-only category, you may set **one** relevant existing photo as a soft, low-opacity band or masked backdrop behind the section header — pull it from the closest matching category. Do not attach borrowed photos to individual dish rows; that would misrepresent the dish.

Which pages this lands on is set out in the page system below — see **Mixed photo/text pages**.

Also available in `menu-card-assets/` for atmosphere — interiors and category banners, useful for the hero, section dividers and the footer:
`cafe-interior-1.jpg` … `cafe-interior-5.jpg`, `menu-burger.png`, `menu-pasta.png`, `menu-fries.png`, `menu-coffee.png`, `menu-sandwich.png`, `menu-noodle.png`, `menu-nuggets.png`

**Image motion and performance**
- Photos scale up gently on hover/tap (`transform: scale(1.04)`) inside an `overflow: hidden` frame — never animate the frame itself.
- Reveal each photo with a mask/clip-path wipe plus a slight scale settle as it scrolls in, staggered with its row.
- Add `loading="lazy"` and `decoding="async"` to every image below the fold, and explicit `width`/`height` attributes from the manifest so nothing shifts while loading.
- Every image needs a real `alt` — the dish name.
- In print, photos must not bleed or blow out: constrain them, or drop to the text ledger for the print stylesheet.

## Page system — the core structural rule

**This is a paged menu card, not a scrolling page.** Read this section carefully; it drives the whole build.

- The menu is divided into **discrete full-viewport pages**, like turning the leaves of a physical menu.
- **Maximum 2 categories per page. Never 3 or more.** One category alone on a page is allowed where the item count demands it.
- **Each page must fit its viewport completely with no internal scrolling.** Nothing clipped, no scrollbar inside a page. If a page is tight, shrink the photo frames or drop to a two-column ledger before you shrink the type.
- Navigation: swipe on touch, arrow keys and spacebar on desktop, click/tap zones on the left and right edges, plus a persistent page indicator (`03 / 08`) and a category rail that jumps straight to a page.
- The **page transition is the signature moment** — a weighted turn, a liquid dissolve, or a layered slide with parallax. One transition, executed superbly, used everywhere. 60fps, and instant under `prefers-reduced-motion`.
- **Print:** each page maps to exactly one A4 sheet via `page-break-after: always`. Eight pages in, eight sheets out.

### Per-category design identity

**Every category gets its own design.** Not just a different colour — a different *composition*. Vary across categories:

- the grid (photo grid, single ledger, two-column, offset/asymmetric, centred stack)
- the header treatment (oversized display numeral, vertical side-set title, rule-boxed cartouche, full-width band)
- the accent tone from the palette (gold family in light, crimson family in dark, navy as an occasional third)
- an authored inline-SVG ornament unique to that category — a swirl for shakes, a citrus arc for mojitos, a grain mark for sandwiches, a flame for peri peri. Line art only, no emoji, no clip art.
- the entrance choreography (cascade down, unfold from centre, wipe in from the side)

### Paired-page rule — how two categories share one page

When two categories sit on the same page, **the page is designed as a single composition, not two stacked blocks.** The pair must share:

- one page frame, one margin system, one background treatment
- one connective element spanning both — a shared spine rule, a continuous ornamental border, a full-width header band, or a single background gradient the split sits inside
- one entrance choreography, so the page resolves as one motion, not two

Within that shared frame the two categories stay individually legible — distinct accents, ornaments and sub-layouts. **Vary the split per page** so no two pages divide the same way: horizontal 50/50, weighted 60/40, vertical columns, or a diagonal/offset division.

The test: each page should look like a spread a designer laid out deliberately for those two specific categories — never like a template with two slots filled in.

### Mixed photo/text pages — the hard case

Photo coverage is uneven, so pages fall into three types (marked in the menu below):

- **PHOTO pages** (2, 3, 7, 8) — every item has a photo. Full photo-grid treatment.
- **TEXT pages** (1, 5) — no item has a photo. Pure typographic ledger, richly set.
- **MIXED pages** (4, 6) — one category has photos, the other has none.

Mixed pages need the most care. Do **not** let the photo half visually crush the text half. Give the text category compensating weight — larger display type, a tinted panel, heavier rules, more negative space — so the two halves balance as equals. A well-set text block next to a photo grid should read as counterpoint, not as the half that's missing something.

### Holding it together

Fifteen distinct category designs risk incoherence. Prevent that with a **shared skeleton, varied expression**:

- **Constant across every page:** type scale, margin system, price typography, leader-dot style, diet-tag style, page indicator, footer strip, transition, photo-frame ratio.
- **Varied per category:** grid, header composition, accent, ornament, entrance.

If a page ever looks like it belongs to a different restaurant, the variation went too far.

## Layout direction

- **Page 0 — cover:** a full-bleed hero. Wordmark, tagline, and a "turn" cue over a café interior shot, heavily darkened with a gradient scrim so type stays legible. Not one of the 8 menu pages.
- Dish rows use the classic fine-dining ledger: name left, leader dots, price right. Where a whole category shares one price (Vintage Shakes all ₹109, Chicken Delight all ₹169), show it once as a category-level price badge and drop the repeated per-row prices — cleaner, and it buys back vertical space.
- Add small `VEG` / `EGG` / `CHICKEN` markers as refined typographic tags, not emoji. Veg by default; mark Egg and Chicken explicitly.
- A persistent slim footer strip on every page: address, phone, page indicator, and a quiet "Prices in ₹ · Taxes as applicable".
- **Page 9 — back page:** address, phone, hours, a thank-you line, set like the closing leaf of a printed menu.
- Generous whitespace. Long-form margins. Let it breathe like a printed menu, not a webpage.

## The menu — 74 items, 15 categories, 8 pages

Use this pagination exactly. Pairings are thematic and item counts are balanced to fit. Each page is tagged with its photo coverage.

---

### PAGE 1 — *The Classics* · 10 items · **TEXT**
Two heritage shake families, neither with photos. Warm, traditional, richly set type.

**Vintage Shakes** — all ₹109
Butterscotch · Classic Kulfi · Mango · Rose · Strawberry · Vanilla

**Choco Love** — all ₹140
Choco Chips · Choco Love · Choco Oreo · Kit-Kat

---

### PAGE 2 — *Fruit & Fun* · 11 items · **PHOTO** (all 11)
The playful, colourful end of the shake menu. Brightest page in the deck.

**Fruit 'o' Clock** — all ₹140
Banana Blast · Banana Burst · Blue Blast · Kiwi Cuddle · Melting Pan · Raspberry · Rose Rabdi

**The FuntaStick Shakes** — all ₹120
Choco Kulfi · Choco Strawberry · Chocolate Paan · Kesar Badam

---

### PAGE 3 — *Cold & Refreshing* · 11 items · **PHOTO** (all 11)
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

### PAGE 4 — *Sweet Finish* · 8 items · **MIXED** (Waffles have photos, Lassi does not)
The most indulgent page. Waffles carry the imagery; give the two lassis compensating typographic weight so they hold their side.

**From London To India** — all ₹129 · *no photos*
Mango Lassi · Paan Lassi

**Waffles** — *all 6 have photos*
- Choco Ice Cream Waffle — ₹165
- Ice Cream Waffle — ₹165
- Kit-Kat Waffle — ₹165
- Oreo Waffle — ₹165
- Choco Loaded Waffle — ₹185
- Nutella Waffle — ₹195

---

### PAGE 5 — *The Sandwich Bar* · 13 items · **TEXT**
**Single category — this one gets the whole page.** 13 items, no photos, so use a two-column ledger and let the category own the full spread. Make it a deliberate typographic centrepiece, not an overflow.

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

### PAGE 6 — *Stacked & Loaded* · 8 items · **MIXED** (Burgers have photos, Chicken Delight does not)
Boldest, heaviest page. Only 2 burgers but both have photos — run them large. The 6 chicken items are text-only, so give them a strong ledger block that balances the two big burger images.

**Burgers** — *both have photos*
- Veg Burger — ₹119
- Paneer Cheese Burger — ₹149

**Chicken Delight** — all ₹169 *(all CHICKEN)* · *no photos*
Chicken Burger · Chicken Fingers · Chicken Nuggets · Chicken Patty · Chicken Popcorn · Chicken Wings

---

### PAGE 7 — *Hot & Crispy* · 9 items · **PHOTO** (all 9)
Fries and Maggi — the comfort page. Casual and warm, more relaxed than page 6.

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

### PAGE 8 — *From the Pan* · 4 items · **PHOTO** (all 4)
Only 4 items, all photographed — so run the images large and editorial. The quietest, most elegant page; use the space rather than inflating type to fill it. Let this close the menu calmly.

**Pasta**
- Spice Masala Pasta — ₹165
- Egg Pasta — ₹175 *(EGG)*
- Chicken Pasta — ₹185 *(CHICKEN)*

**Spaghetti**
- Chicken Spaghetti — ₹195 *(CHICKEN)*

## Rules

- Use **only** the items and prices above. Do not invent dishes, do not invent descriptions, do not add "chef's recommendation" tags I didn't give you.
- Keep every item name spelled exactly as written above.
- Never attach a photo to an item the manifest doesn't have one for.
- Follow the page assignments exactly. **Never put 3+ categories on a page.**
- Store the menu as a single JS data array at the top of the file — page number, category, item name, price, diet tag, and image path resolved from the manifest — and render everything from it, so I can edit prices in one place.
- No frameworks, no npm, no CDN. Any icon must be inline SVG you author. The only external files are the images in `menu-card-assets/`.

**Before you tell me it's done, verify in the browser preview:**
1. All **74 items** render across **8 pages** — count them.
2. No page has more than 2 categories.
3. No page scrolls internally or clips content at 1080×1920, at 1920×1080, and at 375px wide.
4. Every one of the 15 categories has a visibly different design from the others.
5. Each paired page reads as one composition, and no two pages use the same split.
6. On pages 4 and 6, the text-only category holds its own against the photo category.
7. Zero image 404s in the network log.
8. Print preview produces 8 clean A4 sheets.

Then show me screenshots of pages 1, 3, 4, 5 and 8 in dark mode, page 1 in light mode, and one page on mobile.
