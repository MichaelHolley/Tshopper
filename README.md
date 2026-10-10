# Tshopper

A shopping list app for a single household, with per-store lists and an AI chat assistant that
manages the list in natural language (e.g. "add milk and eggs", "remove all checked items").
The list syncs live between sessions.

Built with SvelteKit, Drizzle on libsql, and the AI SDK on OpenRouter.

## Development

Copy `.env.example` to `.env` and fill it in, then:

```sh
pnpm install
pnpm run db:migrate
pnpm run dev
```

## Hosting

`docker-compose.prod.yml` runs the app and a libsql server that keeps the data in a volume. Fill in
the environment values, then:

```sh
docker compose -f docker-compose.prod.yml up -d
```

Migrations are applied on startup.

`SESSION_SECRET` must be at least 32 characters. Changing `APP_PASSWORD` or `SESSION_SECRET` signs
every device out. After 10 wrong passwords, an IP is locked out of signing in for 15 minutes.
