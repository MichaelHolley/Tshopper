import { createHmac, timingSafeEqual } from 'node:crypto';
import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { dev } from '$app/env';
import { APP_PASSWORD, SESSION_SECRET } from '$app/env/private';

export const SESSION_COOKIE = 'session';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

function sign(payload: string): string {
	return createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

export function verifyPassword(input: string): boolean {
	return safeEqual(input, APP_PASSWORD);
}

/** Stateless signed token: `<issuedAtMs>.<hmac>`. Survives restarts as long as SESSION_SECRET is stable. */
function createSessionToken(): string {
	const issuedAt = Date.now().toString();
	return `${issuedAt}.${sign(issuedAt)}`;
}

function isValidToken(token: string): boolean {
	const [issuedAt, signature] = token.split('.');
	if (!issuedAt || !signature) return false;
	if (!safeEqual(signature, sign(issuedAt))) return false;
	const ageSeconds = (Date.now() - Number(issuedAt)) / 1000;
	return ageSeconds >= 0 && ageSeconds < MAX_AGE_SECONDS;
}

export function isAuthenticated(token: string | undefined): boolean {
	return token != null && isValidToken(token);
}

export function startSession(): void {
	const { cookies } = getRequestEvent();
	cookies.set(SESSION_COOKIE, createSessionToken(), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: MAX_AGE_SECONDS
	});
}

export function endSession(): void {
	const { cookies } = getRequestEvent();
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Guard for remote functions — throws 401 for callers without a valid session. */
export function requireAuth(): void {
	if (!getRequestEvent().locals.authenticated) error(401, 'Not authenticated');
}
