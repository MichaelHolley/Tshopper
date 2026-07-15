# Tshopper → SvelteKit Migration Plan

Migrate Tshopper from a two-service architecture (Vue 3 SPA + .NET/SignalR backend + SQLite) to a single fullstack SvelteKit application. Real-time sync moves from SignalR to remote functions with `query.live`. Persistence moves from EF Core/SQLite to Turso via Drizzle ORM.

## Legacy feature inventory

What the old app (now in `legacy/`) actually does:

- **Auth** — single shared password checked against configuration; JWT issued on login, stored in localStorage, validated on app start; all API endpoints and the SignalR hub require it. Single-household model: no user accounts.
- **Shopping list** — items have a name, free-text quantity, checked timestamp, sort order, and an optional store. Add, inline edit, check/uncheck, delete, delete-all-checked. Checked items older than 7 days disappear from the list. Unchecked items sort by manual order; checked items sort newest-first and are collapsed behind a "show more" toggle.
- **Multi-store lists** — stores have a name and a color; full CRUD plus a "no store / unassigned" default list. The list view is always scoped to one store. Items can be moved between stores (re-appended at the bottom of the target list).
- **Drag-and-drop reorder** — sort mode with drag handles; new order is persisted. Only unchecked items are reorderable.
- **Preferences** — one global record holding the default store, applied on app load (and cleared if the store no longer exists).
- **AI chat assistant** — drawer with suggestion chips and clear-history; backend runs an OpenAI-compatible tool loop against OpenRouter (configurable model) with tools: list items, add, update, remove (single + bulk), clear checked — all scoped to the active store. Mutations made by the AI are broadcast to all clients. Non-streaming today.
- **Real-time sync** — after every mutation (UI or AI), the hub broadcasts a full per-store item snapshot to all connected clients; clients apply it if it matches their active store. Connection state is surfaced in the UI (buttons disable when disconnected).
- **CSV import/export** — export current list to CSV, import via semicolon-delimited CSV upload.
- **Delivery** — two Docker containers (nginx-served SPA + .NET service), GitHub Actions CI/CD, PWA manifest/icons, mobile-first single-column layout.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Strategy | Big-bang rewrite; `legacy/` is reference-only and gets deleted in the final phase |
| Repo layout | SvelteKit app at the repo root (already in place) |
| Auth | Keep single shared-password model; HTTP-only session cookie replaces JWT-in-localStorage |
| Database | Turso (libSQL) via Drizzle ORM; fresh data, no migration of existing rows |
| Real-time | `query.live` remote functions replace the SignalR hub entirely |
| UI | shadcn-svelte; same screens and flows, redesigned in shadcn idioms (not a pixel port of Nuxt UI) |
| Theming | Dark/light follows system preference only — no toggle, no theme library |
| AI chat | AI SDK with streaming and native tool-calling loop; OpenRouter provider (configurable model); Svelte AI Elements for the chat UI |
| Hosting | Self-hosted Docker, single container via adapter-node (replaces the two current containers) |
| Testing | None automated; each slice verified manually before moving on |

**Feature scope:** everything in the inventory above carries over, except CSV import/export — the data-transfer page is dropped.

## Already in place (not migration work)

The root app is scaffolded and building: Svelte 5 runes mode enforced, experimental async + remote functions enabled, adapter-node configured, Tailwind 4 + shadcn-svelte, AI SDK + OpenRouter provider installed, Drizzle + libSQL client installed with a Turso-dialect config and db scripts. What does **not** exist yet: any schema, server code, routes beyond the placeholder page, auth, Docker, or CI for the new app.

## Architecture notes (cross-cutting)

- **Single-household model stays.** No user table; auth is one shared password, preferences are global. Nothing becomes per-user.
- **Real-time pattern.** Each view reads through a live query scoped by store; every mutation is a command remote function that writes to the database and refreshes the affected live queries. No connection management, no client-side event handlers, no snapshot broadcasting.
- **One service layer.** List operations (add, update, check, delete, reorder, move, clear-checked) are implemented once on the server and shared by both the UI-facing commands and the AI chat tools, so chat-driven mutations propagate to live queries exactly like button clicks.
- **Guard at the boundary.** Every remote function and route validates the session server-side; nothing trusts the client.
- **Each phase ends verifiable.** Every slice is manually verified in two side-by-side sessions before moving on — live sync is the core property being replaced, so it gets proven continuously, not once at the end.

---

## Phase 1 — Data foundation

Define the Drizzle schema for the whole domain up front — shopping items, stores, preferences — mirroring the legacy shapes (name, free-text quantity, checked timestamp, sort order, optional store reference; store name + color; global default-store preference). Establish the migration workflow against Turso and a local dev database, plus a server-side database module the rest of the app imports.

**Done when:** migrations apply cleanly to Turso, and a scratch query round-trips data through every table.

## Phase 2 — Auth

Login screen validating the shared password from configuration, issuing an HTTP-only session cookie. Server-side guard applied to all app routes and every remote function; logout. This lands before features because every later slice sits behind it.

**Done when:** unauthenticated visitors land on login, a correct password grants a persistent session across restarts, and remote functions reject callers without one.

## Phase 3 — App shell

Layout, navigation bar, side drawer skeleton, and shadcn theme with system-preference dark/light. Mobile-first single-column container matching how the app is actually used (phones).

**Done when:** an authenticated user sees the shell on a phone-sized viewport in both color schemes.

## Phase 4 — Core shopping list (the heart)

The unassigned list first, ignoring stores. A live query serves the list; command remote functions cover add (with quantity), inline edit, check/uncheck, delete, and clear-all-checked. Preserve the legacy list semantics: unchecked items by manual order, checked items newest-first, 7-day cutoff for checked items, collapsed checked section, empty state, delete-all confirmation.

**Done when:** two browser sessions side by side see each other's changes without reloading — the `query.live` replacement for SignalR is proven here.

## Phase 5 — Multi-store lists

Store management (create, rename with color, delete) and store navigation. The item live query becomes store-scoped, including the unassigned default. Moving an item between stores re-appends it at the bottom of the target list and updates both affected lists live. Deleting the active store falls back to the unassigned list.

**Done when:** switching stores shows the right list, and a cross-store move appears live in both source and target lists in another session.

## Phase 6 — Drag-and-drop reorder

Sort mode with drag handles for unchecked items only; a reorder command persists the new order. Order is respected everywhere items are listed and syncs live to other sessions.

**Done when:** a drag in one session reorders the list in another, and order survives reloads.

## Phase 7 — Preferences

Global preferences with a small settings UI, currently just the default store. Applied on app load; cleared gracefully if the referenced store no longer exists. Keep the shape extensible.

**Done when:** picking a default store makes the app open on it across sessions and devices.

## Phase 8 — AI chat assistant

Streaming chat endpoint on the AI SDK with the OpenRouter provider and configurable model. Tools mirror the legacy set — list items, add, update, remove (single + bulk), clear checked — scoped to the active store and executed through the shared service layer, so every chat mutation shows up live in the list without any extra broadcasting code. Chat drawer rebuilt with Svelte AI Elements: streamed responses, visible tool activity, suggestion chips, clear-history, error/abort handling, bounded loop.

**Done when:** "add milk and eggs, remove everything checked" streams a response while the list updates live in a second session.

## Phase 9 — Polish and hardening

A pass across all slices: loading/empty/error states, optimistic-feel interactions where they matter (checking, adding), mobile ergonomics, toasts for failures, PWA manifest/icons, consistent shadcn theming. Tighten input validation and error responses in the command functions.

Live-query recovery for PWA: SvelteKit already reconnects live queries passively (exponential backoff) and actively on network-restore (`navigator.onLine` false→true), but not when a backgrounded/locked phone returns to the foreground — the socket is killed while frozen and `navigator.onLine` never flips. Add an app-wide hook that calls `.reconnect()` on the active live queries on `visibilitychange` to visible. This is thin recovery, not a return to legacy connection management (no state polling, no disabling controls); a "reconnecting…" indicator is optional.

**Done when:** a full manual walkthrough of every flow on a phone-sized viewport feels finished, not scaffolded, and live sync survives a backgrounded/locked phone returning to the foreground.

## Phase 10 — Deployment and cutover

Single-container Docker build via adapter-node; CI workflow building and publishing it. Production configuration (password, session secret, Turso credentials, OpenRouter key/model) and an updated compose file replacing the two old services. Deploy, repopulate the list by hand, retire the old containers and images.

**Done when:** the SvelteKit container serves production and the .NET/Vue containers are stopped.

## Phase 11 — Cleanup

Delete `legacy/` along with its CI workflows and Docker artifacts; rewrite README and AGENTS.md for the new stack (SvelteKit conventions, remote-function patterns, Drizzle workflow, build/lint commands).

**Done when:** the repo contains only the SvelteKit app and its docs, with no trace of the old stack.
