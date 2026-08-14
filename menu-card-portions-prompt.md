# Prompt: Add Portion Sizes & Pricing — The London Shakes menu card

> **Add-on prompt.** Paste this as a follow-up message after the menu card has been built,
> in the same conversation. It assumes the 8-page card already exists.
>
> ⚠️ **BEFORE YOU PASTE THIS:** the prices in the table below are a *proposal*, not real data.
> Your database only stores one flat price per item. Replace every number below with your
> actual portion pricing, then paste. See "How these numbers were derived" at the bottom.

---

Add **portion sizes and per-size pricing** to the menu card.

## What changes

Right now every item shows one price. Some categories need to show **multiple sizes at different prices**, and the design has to absorb that without losing its calm.

Not every category gets sizes. Three different size systems apply, and each needs its own visual treatment:

| System | Sizes | Applies to |
|---|---|---|
| **Volume** | Small · Medium · Large | All shakes, coffees, mojitos, lassi (34 items) |
| **Portion** | Regular · Large | Fries (4 items) |
| **Piece count** | 4 pc · 6 pc · 8 pc | Chicken Delight (6 items) |
| **Single** | *(no sizes)* | Waffles, Sandwiches, Burgers, Maggi, Pasta, Spaghetti (30 items) |

## Design requirements

- **Medium / Regular / 6 pc is the default** — set it visually as the anchor. The other sizes read as secondary, not as three competing prices.
- Do **not** turn dish rows into three-column price tables. That kills the fine-dining ledger and makes the page look like a spreadsheet.
- Preferred treatment: the dish name holds one **anchor price** (the default size), with the other sizes as a compact inline size-scale — small caps `S · M · L` with their prices set smaller, lighter, and in the muted tone directly beneath or beside the name.
- Where an entire category shares one size ladder (all Vintage Shakes are ₹89 / ₹109 / ₹139), **state the ladder once in the category header** as a price key, then show no per-row prices at all. This is the single biggest win available — it keeps 6 items reading as 6 clean names instead of 18 numbers.
- Use per-row size pricing only where prices differ within the category — that is **Mojito** (Blueberry is ₹10 higher at every size) and **Fries** (all four differ).
- Single-portion categories keep exactly the current treatment. Do not add a size marker meaning "one size" — absence is the marker.
- Add a small legend on the cover or back page explaining the three systems, set quietly.

## Layout constraints — these still hold

- **The no-scroll rule is absolute.** Portion prices add vertical weight to every drinks page. If a page no longer fits at 1080×1920, fix it by moving to the category-level price key, tightening leading, or going two-column — **never** by shrinking type below legible-at-3-metres, and **never** by letting the page scroll.
- Pages 1, 2, 3 and 4 carry all the sized items and will feel the pressure most. Pages 5–8 barely change.
- Still max 2 categories per page. Pagination does not change.
- Print: still 8 clean A4 sheets.

## Motion

- The size scale reveals with its dish row — do not give it a separate animation pass.
- On hover/tap of a row, the size scale may brighten subtly. Nothing more; sizes are reference information, not interactive controls. **This is a display menu, not an ordering screen** — no toggles, no selected state, no buttons.

## Data structure

Extend the item objects in the existing data array. Keep one shape for everything:

```js
// single-portion item — unchanged
{ name: 'Nutella Waffle', price: 195, diet: 'veg', sizes: null }

// item with a size ladder
{ name: 'Butterscotch', diet: 'veg', sizes: [
    { label: 'S', price: 89 },
    { label: 'M', price: 109, default: true },
    { label: 'L', price: 139 }
]}
```

Categories where every item shares a ladder should define it **once at category level** and let items inherit, so I can change a whole category's pricing in one edit:

```js
{ id: 'vintage-shakes', name: 'Vintage Shakes',
  sizeLadder: [ {label:'S',price:89}, {label:'M',price:109,default:true}, {label:'L',price:139} ] }
```

---

## The pricing

### Volume sizes — Small · Medium · Large

Flat per category, so render each of these as a **category-level price key**:

| Category | Small | Medium *(default)* | Large |
|---|---|---|---|
| Vintage Shakes | ₹89 | **₹109** | ₹139 |
| The FuntaStick Shakes | ₹99 | **₹120** | ₹150 |
| Choco Love | ₹119 | **₹140** | ₹170 |
| Fruit 'o' Clock | ₹119 | **₹140** | ₹170 |
| Cold Coffee | ₹79 | **₹99** | ₹129 |
| From London To India *(lassi)* | ₹109 | **₹129** | ₹159 |

**Mojito** — per item, because Blueberry differs:

| Item | Small | Medium *(default)* | Large |
|---|---|---|---|
| Blue Magic | ₹99 | **₹119** | ₹149 |
| Cojito | ₹99 | **₹119** | ₹149 |
| Green Apple | ₹99 | **₹119** | ₹149 |
| Litchi | ₹99 | **₹119** | ₹149 |
| Mango Lime | ₹99 | **₹119** | ₹149 |
| Radusion | ₹99 | **₹119** | ₹149 |
| Blueberry | ₹109 | **₹129** | ₹159 |

### Portion sizes — Regular · Large

| Item | Regular *(default)* | Large |
|---|---|---|
| Spice Fries | **₹110** | ₹150 |
| BBQ Fries | **₹139** | ₹179 |
| Peri Peri Fries | **₹139** | ₹179 |
| Creamy Cheesy Fries | **₹149** | ₹189 |

### Piece count — 4 pc · 6 pc · 8 pc

Flat across the category — render as a category-level price key:

| Category | 4 pc | 6 pc *(default)* | 8 pc |
|---|---|---|---|
| Chicken Delight *(all 6 items)* | ₹169 | **₹229** | ₹289 |

### No sizes — single portion only

Waffles · Sandwiches · Burgers · Maggi · Pasta · Spaghetti — keep their existing single prices exactly as they are.

## Verify before telling me it's done

1. All **74 items** still render across **8 pages**.
2. The 34 volume items, 4 fries and 6 chicken items show size pricing; the other 30 show a single price.
3. No page scrolls or clips at 1080×1920, 1920×1080, or 375px wide — **check pages 1–4 especially**.
4. Category-level price keys are used wherever a category shares a ladder; per-row pricing appears only in Mojito and Fries.
5. Print preview is still 8 clean A4 sheets.
6. No interactive size selectors anywhere — this is a display menu.

---

# How these numbers were derived — READ THIS

**These are not your real prices.** Your database stores exactly one price per item and has no
portion data at all, so there was nothing real to pull. I generated the table above from your
actual base prices using a fixed rule, purely so the prompt has a complete, coherent structure
to design against.

The rule used:

- Your current price becomes **Medium / Regular / 6 pc** — that number is real.
- **Small** = Medium − ₹20, rounded to a 9-ending.
- **Large** = Medium + ₹30 (Fries Large = +₹40, since fries scale by volume more cheaply).
- **Chicken** steps by +₹60 per size, treating the current ₹169 as the 4 pc price.

Two consequences worth noting:

1. **Chicken Delight is the one place the base price moves.** Treating ₹169 as 4 pc makes the
   default 6 pc portion ₹229. If ₹169 is actually your standard portion, set 6 pc = ₹169 and
   work outward instead — otherwise your menu shows a price rise.
2. Every other category keeps its current price as the default size, so a customer comparing
   the new card against the old one sees no increase on the anchor price.

**Replace the numbers with your real ones before using this.** If you don't have portion pricing
set yet, the rule above is a reasonable starting point for a café at your price level — but it is
a starting point, not a recommendation, and pricing is your call.

## Separately: portions don't work on the live website either

Your admin panel at `/admin/menu` has a complete portions editor — small/medium/large toggles
with per-size price fields, plus validation. But `MenuItem` in `prisma/schema.prisma` has no
portions column, and `POST /api/menu-items` doesn't read or write one. So anything entered there
is silently discarded on save, and `item.portions` is always undefined on the customer menu —
which is why the size buttons never appear.

Making portions work on the site needs a schema migration, an API change, and a seed update.
That's a separate job from the menu card, but worth doing before you enter pricing twice.
