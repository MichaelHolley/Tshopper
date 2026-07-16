import { defineEnvVars } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { z } from 'zod';

/** Secrets are supplied to the running container, not to the image build. */
const secret = building ? z.string().optional() : z.string().min(1);

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.', schema: secret },
	DATABASE_AUTH_TOKEN: {
		description: 'Auth token for the database. Unused by an unauthenticated libsql server.',
		schema: z.string().optional()
	},
	APP_PASSWORD: { description: 'Shared household password required to sign in.', schema: secret },
	SESSION_SECRET: {
		description: 'Secret used to sign session cookies. Keep stable across restarts.',
		schema: secret
	},
	OPENROUTER_API_KEY: {
		description: 'API key for [OpenRouter](https://openrouter.ai), used by the chat assistant.',
		schema: secret
	},
	OPENROUTER_MODEL: {
		description: 'Model the chat assistant runs on, e.g. `openai/gpt-5.4-mini`.',
		schema: z.string().default('openai/gpt-5.4-mini')
	}
});
