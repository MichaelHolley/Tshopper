import { form } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import {
	verifyPassword,
	startSession,
	endSession,
	isLoginLocked,
	recordFailedLogin
} from '$lib/server/auth';

export const login = form(z.object({ _password: z.string() }), async ({ _password }) => {
	if (isLoginLocked()) {
		return { error: 'Too many attempts, try again later' };
	}
	if (!verifyPassword(_password)) {
		recordFailedLogin();
		return { error: 'Incorrect password' };
	}
	startSession();
	redirect(303, '/');
});

export const logout = form(async () => {
	endSession();
	redirect(303, '/login');
});
