# Tshopper

A shopping list app for a single household, with per-store lists and an AI chat assistant that
manages the list in natural language (e.g. "add milk and eggs", "remove all checked items").
Changes sync live between sessions.

Built with SvelteKit, Drizzle on libsql, and the AI SDK on OpenRouter.

## Development

Copy `.env.example` to `.env` and fill it in, then:

```sh
pnpm install
pnpm run db:migrate
pnpm run dev
```

## Hosting

`docker-compose.yml` runs the app and a libsql server that keeps the data in a volume. Fill in
the environment values — `ORIGIN` must be the public URL, or logins are rejected — then:

```sh
docker compose up -d
```

Migrations are applied on startup.
