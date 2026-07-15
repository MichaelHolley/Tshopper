# Tshopper → SvelteKit Migration Plan

Migrate Tshopper from a two-service architecture (Vue 3 SPA + .NET/SignalR backend + SQLite) to a single fullstack SvelteKit application. Real-time sync moves from SignalR to SvelteKit remote functions with `query.live`. Persistence moves from EF Core/SQLite to Turso via Drizzle ORM.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Strategy | Big-bang rewrite; old code moved to a reference directory, deleted in the final phase |
| Starting base | A scaffolded SvelteKit app (Tailwind, shadcn-svelte, AI Elements) is provided up front; database (Drizzle/Turso) and deployment setup are part of the plan |
| Repo layout | New SvelteKit app becomes the repo root |
| Auth | Keep single shared-password model; session cookie replaces JWT-in-localStorage |
| Database | Turso (libSQL) via Drizzle ORM; start with fresh data, no migration of existing rows |
| Real-time | `query.live` remote functions replace the SignalR hub entirely |
| UI | shadcn-svelte; same screens and flows, but redesigned in shadcn idioms (not a pixel port of Nuxt UI) |
| AI chat | Vercel AI SDK with streaming and native tool-calling loop; OpenRouter as provider (configurable model); Svelte AI Elements for the chat UI |
| Hosting | Self-hosted Docker, single container via adapter-node (replaces the two current containers) |
| Testing | None automated; each slice verified manually before moving on |

## Feature scope

Carried over: multi-store lists (incl. moving items between stores), full item CRUD with check/uncheck and clear-checked, drag-and-drop reorder with persisted order, user preferences (default store), AI chat assistant, shared-password login.

Dropped: CSV import/export (the data-transfer page goes away).

## Architecture notes (cross-cutting)

- **Single-household model stays.** There is no user table; auth is one shared password, preferences are global. Nothing in the data model becomes per-user.
- **Real-time pattern.** Today the hub broadcasts full list snapshots to all clients after every mutation. The equivalent: each view reads through a live query; every mutation is a command remote function that touches the database and refreshes the affected live queries. No connection management, no client-side event handlers.
- **One service layer.** List operations (add, update, check, delete, reorder, move) are implemented once and shared by both the UI-facing commands and the AI chat tools, so chat-driven mutations propagate to live queries exactly like button clicks — replacing today's hub-context broadcasting from the chat service.
- **Every phase ends deployable.** The Docker/deploy skeleton lands in Phase 1 so each slice can be smoke-tested in the real hosting environment, not just `dev`.

---

## Phase 0 — Starting base (provided)

The scaffolded SvelteKit app is supplied up front with Svelte 5, TypeScript, Tailwind, shadcn-svelte, and AI Elements (incl. the AI SDK) already set up — that part is not migration work. Everything else — the database layer (Drizzle + Turso), adapter/deployment setup, and all app code — is part of the plan.

## Phase 1 — Relocate and wire up the foundation

Move the existing Vue app and .NET service into a clearly-named reference directory (kept only for consultation during the rewrite) and make the provided SvelteKit app the repo root. On that base: enable remote functions, install and configure Drizzle with the Turso connection and its migration workflow, set up adapter-node, and build the shadcn theme and app shell (nav, drawer skeleton, dark/light). Produce a working single-container Docker build and update CI to build it.

**Done when:** the skeleton app builds, runs in Docker, connects to Turso, and renders the shell.

## Phase 2 — Slice: Authentication

Login screen (shadcn form) validating the shared password from configuration, issuing an HTTP-only session cookie. Server-side guard on all app routes and on every remote function; logout. This lands first because every later slice sits behind it.

**Done when:** unauthenticated visitors land on login, a correct password grants a persistent session, and remote functions reject callers without one.

## Phase 3 — Slice: Core shopping list (the heart)

Schema and migrations for shopping items. A live query serves the list; command remote functions cover add (with quantity), inline edit, check/uncheck, delete, and clear-all-checked, each refreshing the live query. UI: list view with add form, item rows with check/edit/delete affordances, checked-items handling, empty state.

**Done when:** two browser sessions side by side see each other's changes without reloading — the `query.live` replacement for SignalR is proven here.

## Phase 4 — Slice: Multi-store lists

Store schema and its relation to items. Store management (create, rename, delete) and store navigation; the item live query becomes store-scoped, including the "no store" default list. Moving an item between stores updates both affected lists live.

**Done when:** switching stores shows the right list, and a cross-store move appears live in both source and target lists in another session.

## Phase 5 — Slice: Drag-and-drop reorder

Persisted sort order on items, drag-and-drop reordering in the list UI, and a reorder command that saves the new order. Order is respected everywhere items are listed and syncs live to other sessions.

**Done when:** a drag in one session reorders the list in another, and order survives reloads.

## Phase 6 — Slice: Preferences

Global preferences storage (currently just the default store) with a small settings UI. The default store is applied when the app loads. Keep the shape extensible for future preferences.

**Done when:** picking a default store makes the app open on it across sessions and devices.

## Phase 7 — Slice: AI chat assistant

Streaming chat endpoint on the AI SDK with an OpenRouter-compatible provider and configurable model. Tools mirror today's set — list items, add, update, remove (single and bulk), targeting the active store — executed through the shared service layer so every chat mutation shows up live in the list. Chat drawer rebuilt with Svelte AI Elements: streamed responses, visible tool activity, error and abort handling, bounded loop.

**Done when:** "add milk and eggs, remove everything checked" streams a response while the list updates live in a second session.

## Phase 8 — Slice: Polish and hardening

A pass across all slices: loading/empty/error states, optimistic-feel interactions where they matter (checking, adding), mobile ergonomics (the app is primarily used on phones), toasts for failures, and consistent shadcn theming. Tighten input validation and error responses in the command functions.

**Done when:** a full manual walkthrough of every flow on a phone-sized viewport feels finished, not scaffolded.

## Phase 9 — Cutover

Production configuration (password, session secret, Turso credentials, OpenRouter key/model), final Docker image, updated compose file replacing the two old services with the single new one. Deploy, repopulate the list by hand, retire the old containers and images.

**Done when:** the SvelteKit container serves production and the .NET/Vue containers are stopped.

## Phase 10 — Cleanup

Delete the reference directory with the old Vue and .NET code, remove their CI workflows and Docker artifacts, and rewrite README and AGENTS.md for the new stack (SvelteKit conventions, remote-function patterns, Drizzle workflow, build/lint commands).

**Done when:** the repo contains only the SvelteKit app and its docs, with no trace of the old stack.
