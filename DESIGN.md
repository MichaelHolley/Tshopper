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
  store-color: "the active store's own color, set by the household — an identity mark, never a surface"
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
  list-row-checked:
    backgroundColor: '{colors.row-sunk}'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.xl}'
    minHeight: '2.75rem'
    padding: '0.5rem 0.75rem'
  store-chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '1.75rem'
    padding: '0 0.625rem'
    typography: '{typography.caption}'
  store-chip-active:
    backgroundColor: '{colors.fill-quiet}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '1.75rem'
    padding: '0 0.625rem'
    typography: '{typography.caption}'
  store-dot:
    backgroundColor: '{colors.store-color}'
    rounded: '{rounded.pill}'
    size: '0.625rem'
---

# Design System: Tshopper

## Overview

**Creative North Star: "The Aisle Companion"**

Tshopper is designed for a person standing in a grocery aisle with one hand on a cart and the other on a phone, and every decision in the system answers to that scene. The field is a green-leaning neutral — `{colors.paper}` under `{colors.ink}`, with no gray anywhere at chroma zero — and exactly one saturated color is allowed to sit on a surface: `{colors.grocery-green}`, spent only on the button that does the thing. Rows are tall enough to hit without looking twice, the list owns the full column, and nothing decorative earns its pixels.

The system is deliberately flat in-page with one exception, and the exception is the list. Items you still need are raised off the page; items you have picked up are pressed into it — so the list's shape tells you how far along you are before you read a word. Containers stay a single 1px `{colors.hairline}` ring, and row lift is kept small so overlays still own the large drop shadow that marks a temporary layer. Type is one family, Inter Variable, worked through weight and size rather than contrast between faces. The interface is compact by intent: 32px controls, `{rounded.lg}` corners, tight gutters, and a 672px reading column.

The desktop is the same companion at a different moment — not in the aisle but at the kitchen table, planning, with a mouse and a screen that holds the whole list at once. So the desktop earns a real frame: the stores that scrolled sideways on a phone stand still in a rail with their counts visible, the list that ran off the fold flows into ruled columns, and the assistant that had to cover the list sits beside it instead. Nothing is added that the phone does not have; what the phone had to hide, the desktop shows.

A store's color is identity, not atmosphere. The household picks a color per store and it appears as a filled circle — in the chip, in the rail, in the empty state — so a store is recognizable at a glance without the app pretending to be a different app for each shop. The chrome stays the same neutral field in every store. Two things keep their meaning because nothing else competes for them: green means _this does something_, and the dot means _this is a store_.

**Key Characteristics:**

- Phone-shaped single column below 1024px; a rail-plus-list app frame above it
- Raised item rows that sink when checked; hairlines elsewhere, never card grids
- Flat in-page except the list, where depth is state; large shadows reserved for overlays
- One typeface (Inter Variable), hierarchy by weight and size
- Neutrals carry a whisper of the green hue — nothing in the app is ever a dead gray
- `{colors.store-color}` lives in a 10px circle and nowhere else
- Compact controls: 32px default height, 28px small
- Automatic light/dark from the OS, no in-app toggle

## Colors

A green-leaning neutral field, one green accent reserved for action, one red reserved for destruction, and a per-store hue that is only ever a dot. Every token ships a light and a dark value; dark is not a dimmed light, it is its own build.

### Primary

- **Grocery Green** (`{colors.grocery-green}` / `{colors.grocery-green-dark}`): action, and only action — the add button, submit, confirm, focus. Dark mode's green is _brighter and more chromatic_ than light mode's, not darker; a green that drops lightness and chroma together is what makes a night list look switched off.
- **Green Foreground** (`{colors.grocery-green-foreground}` / `{colors.grocery-green-foreground-dark}`): what sits on green. Near-white on the deep light green, near-black on the bright dark one.

### Neutral

Every neutral carries 0.002–0.022 chroma at hue 150–158 — far below anything that reads as "green", far above the dead gray it replaces.

- **Paper** (`{colors.paper}` / `{colors.paper-dark}`): the page. Dark Paper is a deep green-black, not a neutral black.
- **Surface** (`{colors.surface}` / `{colors.surface-dark}`): cards, popovers, sheets, dialogs.
- **Ink** (`{colors.ink}` / `{colors.ink-dark}`): item names and headings.
- **Muted Ink** (`{colors.ink-muted}` / `{colors.ink-muted-dark}`): quantities, counts, hints, icon-only affordances at rest. Both values clear 4.5:1 on Paper.
- **Hairline** (`{colors.hairline}` / `{colors.hairline-dark}`): every divider, container ring and row outline in the app.
- **Quiet Fill** (`{colors.fill-quiet}` / `{colors.fill-quiet-dark}`): hover and pressed states on ghost and outline controls, menu item highlight, and the active store's selection fill.

### Row Surfaces

The list's two states are the only place in the reading surface where a fill carries meaning.

- **Row Raised** (`{colors.row-raised}` / `{colors.row-raised-dark}`): an item still to buy. Sits above Paper — visibly so in dark mode, where fill does the work a shadow cannot.
- **Row Sunk** (`{colors.row-sunk}` / `{colors.row-sunk-dark}`): an item already in the cart. Sits below Paper in both themes.

### Alert

- **Alert Red** (`{colors.alert}` / `{colors.alert-dark}`): destructive actions only — delete, clear checked. It appears as tinted text on a 10% wash, never as a solid red button.

### Focus

- **Focus Ring** (`{colors.focus-ring}` / `{colors.focus-ring-dark}`): a 3px halo plus a border shift on every focusable control. Never removed, never conditional.

### Store Identity

- **Store Color** (`{colors.store-color}`): arbitrary user-picked hex, so it is treated as untrusted. It renders as a `0.625rem` filled circle — in the chip, in the rail row, in the empty-state badge at 40px — and never as a background, a border, a text color, a button fill, or a page wash. "Unassigned" takes a hollow ring of the same size rather than a gap, so every label starts on the same vertical line.

### Named Rules

**The Dot Rule.** A store's color appears as a circle and nothing else. It never tints the canvas, a row, the header, an edge, a chip fill, a tag, or a piece of text. The circle is reserved exclusively for store identity, so a round swatch anywhere in the app means "this is a store".

**The One Fill Rule.** Solid saturated fill belongs to `{colors.grocery-green}` alone, which is why a filled button is always the safe one. Selection, atmosphere and decoration get neutral fills; if you are reaching for green to mark state, use `{colors.fill-quiet}` and a weight bump instead.

**The Two Reds Rule.** Destructive intent is red _text on a tinted wash_, never a solid red fill.

## Typography

**Sole Font:** Inter Variable (with `sans-serif` fallback), self-hosted via `@fontsource-variable/inter`.

**Character:** One neutral grotesque doing every job. Personality comes from weight jumps and tight tracking on the wordmark, not from a display face — the list is read at a glance, in bad light, while moving, and a single high-legibility face at consistent optical size is the fastest thing to scan.

### Hierarchy

| Token                  | Size     | Weight | Line Height | Letter Spacing | Use                                                                                        |
| ---------------------- | -------- | ------ | ----------- | -------------- | ------------------------------------------------------------------------------------------ |
| `{typography.title}`   | 1.125rem | 600    | 1.75rem     | -0.025em       | The "Tshopper" wordmark. The only negative tracking in the app.                            |
| `{typography.body}`    | 1rem     | 400    | 1.25        | 0              | Item names — the largest reading text, sized for arm's length.                             |
| `{typography.label}`   | 0.875rem | 500    | 1.25rem     | 0              | Buttons, dialog titles, section counts. 600 for item-count and mode labels.                |
| `{typography.caption}` | 0.75rem  | 400    | 1rem        | 0              | Quantities, helper text, empty-state hints, store chips, `size="sm"` button text (0.8rem). |

Checked item names keep `{typography.body}` size but fall from 500 to 400, shift to `{colors.ink-muted}`, and take a line-through.

### Principles

**The Arm's-Length Rule.** Item names never drop below 1rem. Every other role may shrink; the list content may not, because it is read while moving.

**The One Face Rule.** No second family, ever — no serif accent, no display font, no monospace. Hierarchy is weight (400/500/600) and size only.

## Layout

### Spacing System

- **Tokens**: `{spacing.gap}` 0.5rem · `{spacing.row}` 0.625rem · `{spacing.gutter}` 1rem · `{spacing.section}` 1rem.
- **Page rhythm**: a flex column with `{spacing.gap}` between blocks and `{spacing.section}` of top and bottom padding, plus `env(safe-area-inset-bottom)`.
- **Horizontal gutter**: `{spacing.gutter}` at every width.
- **List rhythm**: rows are separated by a `{spacing.gap}` gap, never by a rule. Row internals use a `0.75rem` gap between handle, name and quantity.

### Grid & Container

- Below 1024px: one centered column capped at `42rem` (672px) — the phone shape, and the shape the product is designed around.
- At 1024px and above: a fixed-height app frame (`h-svh`, no document scroll) — a persistent `14rem` store rail, a scrolling list region, and at 1280px an optional `22rem` assistant panel. Each region scrolls independently.
- The list region is a **container** query context, not a viewport one, so opening the assistant reflows the list without a viewport change. Below `48rem` of region width the list is one column capped at `42rem`; above it the region opens to `72rem` and flows into `22rem`-minimum columns with a `1.5rem` gutter and no `column-rule` — the rows carry their own edges.
- Reordering is always single-column. A drag target that can jump between columns is not a drag target.

### Responsive Strategy

#### Breakpoints

| Name    | Width    | Key Changes                                                                                             |
| ------- | -------- | ------------------------------------------------------------------------------------------------------- |
| Phone   | < 1024px | Single 42rem column; horizontally scrolling store chip strip; assistant opens as a sheet over the list. |
| Desktop | ≥ 1024px | App frame at `h-svh`; store chips become the 14rem rail with counts; list may flow into columns.        |
| Wide    | ≥ 1280px | Assistant docks as a flat 22rem column to the right of the list.                                        |

The header is a sticky 56px bar at every width — `{colors.paper}` at 80% with `backdrop-blur` and a bottom hairline, so content scrolls visibly beneath it rather than disappearing under an opaque bar.

#### Touch Targets

The list row _is_ the target: `2.75rem` minimum height, full width, tappable end to end. Controls are fixed and compact — 36px (`lg`), 32px (default and all icon buttons), 28px (`sm`, store chips and list actions), 24px (`xs`) — because the row carries the reach requirement, not the buttons.

#### Image Behavior

There is no photography and no illustration. The only graphic elements are Lucide icons at text size and the store color dot.

## Elevation & Depth

Two depth systems that say different things: **in the list, depth is state; above the page, depth is impermanence.**

| Level                | Treatment                                                                                                                                      | Use                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Level 0 — Flat       | No shadow. A 1px `{colors.hairline}` ring where separation is needed.                                                                          | Everything in the reading surface: cards, header, buttons, inputs, store chips, the rail. |
| Level 1 — Row Raised | `{colors.row-raised}` fill, 1px hairline outline, a 1–2px offset with a short blur. In dark mode the fill lifts and takes a 1px top highlight. | An unchecked shopping item.                                                               |
| Level −1 — Row Sunk  | `{colors.row-sunk}` fill, inset shadow, no outline.                                                                                            | A checked shopping item.                                                                  |
| Level 2 — Menu lift  | `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`, paired with a `ring-1`.                                        | Context menus, dropdowns.                                                                 |
| Level 3 — Panel lift | `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`                                                               | The chat sheet, submenus, modal surfaces.                                                 |

Row lift is deliberately far smaller than any overlay's, so the two systems never compete: a row is seated on the page, an overlay floats over it. The light source is the same in both themes — from above.

### Named Rules

**The Lift-Means-Temporary Rule.** Above the page, a shadow means exactly one thing: this layer is transient and dismissible. Never shadow a card, a header, or a button — if it stays when you tap elsewhere, it is flat.

**The Depth-Is-State Rule.** The only in-page element allowed to leave the page is a shopping item row, and it leaves in order to say whether it has been bought. Depth is never decoration.

## Shapes

### Border Radius Scale

Every value derives from a single `--radius: 0.45rem` base by multiplier, never by hand.

| Token            | Value            | Use                                                                                              |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| `{rounded.sm}`   | 0.27rem (4.3px)  | Smallest chrome, inline marks.                                                                   |
| `{rounded.md}`   | 0.36rem (5.8px)  | Small controls; clamped at `min(var(--radius-md), 12px)` so a 28px chip never approaches a pill. |
| `{rounded.lg}`   | 0.45rem (7.2px)  | The default — buttons, inputs, menus, icon buttons.                                              |
| `{rounded.xl}`   | 0.63rem (10.1px) | Cards, sheets, list rows.                                                                        |
| `{rounded.pill}` | 9999px           | The store color dot and the empty-state store badge. Nothing else.                               |

Two shapes are fully round and only two: the `0.625rem` store dot and the 40px empty-state badge. Borders are always 1px and always `{colors.hairline}`. Containers use `ring-1` rather than `border`, so the outline sits outside the padding box and never shifts layout.

## Components

### Buttons

**`button-primary`** — the green action button. The only solid saturated fill in the app.

- Background `{colors.grocery-green}`, text `{colors.grocery-green-foreground}`, label `{typography.label}`, height `2rem`, padding `0 0.625rem`, shape `{rounded.lg}`. Used for add and confirm — action only.

**`button-outline`** — the resting state for inactive store chips and the reorder toggle.

- Background `{colors.paper}`, text `{colors.ink}`, 1px `{colors.hairline}` border, hovers to `{colors.fill-quiet}`, same height / padding / shape.

**`button-ghost`** — every header action (assistant, settings, sign out) and list-level action (show more, clear checked).

- No fill, no border; hovers to `{colors.fill-quiet}`. Same height / shape.

**`button-destructive`** — delete and clear checked.

- Background `color-mix(in oklch, {colors.alert} 10%, transparent)` deepening to 20% on hover, text `{colors.alert}`. Never a solid fill.

**`button-icon`** — the header and row icon button.

- `2rem` square, shape `{rounded.lg}`. Never a circle.

**States, all variants.** Press translates the button down 1px on `:active` (except menu triggers) — the system's only tactile feedback, and deliberate, because on a phone there is no hover. Focus is a 3px `{colors.focus-ring}` halo plus a border shift. Icons are Lucide at 1rem (0.875rem `sm`, 0.75rem `xs`) and always inherit text color.

### Cards & Containers

**`card`** — the default container.

- Background `{colors.surface}`, text `{colors.ink}`, padding `1rem` (`0.75rem` at `size="sm"`), shape `{rounded.xl}`, a `ring-1` at `{colors.hairline}`, no shadow.

### Inputs & Forms

**`input`** — the canonical field.

- Transparent fill, 1px `{colors.hairline}` border, text `{colors.ink}`, height `2rem`, padding `0.25rem 0.625rem`, shape `{rounded.lg}`. In dark mode the fill lifts to `input/30` so the field is findable against the near-black page.
- **Size:** 16px on mobile, dropping to `{typography.label}` at `md`. The 16px floor prevents iOS from zooming on focus and must not be reduced.
- **Focus:** border shifts to `{colors.focus-ring}` with a 3px halo.
- **Error:** `aria-invalid` drives an Alert-tinted border and ring. There is no error text slot — failures surface as toasts.

### Navigation

**`nav-bar`** — the sticky 56px header.

- `{colors.paper}` at 80% with `backdrop-blur`, bottom hairline, wordmark left in `{typography.title}`, three ghost icon buttons right (assistant, settings, sign out). It never grows, never gains a menu, and holds the identical three actions at every width — only its inner column releases from `42rem` to full bleed once the rail appears beneath it. There is no bottom tab bar.
- The assistant button is a toggle, not an opener: it reports state with `aria-pressed` and dismisses the panel it opened, because on desktop that panel stays on screen.

### Signature Components

**`list-row`** — the shopping item row, and the system's defining element.

The one place in the reading surface where depth carries meaning: **an item still to buy is raised off the page; a checked item is pressed into it.** Depth in the list is state, not decoration.

- **Structure:** a single-line flex row, `2.75rem` minimum height, `0.5rem 0.75rem` padding, shape `{rounded.xl}`, `{colors.row-raised}` fill, a 1px `{colors.hairline}` outline, Level 1 lift. Rows are separated by a `{spacing.gap}` gap, not a divider.
- **Name and quantity share one line.** The name takes the free space at weight 500 and truncates; the quantity sits at the trailing edge in `{typography.caption}` `{colors.ink-muted}`, tabular, absent when empty. That trailing column is what makes the list scannable at arm's length.
- **The whole row is the control.** Tapping anywhere toggles checked; there is no checkbox element, though the row carries `role="checkbox"` and `aria-checked`. Long-press or right-click opens the context menu (edit, move to store, delete).
- **Checked:** the row drops to `{colors.row-sunk}` with an inset shadow and no outline, the name falls from 500 to 400 and shifts to `{colors.ink-muted}`, and a 1px rule draws across it left to right over 300ms. The row does not move, indent, or resize. Unchecking reverses the same motion.
- **Press:** the row translates down 1px and its shadow collapses to an inset in 60ms — the tap physically pushes the item toward the sunk state it is about to reach.
- **Hover** (pointer only, unchecked only): fill lifts one step and the shadow deepens. A checked row never responds — it is finished.
- **Sort mode:** a `{colors.ink-muted}` grip handle appears at the leading edge with `cursor: grab`; the row keeps its raised surface but stops being tappable and only the handle drags.

**`store-chip`** — the phone's store selector, a horizontally scrolling strip of 28px chips with `0.375rem` between them.

- **Inactive:** `button-outline` chrome, label in `{typography.caption}` at weight 400.
- **Active (`store-chip-active`):** `{colors.fill-quiet}` fill, 1px `{colors.hairline}` border, label at weight 600. Selection is marked by fill and weight, never by color — the dot already says which store this is.
- **`store-dot`:** a `0.625rem` circle in `{colors.store-color}` leading the label, `aria-hidden`. "Unassigned" gets a hollow ring of the same size, so chips never resize when selection moves.
- **Order:** the household's default store sorts first; "Unassigned" always sorts last.
- The strip never wraps and never collapses into a dropdown.

**`store-rail`** — the same selector on desktop, given a column instead of a strip.

- 36px rows in a `14rem` rail, the same `{colors.fill-quiet}` active fill and weight bump, the same `store-dot` leading the label. Each row carries its unchecked item count at the trailing edge, tabular, hidden at zero — `{colors.ink-muted}` at rest, full `{colors.ink}` on the active row. The count is the thing the strip had no room for, and the reason the rail earns its width.

**`assistant-panel`** — one conversation, two containers.

- Below 1280px it is a sheet over the list: Level 3 shadow, a border, sliding in 10 units on open. It overlays rather than replaces the list, because both paths act on the same live state and the user should watch the list update as the assistant works.
- At 1280px and above it docks as a flat `22rem` column right of the list, separated by a hairline, with no shadow and no overlay — it is not temporary, so it does not lift. The conversation survives the switch between them; only its container changes.

## Do's and Don'ts

### Do

- **Do** make the entire list row tappable rather than adding a checkbox or a chevron. The row is the control.
- **Do** let a shopping item row be a raised surface that sinks when checked — the one place depth is allowed in-page, and allowed because it encodes state. Every other list (menus, store rows, settings) divides with a hairline.
- **Do** keep the row's lift far smaller than any overlay's. A row is seated on the page; a sheet floats above it.
- **Do** render `{colors.store-color}` as a `0.625rem` circle, and reserve the circle for exactly that.
- **Do** mark the selected store with `{colors.fill-quiet}` and a 600-weight label. Neutral selection, colored identity.
- **Do** keep every neutral in the 150–158 hue band at low chroma. A gray at chroma 0 is a bug, not a rule.
- **Do** keep inputs at 16px on mobile so iOS does not zoom on focus.
- **Do** drive desktop reflow from container width, not viewport width — the assistant panel changes how much room the list has without changing the viewport at all.
- **Do** give pointer devices a row hover that lifts fill and shadow one step, on unchecked rows only. Touch has the 1px press translate; a mouse has nothing, and in two columns you need to know which row you are on.
- **Do** give the desktop its own affordances where the phone had none: `/` focuses the add field, Escape leaves edit mode, and the rail shows counts the chip strip had no room for.

### Don't

- **Don't** tint the canvas, item rows, the header, edges, quantity tags, chips or any other surface with `{colors.store-color}`. The chrome is the same neutral field in every store. The dot carries the store.
- **Don't** put `{colors.store-color}` behind text, in a border, or in a button fill. It is arbitrary user-picked hex and nothing about its contrast is known.
- **Don't** spend green on selection, atmosphere, or decoration. Green means "this does something" — a filled button is always the safe one.
- **Don't** use a solid red button. Destructive is `{colors.alert}` text on a 10% wash.
- **Don't** introduce a second typeface. Inter Variable does every role.
- **Don't** put item names below 1rem, or add a size step between `{typography.body}` and `{typography.caption}`.
- **Don't** grow the row's depth into card chrome: no padding above `0.75rem`, no second line, no border beyond the 1px hairline, and no shadow large enough to be mistaken for an overlay.
- **Don't** let a checked row keep any lift, outline, or hover response. Checked is sunk, and sunk is what makes raised mean something.
- **Don't** add an in-app theme toggle; light and dark follow `prefers-color-scheme` only.
- **Don't** design for a named user — no avatars, initials, presence badges, or "added by" credits. The product knows a household, not people.
