/**
 * In-process change notifier that drives `query.live` streams. Every mutation calls
 * `notifyChange()`; each live-query generator waits on `changes()` and re-reads the
 * database when woken. Single node process, so a shared in-memory signal replaces the
 * legacy SignalR broadcast entirely.
 */

let version = 0;
let waiters: Array<() => void> = [];

export function notifyChange(): void {
	version++;
	const woken = waiters;
	waiters = [];
	for (const resolve of woken) resolve();
}

/** Yields the change version whenever a mutation occurs; never misses an intervening change. */
export async function* changes(): AsyncGenerator<number> {
	let seen = version;
	while (true) {
		if (version === seen) {
			await new Promise<void>((resolve) => waiters.push(resolve));
		}
		seen = version;
		yield version;
	}
}
