# Tshopper

A shopping list app for a single household, with per-store lists and an AI chat assistant that
manages the list in natural language (e.g. "add milk and eggs", "remove all checked items").
The list syncs live between sessions.

Built with SvelteKit, Drizzle on libsql, and the AI SDK on OpenRouter.

## Features

- ⚡ **Live sync**: every change shows up instantly on all of your household's devices, no refresh needed
- ✅ **Check off as you shop**: checked items move out of the way, and one action clears them all
- ✋ **Drag to reorder**: arrange items by hand with a drag handle
- 🏪 **One list per store**: separate lists with their own colors, plus a default store that opens first
- 💬 **Talk to your list**: tell the assistant "add milk and eggs" or "clear everything I've checked" and it just happens
- 📸 **Snap a recipe or note**: attach a photo in the chat and let the assistant turn it into list items
- 🛒 **Sorted for the supermarket**: ask the assistant to reorder the list in the order you'd walk through the store
- 📌 **Basics per store**: keep the items you always buy and add them to the list in one tap
- 💡 **Smart suggestions**: while typing, Tshopper suggests the basics and items you've added to that store before
- 🔔 **Shopping progress notifications**: see how many items are left without opening the app
- 📱 **Installable app**: add it to your home screen and use it like a native app
- 🌗 **Light and dark mode**: easy on the eyes in the store and at home
- 🔒 **Private by default**: password-protected, with login rate limiting
- 🏠 **Self-hosted**: your data stays on your own server, deployed with a single Docker Compose file

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
