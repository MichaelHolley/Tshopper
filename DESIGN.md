---
name: Tshopper
description: A household shopping list built for one hand in a grocery aisle.
colors:
  grocery-green: 'oklch(0.527 0.154 150.069)'
  grocery-green-dark: 'oklch(0.448 0.119 151.328)'
  grocery-green-foreground: 'oklch(0.982 0.018 155.826)'
  paper: 'oklch(1 0 0)'
  paper-dark: 'oklch(0.145 0 0)'
  surface: 'oklch(1 0 0)'
  surface-dark: 'oklch(0.205 0 0)'
  ink: 'oklch(0.145 0 0)'
  ink-dark: 'oklch(0.985 0 0)'
  ink-muted: 'oklch(0.556 0 0)'
  ink-muted-dark: 'oklch(0.708 0 0)'
  hairline: 'oklch(0.922 0 0)'
  hairline-dark: 'oklch(1 0 0 / 10%)'
  fill-quiet: 'oklch(0.97 0 0)'
  fill-quiet-dark: 'oklch(0.269 0 0)'
  alert: 'oklch(0.577 0.245 27.325)'
  alert-dark: 'oklch(0.704 0.191 22.216)'
  focus-ring: 'oklch(0.708 0 0)'
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
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    padding: '0.625rem 0'
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
looking twice, the list occupies the full column with no card chrome competing for the eye, and the
only saturated color on screen is the green that says _this is the store you're in_ and _this is the
button that does the thing_. Nothing decorative earns its pixels.

The system is deliberately flat in-page: hairline rules divide items, a single 1px ring defines a
container, and there is no shadow anywhere in the reading surface. Overlays are the exception, and
that exception is the whole depth model — dialogs, sheets, and menus lift off the page with a real
shadow so a temporary layer is never mistaken for the list itself. Type is one family, Inter
Variable, worked through weight and size rather than contrast between faces. The interface is
compact by intent: 32px controls, 0.45rem corners, tight gutters, and a 672px reading column.

The desktop is the same companion at a different moment — not in the aisle but at the kitchen table,
planning, with a mouse and a keyboard and a screen that can hold the whole list at once. So the
desktop earns a real frame: the stores that scrolled sideways on a phone stand still in a rail with
their counts visible, the list that ran off the fold flows into ruled columns, and the assistant that
had to cover the list sits beside it instead. Nothing is added that the phone does not have; what
the phone had to hide, the desktop shows.

Color energy comes from two sources and no others: the app's green, and the per-store dot colors the
household picks themselves. Because store colors are user data, the system stays neutral around
them; every gray is chroma-free so a user's magenta or orange store dot reads cleanly against it.

**Key Characteristics:**

- Phone-shaped single column below 1024px; a rail-plus-list app frame above it
- Hairline dividers instead of cards for list content
- Flat in-page, lifted overlays
- One typeface (Inter Variable), hierarchy by weight and size
- Chroma-free neutrals so user-chosen store colors stay legible
- Compact controls: 32px default height, 28px small
- Automatic light/dark from the OS, no in-app toggle

## Colors

A chroma-free neutral field with one green accent and user-owned store colors on top of it.

### Primary

- **Deep Grocery Green** (`oklch(0.527 0.154 150.069)` light / `oklch(0.448 0.119 151.328)` dark):
  the working accent. It fills the primary button, marks the active store chip, carries the add and
  confirm actions, and is the app's `theme_color` in the PWA manifest. It is used freely on
  interactive state — active, selected, submit — but never as a decorative background or a large
  field of color.
- **Green Foreground** (`oklch(0.982 0.018 155.826)`): the near-white that sits on green. Slightly
  warm, never pure white.

### Neutral

- **Paper** (`oklch(1 0 0)` light / `oklch(0.145 0 0)` dark): the page. Pure white in light mode; the
  list sits directly on it with nothing between.
- **Surface** (`oklch(1 0 0)` light / `oklch(0.205 0 0)` dark): cards, popovers, sheets. Identical to
  Paper in light mode — separation there comes from the ring, not the fill. In dark mode it lifts one
  step so overlays read without relying on a shadow alone.
- **Ink** (`oklch(0.145 0 0)` light / `oklch(0.985 0 0)` dark): item names and headings.
- **Muted Ink** (`oklch(0.556 0 0)` light / `oklch(0.708 0 0)` dark): quantities, counts, hints,
  checked-off item text, icon-only affordances at rest.
- **Hairline** (`oklch(0.922 0 0)` light / `oklch(1 0 0 / 10%)` dark): every divider, border, and
  container ring in the system.
- **Quiet Fill** (`oklch(0.97 0 0)` light / `oklch(0.269 0 0)` dark): hover and pressed states on
  ghost and outline controls, and menu item highlight.

### Alert

- **Alert Red** (`oklch(0.577 0.245 27.325)` light / `oklch(0.704 0.191 22.216)` dark): destructive
  actions only — delete, clear checked. It appears as tinted text on a 10% wash, never as a solid
  red button.

### Named Rules

**The Neutral Host Rule.** Every gray in the system is chroma-free (`oklch(L 0 0)`). Store colors are
user data and may be any hue; the interface must never tint its own neutrals, or a user's chosen
color starts to look wrong against them.

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
opens to `72rem` and the list flows into `22rem`-minimum columns divided by a hairline
`column-rule`. Reordering is always single-column — a drag target that can jump between columns is
not a drag target.

Vertical structure is a sticky 56px header, then a flex column of content with `0.5rem` between
blocks and `1rem` of top and bottom padding. The header is `bg-background/80` with `backdrop-blur`
and a bottom hairline, so list content scrolls visibly beneath it rather than disappearing under an
opaque bar.

List rhythm is the core measurement: each item row is `0.625rem` of vertical padding above and below
its content, closed by a bottom hairline. Rows have no horizontal padding — the divider runs the full
column width, edge to edge, which is what makes the list read as ruled paper rather than as stacked
elements. Row internals use a `0.75rem` gap between the drag handle and the text block.

Control heights are fixed and compact: 36px (`lg`), 32px (default and all icon buttons), 28px (`sm`,
used for store chips and list actions), 24px (`xs`). Touch targets rely on the full row being
tappable rather than on large buttons.

The store nav takes one of two forms and never a third: a horizontally-scrolling row of chips with
`0.375rem` between them below `1024px`, or the vertical rail above it. It never wraps and never
collapses into a dropdown.

## Elevation & Depth

Flat in-page, lifted overlays. Nothing in the scrolling content casts a shadow: containers are
defined by a 1px ring at `foreground/10`, list items by a bottom hairline, and the sticky header by
a blur plus a border. Depth in the reading surface is communicated entirely by line and by the
translucency of the header.

Overlays invert that rule. Anything temporary and dismissible — the chat sheet, dialogs, context
menus, dropdowns — carries a real shadow, so "this is on top of your list and will go away" is
readable before the content is.

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
- **Primary:** Deep Grocery Green fill with the warm near-white foreground, 32px tall, `0.625rem`
  horizontal padding, 500 weight at 0.875rem. Used for add, confirm, and the active store chip.
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

The shopping item row is the system's defining element and does not use a card.

- **Structure:** a full-width flex row, `0.625rem` vertical padding, bottom hairline, no horizontal
  padding, no background, no radius.
- **The whole row is the control.** Tapping anywhere toggles checked; there is no checkbox element.
  Long-press or right-click opens the context menu (edit, move to store, delete).
- **Checked state:** the item name shifts to Muted Ink with a line-through and stays in place. The
  row itself does not change background, indent, or move.
- **Quantity:** caption-sized Muted Ink on a second line under the name; absent entirely when empty.
- **Sort mode:** a Muted Ink grip handle appears at the row's leading edge with `cursor: grab`; the
  row stops being tappable and only the handle drags.

### Store Chips

- **Style:** 28px `sm` buttons in a horizontally scrolling row. Active is the Primary variant; the
  rest are Outline.
- **Color dot:** a 10px circle filled with the store's own color, leading the label, `aria-hidden`.
  The dot is omitted for "Unassigned", which is the only entry with no color.
- **Order:** the household's default store sorts first; "Unassigned" always sorts last.

### Store Rail (desktop)

The same selector, given a column instead of a strip. 36px rows in a `14rem` rail, same green fill
for the active entry, same 10px color dot leading the label — but the dot is never omitted, because
a column reads by its left edge: "Unassigned" gets a hollow ring of the same size rather than a gap.
Each row carries its unchecked item count in Muted Ink at the trailing edge, tabular, hidden at zero.
The count is the thing the strip had no room for and the reason the rail earns its width.

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
- **Do** divide list content with a full-bleed bottom hairline (`border-b`, no horizontal padding),
  not with cards, gaps, or background alternation.
- **Do** keep all neutrals chroma-free (`oklch(L 0 0)`) so user-chosen store colors read correctly
  against them.
- **Do** reserve the round shape for store color identity — the 10px dot and the 40px empty-state
  badge — and nothing else.
- **Do** shadow overlays (sheets, dialogs, menus) and leave everything in-page flat with a hairline
  or a `ring-1`.
- **Do** keep inputs at 16px on mobile so iOS does not zoom on focus.
- **Do** drive desktop reflow from container width, not viewport width — the assistant panel changes
  how much room the list has without changing the viewport at all.
- **Do** give pointer devices a row hover tint (`muted/50`, full-bleed, no radius). Touch has the
  1px press translate; a mouse has nothing, and in two columns you need to know which row you're on.
- **Do** give the desktop its own affordances where the phone had none: `/` focuses the add field,
  Escape leaves edit mode, and the rail shows counts the chip strip had no room for.

### Don't:

- **Don't** introduce a second typeface. Inter Variable does every role.
- **Don't** put item names below 1rem, or add a text size step between body and caption.
- **Don't** wrap list items in cards, or give a row a radius or a shadow. The hover tint above is the
  only background a row ever gets, and it stays full-bleed so the divider still runs edge to edge.
- **Don't** use a solid red button. Destructive is Alert text on a 10% wash.
- **Don't** add an in-app theme toggle; light and dark follow `prefers-color-scheme` only.
- **Don't** tint the green into a gradient, a large field, or a decorative background. It marks
  action and active state.
- **Don't** design for a named user — no avatars, initials, presence badges, or "added by" credits.
  The product knows a household, not people.
