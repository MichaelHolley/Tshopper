import { defineEnvVars } from '@sveltejs/kit/hooks';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	DATABASE_AUTH_TOKEN: {
		description: 'Auth token for the [Turso](https://turso.tech) database.'
	},
	APP_PASSWORD: { description: 'Shared household password required to sign in.' },
	SESSION_SECRET: { description: 'Secret used to sign session cookies. Keep stable across restarts.' }
});
