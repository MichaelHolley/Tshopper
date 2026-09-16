/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const worker = globalThis.self as unknown as ServiceWorkerGlobalScope;

worker.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = new URL(
		(event.notification.data as { url?: string } | undefined)?.url ?? '/',
		worker.location.origin
	);

	event.waitUntil(
		(async () => {
			const windows = await worker.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const existing = windows.find(
				(client) => new URL(client.url).origin === worker.location.origin
			);

			if (existing) {
				await existing.navigate(url.href);
				return existing.focus();
			}

			return worker.clients.openWindow(url.href);
		})()
	);
});
