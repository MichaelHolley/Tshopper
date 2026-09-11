# Tshopper

## TechStack

- SvelteKit using Runes, Remote-Functions and Async expiremental features
- shadcn-svelte (huntabyte/shadcn-svelte)
- svelte-ai-elements (SikandarJODD/ai-elements)
- ai-sdk + openrouter/ai-sdk-provider
- Drizzle with libsql (a `file:` DB in dev, the libsql container in production)

To get more info a library you have access to BTCA to clone their repo by calling "use btca".

## Documentation

- Only add a comment when complexity is genuinely high **and** the naming does not already convey enough information.
- A comment that restates the function name, parameters, or return type is worthless — delete it. Well-named identifiers are the documentation.
- Never add a comment just because a function is public or exported.
- When a comment truly is warranted, prefer explaining _why_ over _what_, use JSDoc syntax, and keep it short and concise.

## Agent Tools

Tools in `src/lib/server/ai.ts` take their arguments from a model, so treat the `inputSchema` as the validation boundary.

- Encode every constraint the service layer enforces into the zod schema (`.min(1)` on names that cannot be empty, `.max()` on arrays). The AI SDK validates and repairs the call before `execute` runs; a throw inside `execute` only reaches the model as an opaque error.
- This matters most for tools that act on a batch: one invalid entry throws and aborts the whole operation, and the error text does not say which entry was bad.
- Keep the service-layer checks in `src/lib/server/shopping.ts` as they are — the UI's remote functions call the same code and do not go through the tool schema.

## Feedback Loop

Use `package.json` scripts over `pnpx` and `npx` commands.
Validate your changes with `pnpm run check` and `pnpm run lint`.

Do not start a dev-server to test against with curl requests.
Dev-Servers may be used for bug investigations or if explicitly told to.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
