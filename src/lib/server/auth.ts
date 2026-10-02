import { createHmac, timingSafeEqual } from 'node:crypto';
import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { dev } from '$app/env';
import { APP_PASSWORD, SESSION_SECRET } from '$app/env/private';

export const SESSION_COOKIE = 'session';

// Only ever unset while building — src/env.ts requires both before the app starts.
const sessionSecret = SESSION_SECRET as string;
const appPassword = APP_PASSWORD as string;

const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

const MAX_FAILED_LOGINS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const failedLogins = new Map<string, { count: number; resetAt: number }>();

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

// Mixing in the password means changing it signs every device out.
function sign(issuedAt: string): string {
	return createHmac('sha256', sessionSecret)
		.update(`${issuedAt}.${appPassword}`)
		.digest('base64url');
}

export function isLoginLocked(): boolean {
	const entry = failedLogins.get(getRequestEvent().getClientAddress());
	return entry != null && entry.count >= MAX_FAILED_LOGINS && entry.resetAt > Date.now();
}

export function recordFailedLogin(): void {
	const ip = getRequestEvent().getClientAddress();
	const now = Date.now();
	for (const [key, { resetAt }] of failedLogins) if (resetAt <= now) failedLogins.delete(key);
	const entry = failedLogins.get(ip) ?? { count: 0, resetAt: now + LOGIN_WINDOW_MS };
	entry.count++;
	failedLogins.set(ip, entry);
}

export function verifyPassword(input: string): boolean {
	return safeEqual(input, appPassword);
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
