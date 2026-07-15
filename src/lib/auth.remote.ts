import { form } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { verifyPassword, startSession, endSession } from '$lib/server/auth';

export const login = form(
	z.object({ _password: z.string() }),
	async ({ _password }) => {
		if (!verifyPassword(_password)) {
			return { error: 'Incorrect password' };
		}
		startSession();
		redirect(303, '/');
	}
);

export const logout = form(async () => {
	endSession();
	redirect(303, '/login');
});
