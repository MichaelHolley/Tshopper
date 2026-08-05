# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two or more people in one household who share a single shopping list. They use Tshopper in three
situations that all matter:

- **In-store, phone in hand.** Standing in an aisle, one-handed, pushing a cart, checking items off.
- **At home, planning ahead.** Adding items as they run out — at the fridge, on the couch.
- **Both at once, from different places.** One person adds while the other shops; each expects to
  see the other's changes without refreshing or coordinating.

There is no per-person identity in the product: everyone shares one password and one list.

## Product Purpose

Tshopper is a self-hosted shopping list for a single household. It keeps per-store lists, lets an
AI assistant manage those lists in natural language, and syncs every change live between sessions.
Success is that the list is always current and trustworthy for whoever is standing in the store.

## Positioning

Four things together, none of which a neighboring list app has all of:

- **AI is the primary way to work the list, not a bolt-on.** Chat handles add, edit, check, remove,
  clear-checked, and reorder, and accepts one image — a receipt or a handwritten list — and acts on
  it with tools rather than describing it.
- **Per-store lists are the core mental model.** Items belong to a store; manual drag reorder exists
  so a list can be arranged to match aisle order.
- **Real-time sync between sessions** is a promise, not a convenience — the two-person case above
  depends on it.
- **Private and self-hosted.** One household, one password, own server, no accounts and no
  third-party data.

## Operating Context

- Used standing up, in motion, often one-handed, sometimes with a cart or basket occupying the other
  hand. Installed as a standalone PWA on a phone.
- Also used at rest, at home, for fast capture.
- Store lists correspond to real shops the household visits; item order can correspond to the
  physical route through a store.

## Capabilities and Constraints

Confirmed functionality:

- Stores: create, name, color; a default store preference; an implicit "Unassigned" list.
- Items: name, quantity (free text, e.g. "2", "1 kg", "500 ml"), checked/unchecked, sort order,
  store assignment.
- Checked items stay on the list until cleared; "clear checked" deletes them permanently.
- Manual drag reorder of unchecked items within a store.
- AI chat with tools: list, add, update, check/uncheck, remove, clear checked, reorder. One image
  attachment supported.
- Live queries: every mutation, whether from UI or AI, propagates to open sessions.

Fixed constraints:

- **Mobile-first PWA.** Installed standalone, portrait orientation, phone is the primary target;
  desktop is secondary.
- **Single shared password, no accounts.** No per-person identity: nothing may imply named users,
  avatars, attribution, presence-by-name, or "who added this".

Not fixed (changeable with good reason): the current system-only light/dark scheme and the green
primary color are the incumbent implementation, not a binding commitment.

Undecided: nothing recorded.

## Brand Commitments

Name: Tshopper. No confirmed logo, wordmark, voice guide, or brand references beyond the existing
implementation (`static/app-icon.svg`, `static/manifest.json`).

## Evidence on Hand

- Working implementation in `src/`, incumbent visual system in `src/routes/layout.css`.
- No testimonials, customers, usage numbers, press, pricing, or benchmarks exist. Future work must
  not fabricate any — this is a private household tool.

## Product Principles

1. **The person in the aisle wins.** One-handed, in-motion, glanceable use outranks every other
   consideration when they conflict.
2. **Two ways in, one truth.** Chat and direct manipulation are equal paths to the same list; neither
   may become a second-class or hidden mode, and both reflect the same live state.
3. **Store is the frame.** Which store you are shopping is the primary context for everything on
   screen.
4. **No identity, ever.** The product knows a household, not people. Never design for named users.
5. **Trust the list.** Live sync and the check/remove distinction must never be ambiguous — a
   destructive action is always distinguishable from a reversible one.

## Accessibility & Inclusion

No product-specific standard was established. The in-store one-handed context makes touch target
size and thumb reach a functional requirement, not only an accessibility one.
