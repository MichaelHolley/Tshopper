import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/env';
import { SESSION_COOKIE, isAuthenticated } from '#lib/server/auth.js';
import { runMigrations } from '#lib/server/db/migrate.js';

/** Dev keeps migrations manual (`pnpm db:migrate`) so a local database is never touched by surprise. */
export const init: ServerInit = async () => {
	if (!building && !dev) await runMigrations();
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.authenticated = isAuthenticated(event.cookies.get(SESSION_COOKIE));
	return resolve(event);
};
