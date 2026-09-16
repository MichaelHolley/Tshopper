const ENABLED_KEY = 'shopping-progress-notifications';
const PROGRESS_TAG = 'shopping-progress';

export type NotificationState =
	{ status: 'unsupported' } | { status: NotificationPermission; enabled: boolean };

export function getNotificationState(): NotificationState {
	if (
		typeof window === 'undefined' ||
		!('Notification' in window) ||
		!('serviceWorker' in navigator)
	) {
		return { status: 'unsupported' };
	}

	return {
		status: Notification.permission,
		enabled: localStorage.getItem(ENABLED_KEY) === 'true'
	};
}

export async function enableProgressNotifications(): Promise<NotificationState> {
	const state = getNotificationState();
	if (state.status === 'unsupported') return state;

	const permission = await Notification.requestPermission();
	const enabled = permission === 'granted';
	localStorage.setItem(ENABLED_KEY, String(enabled));
	return { status: permission, enabled };
}

export async function disableProgressNotifications(): Promise<NotificationState> {
	const state = getNotificationState();
	if (state.status === 'unsupported') return state;

	localStorage.setItem(ENABLED_KEY, 'false');
	await closeProgressNotification();
	return { status: Notification.permission, enabled: false };
}

export async function showProgressNotification(
	listName: string,
	checked: number,
	total: number
): Promise<void> {
	const state = getNotificationState();
	if (state.status !== 'granted' || !state.enabled) return;
	if (total === 0) return closeProgressNotification();

	try {
		const registration = await navigator.serviceWorker.ready;
		await registration.showNotification(listName, {
			body: `${checked} of ${total} items checked`,
			icon: '/app-icon.svg',
			tag: PROGRESS_TAG,
			silent: true,
			data: { url: '/' }
		});
	} catch {
		return;
	}
}

export async function closeProgressNotification(): Promise<void> {
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

	try {
		const registration = await navigator.serviceWorker.getRegistration();
		const notifications = await registration?.getNotifications({ tag: PROGRESS_TAG });
		notifications?.forEach((notification) => notification.close());
	} catch {
		return;
	}
}
