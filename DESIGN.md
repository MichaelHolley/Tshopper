---
name: Tshopper
description: A household shopping list built for one hand in a grocery aisle.
colors:
  grocery-green: 'oklch(0.527 0.154 150.069)'
  grocery-green-dark: 'oklch(0.72 0.168 152)'
  grocery-green-foreground: 'oklch(0.982 0.018 155.826)'
  grocery-green-foreground-dark: 'oklch(0.19 0.05 155)'
  paper: 'oklch(0.994 0.004 150)'
  paper-dark: 'oklch(0.163 0.014 158)'
  surface: 'oklch(1 0.002 150)'
  surface-dark: 'oklch(0.222 0.018 158)'
  ink: 'oklch(0.17 0.014 155)'
  ink-dark: 'oklch(0.965 0.008 150)'
  ink-muted: 'oklch(0.535 0.018 155)'
  ink-muted-dark: 'oklch(0.715 0.022 152)'
  hairline: 'oklch(0.9 0.011 150)'
  hairline-dark: 'oklch(0.85 0.05 155 / 13%)'
  fill-quiet: 'oklch(0.965 0.007 150)'
  fill-quiet-dark: 'oklch(0.272 0.018 158)'
  alert: 'oklch(0.577 0.245 27.325)'
  alert-dark: 'oklch(0.704 0.191 22.216)'
  focus-ring: 'oklch(0.62 0.09 150)'
  focus-ring-dark: 'oklch(0.72 0.168 152 / 70%)'
  row-raised: 'oklch(1 0.002 150)'
  row-raised-dark: 'oklch(0.232 0.019 158)'
  row-sunk: 'oklch(0.955 0.008 150)'
  row-sunk-dark: 'oklch(0.132 0.012 158)'
  store-color: 'the active store\'s own color, set by the household'
  store-canvas: 'color-mix(in oklab, {colors.store-color} 7%, {colors.paper})'
  store-raised: 'color-mix(in oklab, {colors.store-color} 4%, {colors.row-raised})'
  store-edge: 'color-mix(in oklab, {colors.store-color} 15%, transparent)'
  store-quiet: 'color-mix(in oklab, {colors.store-color} 12%, transparent)'
  store-selected: 'color-mix(in oklab, {colors.store-color} 22%, transparent)'
typography:
  title:
    fontFamily: "'Inter Variable', sans-serif"
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: '1.75rem'
    letterSpacing: '-0.025em'
  body:
    fontFamily: "'Inter Variable', sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: '1.25'
  label:
    fontFamily: "'Inter Variable', sans-serif"
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: '1.25rem'
  caption:
    fontFamily: "'Inter Variable', sans-serif"
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: '1rem'
rounded:
  sm: '0.27rem'
  md: '0.36rem'
  lg: '0.45rem'
  xl: '0.63rem'
  pill: '9999px'
spacing:
  row: '0.625rem'
  gap: '0.5rem'
  gutter: '1rem'
  section: '1rem'
components:
  button-primary:
    backgroundColor: '{colors.grocery-green}'
    textColor: '{colors.grocery-green-foreground}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0 0.625rem'
    typography: '{typography.label}'
  button-outline:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0 0.625rem'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '2rem'
  button-destructive:
    backgroundColor: 'color-mix(in oklch, {colors.alert} 10%, transparent)'
    textColor: '{colors.alert}'
    rounded: '{rounded.lg}'
    height: '2rem'
  button-icon:
    rounded: '{rounded.lg}'
    size: '2rem'
  input:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '2rem'
    padding: '0.25rem 0.625rem'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '1rem'
  list-row:
    backgroundColor: '{colors.row-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    minHeight: '2.75rem'
    padding: '0.5rem 0.75rem'
    gap: '0.5rem'
  store-chip:
    rounded: '{rounded.lg}'
    height: '1.75rem'
    padding: '0 0.625rem'
    typography: '{typography.caption}'
---

# Design System: Tshopper

## Overview

**Creative North Star: "The Aisle Companion"**

Tshopper is designed for a person standing in a grocery aisle with one hand on a cart and the other
on a phone. Everything in the system answers to that scene. Rows are tall enough to hit without
looking twice, the list occupies the full column, and there is exactly one saturated color on screen
at a time: the color of the store you are standing in. Green is held back for _this is the button
that does the thing_. Nothing decorative earns its pixels.

The system is deliberately flat in-page with one exception, and the exception is the list itself:
items you still need are raised off the page, items you have picked up are pressed into it, so the
list's shape tells you how far you are before you read a word. Containers stay a single 1px ring,
and the shadow that lifts a row is kept small so overlays — dialogs, sheets, and menus — still own
the large drop shadow that marks a temporary layer. Type is one family, Inter
Variable, worked through weight and size rather than contrast between faces. The interface is
compact by intent: 32px controls, 0.45rem corners, tight gutters, and a 672px reading column.

The desktop is the same companion at a different moment — not in the aisle but at the kitchen table,
planning, with a mouse and a keyboard and a screen that can hold the whole list at once. So the
desktop earns a real frame: the stores that scrolled sideways on a phone stand still in a rail with
their counts visible, the list that ran off the fold flows into ruled columns, and the assistant that
had to cover the list sits beside it instead. Nothing is added that the phone does not have; what
the phone had to hide, the desktop shows.

Color energy comes from the store you are standing in. The household picks a color per store, and
that color is not a label — it washes the canvas, the item rows, the edges and the header, so the
app looks like a different shop for each shop. Green stays behind, reserved for action, and the
neutrals lean far enough toward its hue that nothing in the app is ever a dead gray.

**Key Characteristics:**

- Phone-shaped single column below 1024px; a rail-plus-list app frame above it
- Raised item rows that sink when checked; hairlines elsewhere, never card grids
- Flat in-page except the list, where depth is state; large shadows reserved for overlays
- One typeface (Inter Variable), hierarchy by weight and size
- Neutrals carry a whisper of the green hue; the active store's own color washes the whole app
- Compact controls: 32px default height, 28px small
- Automatic light/dark from the OS, no in-app toggle

## Colors

A green-leaning neutral field, one green accent for action, and — the loudest thing in the system —
the active store's own color washing the entire app.

### The Store Owns the App

Every store the household creates has a color they picked themselves. That color is not a label on a
chip; it is the app's atmosphere. `--store-color` is set on the app shell from whichever store is
active, and the page canvas, every item row, every edge and divider, the header, the selected nav
entry, and the quantity tags all derive from it. Switching stores re-tints the whole app in 350ms.

This is Product Principle 3 made visible: **store is the frame**, so you can tell which list you are
in from across the room, before reading a word — which is the state a person in an aisle is actually
in.

Store colors are arbitrary user-picked hex, so every derivation is defensive. Nothing takes a raw
store color behind text. The wash percentages are the whole contract:

- **Store Canvas** (7% light / 6% dark, mixed into Paper): the page.
- **Store Raised** (4% light / 9% dark, mixed into Row Raised): the unchecked item row.
- **Store Edge** (15% light / 18% dark alpha): row outlines, header and rail dividers, section rules.
- **Store Quiet** (12% alpha): the quantity tag behind an item's amount.
- **Store Selected** (22% alpha): the active store chip and rail entry.

Nothing exceeds 22%, so no hue a household can pick — neon yellow, pale beige, near-black — can move
text contrast off its token value or make the interface unreadable. A store with no color, and the
Unassigned list, fall back to the app's green and the app simply looks like itself.

### Primary

- **Grocery Green** (`oklch(0.527 0.154 150.069)` light / `oklch(0.72 0.168 152)` dark): action, and
  only action — the add button, submit, confirm, focus. Dark mode's green is _brighter and more
  chromatic_ than light mode's, not darker; the old dark value dropped both lightness and chroma,
  which is what made the night list look switched off.
- **Green Foreground** (`oklch(0.982 0.018 155.826)` light / `oklch(0.19 0.05 155)` dark): what sits
  on green. Near-white on the deep light green, near-black on the bright dark one.

### Neutral

Neutrals are no longer chroma-free. Every one of them carries 0.004–0.022 chroma at hue 150–158 — far
below anything that reads as "green", far above the dead gray it replaces.

- **Paper** (`oklch(0.994 0.004 150)` light / `oklch(0.163 0.014 158)` dark): the page, before the
  store wash lands on it. Dark Paper is a deep green-black, not a neutral black.
- **Surface** (`oklch(1 0.002 150)` light / `oklch(0.222 0.018 158)` dark): cards, popovers, sheets.
- **Ink** (`oklch(0.17 0.014 155)` light / `oklch(0.965 0.008 150)` dark): item names and headings.
- **Muted Ink** (`oklch(0.535 0.018 155)` light / `oklch(0.715 0.022 152)` dark): quantities on
  checked rows, counts, hints, icon-only affordances at rest. Both values clear 4.5:1 on Paper.
- **Hairline** (`oklch(0.9 0.011 150)` light / `oklch(0.85 0.05 155 / 13%)` dark): dividers and
  container rings that are not store-tinted.
- **Quiet Fill** (`oklch(0.965 0.007 150)` light / `oklch(0.272 0.018 158)` dark): hover and pressed
  states on ghost and outline controls, and menu item highlight.

### Alert

- **Alert Red** (`oklch(0.577 0.245 27.325)` light / `oklch(0.704 0.191 22.216)` dark): destructive
  actions only — delete, clear checked. It appears as tinted text on a 10% wash, never as a solid
  red button. It is the one hue that never bends toward the store color, because a warning must not
  change meaning when you switch shops.

### Named Rules

**The Store Host Rule.** (Replaces the old Neutral Host Rule, which kept every gray chroma-free so
user colors would read correctly against them. It worked, and it made the app look switched off.) The
interface now hosts exactly one saturated color at a time, and it belongs to the store you are
shopping. Neutrals lean toward the app's green hue so nothing reads as dead gray; the store's color
arrives only as a wash under 22%; and green stays reserved for action so it never competes with the
store for meaning. When two store colors would appear at once — the nav, the move-to menu — each dot
carries its own color at full strength, because there the color _is_ the information.

**The Two Reds Rule.** Destructive intent is red _text on a tinted wash_, never a solid red fill.
Solid saturated fill is reserved for the green primary, so a filled button is always the safe one.

## Typography

**Sole Font:** Inter Variable (with `sans-serif` fallback), self-hosted via `@fontsource-variable/inter`.

**Character:** One neutral grotesque doing all the work. Personality comes from weight jumps and
tight tracking on the wordmark, not from a display face. This is deliberate: the list is read at a
glance in bad light while moving, and a single high-legibility face at consistent optical size is
the fastest thing to scan.

### Hierarchy

- **Title** (600, 1.125rem, tracking -0.025em): the "Tshopper" wordmark in the header. The only
  place negative tracking appears.
- **Body** (400, 1rem, leading-tight): item names. The largest reading text in the app and the one
  thing sized for arm's length. Checked items keep the same size but shift to Muted Ink with a
  line-through.
- **Label** (500, 0.875rem): buttons, dialog titles, section counts. Semibold 600 for the item-count
  and mode labels above the list.
- **Caption** (400, 0.75rem): quantities under item names, helper text, empty-state hints, small
  button text (0.8rem at `size="sm"`).

### Named Rules

**The Arm's-Length Rule.** Item names never drop below 1rem. Every other text role may shrink; the
list content may not, because it is read while moving.

**The One Face Rule.** No second family, ever — no serif accent, no display font, no monospace.
Hierarchy is weight (400/500/600) and size only.

## Layout

Two layouts, one system. Below `64rem` (1024px) the app is a single centered column,
`max-width: 42rem` (672px), with a `1rem` horizontal gutter — the phone shape, unchanged, and still
the shape the product is designed around.

At `1024px` and above the shell becomes a fixed-height app frame (`h-svh`, no document scroll) with
a persistent `14rem` store rail on the left, a scrolling list region in the middle, and — at
`80rem` (1280px) and above — an optional `22rem` assistant panel docked on the right. Each region
scrolls independently.

The list region is a container query context, not a viewport one: the number of list columns follows
the space the region actually has, so opening the assistant reflows the list without a viewport
change. Below `48rem` of region width the list is one column capped at `42rem`; above it the region
opens to `72rem` and the list flows into `22rem`-minimum columns with a `1.5rem` gutter and no
`column-rule` — the rows carry their own edges. Reordering is always single-column — a drag target that can jump between columns is
not a drag target.

Vertical structure is a sticky 56px header, then a flex column of content with `0.5rem` between
blocks and `1rem` of top and bottom padding. The header is `bg-background/80` with `backdrop-blur`
and a bottom hairline, so list content scrolls visibly beneath it rather than disappearing under an
opaque bar.

List rhythm is the core measurement: each item row is a `2.75rem`-minimum single line with
`0.5rem 0.75rem` of padding, and rows are separated by a `0.5rem` gap rather than a rule. One line
per item is the point — the quantity moved to the trailing edge so a row is one glance, and the list
holds a third more items in the same scroll than the two-line row did. Row internals use a `0.75rem`
gap between the drag handle, the name, and the quantity.

Control heights are fixed and compact: 36px (`lg`), 32px (default and all icon buttons), 28px (`sm`,
used for store chips and list actions), 24px (`xs`). Touch targets rely on the full row being
tappable rather than on large buttons.

The store nav takes one of two forms and never a third: a horizontally-scrolling row of chips with
`0.375rem` between them below `1024px`, or the vertical rail above it. It never wraps and never
collapses into a dropdown.

## Elevation & Depth

Two depth systems, and they say different things.

**In the list, depth is state.** Shopping item rows are the only in-page element that leaves the
page: an unchecked item sits on Row Raised with a soft lift, a checked item sinks below the page to
Row Sunk with an inset shadow. The list reads as a set of things still standing up and a set already
put down, before a single word is read. Everything else in the reading surface stays flat —
containers are a 1px ring at `foreground/10`, the sticky header is a blur plus a border.

**Above the page, depth is impermanence.** Anything temporary and dismissible — the chat sheet,
dialogs, context menus, dropdowns — carries a real drop shadow at a scale no row ever reaches, so
"this is on top of your list and will go away" is readable before the content is. Row lift is
deliberately small (a 1–2px offset, a short blur) so the two systems never compete: a row is seated
on the page, an overlay floats over it.

In dark mode a drop shadow alone cannot carry a row, so the raised state also lifts its fill
(`oklch(0.213)` against a `oklch(0.145)` page) and takes a 1px top highlight; the sunk state goes
darker than the page it sits on. The light source is the same in both themes — from above.

### Shadow Vocabulary

- **Menu lift** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`):
  context menus and dropdown content, paired with a `ring-1 ring-foreground/10`.
- **Panel lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`):
  the chat sheet, submenus, and modal surfaces — anything that occupies a substantial area.

### Named Rules

**The Lift-Means-Temporary Rule.** A shadow in Tshopper means exactly one thing: this layer is
transient and dismissible. Never shadow a card, a row, a header, or a button — if it stays when you
tap elsewhere, it is flat.

## Shapes

Soft-but-tight corners from a single `--radius: 0.45rem` base, scaled by multiplier rather than by
hand: `sm` ×0.6 (4.3px), `md` ×0.8 (5.8px), `lg` ×1 (7.2px, the default for buttons, inputs, and
menus), `xl` ×1.4 (10.1px, cards and sheets). Small controls clamp their radius (`min(var(--radius-md), 12px)`)
so a 28px chip never approaches a pill.

Two shapes are fully round and only two: the store color dot (10px circle) and the empty-state store
badge (40px circle). The circle is reserved for color identity — a round swatch means "this is a
store", everywhere in the app.

Borders are always 1px and always Hairline. Containers use `ring-1` rather than `border` so the
outline sits outside the padding box and never shifts layout.

## Components

### Buttons

- **Shape:** softly rounded (7.2px, `--radius-lg`); icon buttons are 32px squares with the same
  radius, never circles.
- **Primary:** Grocery Green fill with its paired foreground, 32px tall, `0.625rem` horizontal
  padding, 500 weight at 0.875rem. Used for add and confirm — action only. The active store chip is
  _not_ primary; it wears its own store color (see Store Chips).
- **Outline:** transparent-to-Paper fill with a Hairline border; hovers to Quiet Fill. The resting
  state for inactive store chips and the reorder toggle.
- **Ghost:** no fill or border; hovers to Quiet Fill. All header actions (assistant, settings, sign
  out) and list-level actions (show more, clear checked) are ghost.
- **Destructive:** Alert Red text on a 10% Alert wash, deepening to 20% on hover. Never a solid fill.
- **Press:** every button translates down 1px on `:active` (except menu triggers). This is the
  system's only tactile feedback and it is deliberate — it confirms the tap on a phone where hover
  does not exist.
- **Focus:** a 3px `ring-ring/50` plus a border shift to `ring`. Focus is always visible, never
  removed.
- **Icons:** Lucide, 1rem at default size, 0.875rem at `sm`, 0.75rem at `xs`; always inherit text
  color, never colored independently.

### List Rows (signature component)

The shopping item row is the system's defining element, and it is the one place in the reading
surface where depth carries meaning: **an item still to buy is raised off the page; a checked item is
pressed into it.** Height in the list is state, not decoration.

- **Structure:** a single-line flex row at `2.75rem` minimum height, `0.5rem 0.75rem` padding,
  `0.63rem` radius, Row Raised fill, a 1px Row Edge outline, and Row lift. Rows are separated by a
  `0.5rem` gap, not by a divider.
- **Name and quantity share one line.** The name takes the free space at weight 500 and truncates;
  the quantity sits at the trailing edge, caption-sized Muted Ink, tabular, absent when empty. The
  quantity column is what makes the list scannable at arm's length.
- **The whole row is the control.** Tapping anywhere toggles checked; there is no checkbox element,
  though the row carries `role="checkbox"` and `aria-checked`. Long-press or right-click opens the
  context menu (edit, move to store, delete).
- **Checked state:** the row drops to Row Sunk with an inset shadow and no outline, the name falls
  from 500 to 400 and shifts to Muted Ink, and a 1px rule draws across it left to right over 300ms.
  The row does not move, indent, or resize. Unchecking reverses the same motion.
- **Press:** the row translates down 1px and its shadow collapses to an inset in 60ms — the tap
  physically pushes the item toward the sunk state it is about to reach.
- **Hover** (pointer only, unchecked only): fill lifts one step and the shadow deepens.
- **Sort mode:** a Muted Ink grip handle appears at the row's leading edge with `cursor: grab`; the
  row keeps its raised surface but stops being tappable and only the handle drags.

### Store Chips

- **Style:** 28px `sm` Outline buttons in a horizontally scrolling row. The active chip stays Outline
  and takes a Store Selected fill with a Store Edge border and a semibold label — so the selected
  store is marked in _its own color_, matching the wash it just applied to the whole app. A uniform
  green pill here would fight the canvas it selected.
- **Color dot:** a 10px circle filled with the store's own color, leading the label, `aria-hidden`.
  "Unassigned" gets a hollow ring of the same size rather than a gap, so every label starts on the
  same vertical line and chips do not resize when selection moves.
- **Order:** the household's default store sorts first; "Unassigned" always sorts last.

### Store Rail (desktop)

The same selector, given a column instead of a strip. 36px rows in a `14rem` rail, the same Store
Selected fill and inset Store Edge ring on the active entry, the same 10px color dot leading the
label. Each row carries its unchecked item count at the trailing edge, tabular, hidden at zero —
Muted Ink at rest, full Ink on the active row. The count is the thing the strip had no room for and
the reason the rail earns its width.

### Cards / Containers

- **Corner Style:** 10.1px (`--radius-xl`).
- **Background:** Surface.
- **Border:** `ring-1 ring-foreground/10` — a ring, never a border.
- **Shadow:** none in-page (see Elevation).
- **Internal Padding:** `1rem` via `--card-spacing`, dropping to `0.75rem` at `size="sm"`.

### Inputs / Fields

- **Style:** transparent fill with a 1px Hairline border, 32px tall, 7.2px radius, `0.625rem`
  horizontal padding. In dark mode the fill lifts to `input/30` so the field is findable against the
  near-black page.
- **Size:** `text-base` (16px) on mobile, dropping to `text-sm` at `md` — the 16px floor prevents
  iOS from zooming on focus and must not be reduced.
- **Focus:** border shifts to `ring` with a 3px `ring-ring/50` halo.
- **Error:** `aria-invalid` drives an Alert-tinted border and ring; there is no separate error text
  slot — failures surface as toasts.

### Navigation

A sticky, blurred, hairline-bottomed 56px bar holding the wordmark on the left and three ghost icon
buttons on the right (assistant, settings, sign out). It never grows, never gains a menu, and holds
the identical three actions at every width — only its inner column releases from `42rem` to full
bleed once the rail appears beneath it. There is no bottom tab bar. Below `1024px` the header is the
entire navigation; above it the store rail joins it, and nothing else ever does.

The assistant button is a toggle, not an opener: it reports state with `aria-pressed` and dismisses
the panel it opened, because on desktop that panel stays on screen.

### Assistant Sheet

Below `80rem` the AI assistant opens as a sheet over the list, with Panel-lift shadow and a border,
sliding in 10 units on open. It overlays rather than replaces the list, because both paths act on
the same live state and the user should see the list update as the assistant works.

At `80rem` and above that intent stops being a compromise: the assistant docks as a `22rem` column
to the right of the list, flat, separated by a hairline, with no shadow and no overlay — it is not
temporary, so it does not lift. The conversation itself is the same panel in both places and
survives the switch between them; only its container changes.

## Do's and Don'ts

### Do:

- **Do** make the entire list row tappable rather than adding a checkbox or a chevron. The row is
  the control.
- **Do** let a shopping item row be a raised surface that sinks when checked — that is the one place
  depth is allowed in-page, and it is allowed because it encodes state. Every other list in the
  system (menus, store rows, settings) still divides with a hairline.
- **Do** derive anything store-colored with `color-mix` at or below 22%, mixing toward a token whose
  contrast is already known. That cap is what lets a household pick any hex without breaking the app.
- **Do** keep every neutral in the 150–158 hue band at low chroma. A gray at chroma 0 is a bug now,
  not a rule.
- **Do** reserve the round shape for store color identity — the 10px dot and the 40px empty-state
  badge — and nothing else.
- **Do** keep the row's lift far smaller than any overlay's. A row is seated on the page; a sheet
  floats above it. Containers and headers stay flat with a hairline or a `ring-1`.
- **Do** keep inputs at 16px on mobile so iOS does not zoom on focus.
- **Do** drive desktop reflow from container width, not viewport width — the assistant panel changes
  how much room the list has without changing the viewport at all.
- **Do** give pointer devices a row hover that lifts fill and shadow one step, on unchecked rows
  only. Touch has the 1px press translate; a mouse has nothing, and in two columns you need to know
  which row you're on. A checked row never responds to hover — it is finished.
- **Do** give the desktop its own affordances where the phone had none: `/` focuses the add field,
  Escape leaves edit mode, and the rail shows counts the chip strip had no room for.

### Don't:

- **Don't** introduce a second typeface. Inter Variable does every role.
- **Don't** put item names below 1rem, or add a text size step between body and caption.
- **Don't** grow the row's depth into card chrome: no padding above `0.75rem`, no second line, no
  border beyond the 1px Row Edge, and no shadow large enough to be mistaken for an overlay.
- **Don't** let a checked row keep any lift, outline, or hover response. Checked is sunk, and sunk is
  what makes raised mean something.
- **Don't** use a solid red button. Destructive is Alert text on a 10% wash.
- **Don't** add an in-app theme toggle; light and dark follow `prefers-color-scheme` only.
- **Don't** spend green on selection, atmosphere, or decoration. Green means "this does something".
  The store color means "this is where you are". Trading them makes both meaningless.
- **Don't** put a raw store color behind text, or above 22% anywhere. The household can pick a hex
  the app has never seen, and the wash caps are the only thing standing between that and unreadable
  UI.
- **Don't** let the store wash reach overlays. Dialogs, sheets, and menus stay on Surface — they sit
  above the app, not inside the store.
- **Don't** design for a named user — no avatars, initials, presence badges, or "added by" credits.
  The product knows a household, not people.
