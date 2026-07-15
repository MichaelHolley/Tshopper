import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, isAuthenticated } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.authenticated = isAuthenticated(event.cookies.get(SESSION_COOKIE));
	return resolve(event);
};
