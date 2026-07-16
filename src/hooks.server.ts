import type { Handle, ServerInit } from '@sveltejs/kit';
import { building, dev } from '$app/env';
import { SESSION_COOKIE, isAuthenticated } from '$lib/server/auth';
import { runMigrations } from '$lib/server/db/migrate';

/** Dev keeps migrations manual (`pnpm db:migrate`) so a local database is never touched by surprise. */
export const init: ServerInit = async () => {
	if (!building && !dev) await runMigrations();
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.authenticated = isAuthenticated(event.cookies.get(SESSION_COOKIE));
	return resolve(event);
};
