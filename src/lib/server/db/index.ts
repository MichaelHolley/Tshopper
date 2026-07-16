import * as schema from './schema';
import { DATABASE_URL, DATABASE_AUTH_TOKEN } from '$app/env/private';
import { building } from '$app/env';

/**
 * The node driver eagerly loads a native binding that cannot be bundled into the
 * production server, so networked libsql servers go through the HTTP-only driver.
 */
async function connect() {
	if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const connection = { url: DATABASE_URL, authToken: DATABASE_AUTH_TOKEN };

	if (DATABASE_URL.startsWith('file:')) {
		const { drizzle } = await import('drizzle-orm/libsql/node');
		return drizzle({ connection, schema });
	}

	const { drizzle } = await import('drizzle-orm/libsql/web');
	return drizzle({ connection, schema });
}

/** Kit imports this module when it analyses routes at build time, where no credentials exist. */
export const db = building
	? (null as unknown as Awaited<ReturnType<typeof connect>>)
	: await connect();
