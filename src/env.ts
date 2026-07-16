import { defineEnvVars } from '@sveltejs/kit/hooks';
import { z } from 'zod';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	DATABASE_AUTH_TOKEN: {
		description: 'Auth token for the [Turso](https://turso.tech) database.'
	},
	APP_PASSWORD: { description: 'Shared household password required to sign in.' },
	SESSION_SECRET: {
		description: 'Secret used to sign session cookies. Keep stable across restarts.'
	},
	OPENROUTER_API_KEY: {
		description: 'API key for [OpenRouter](https://openrouter.ai), used by the chat assistant.'
	},
	OPENROUTER_MODEL: {
		description: 'Model the chat assistant runs on, e.g. `openai/gpt-5.4-mini`.',
		schema: z.string().default('openai/gpt-5.4-mini')
	}
});
