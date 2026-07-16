import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index';

/** The compose stack has no console to run migrations from, so the app applies them itself. */
export async function runMigrations(): Promise<void> {
	await migrate(db, { migrationsFolder: 'drizzle' });
}
