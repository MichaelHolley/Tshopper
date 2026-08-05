import { browser } from '$app/env';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function stored(): ThemeMode {
	const value = localStorage.getItem(STORAGE_KEY);
	return value === 'light' || value === 'dark' ? value : 'system';
}

class Theme {
	#mode = $state<ThemeMode>('system');
	#systemDark = $state(false);

	constructor() {
		if (!browser) return;
		this.#mode = stored();
		const query = matchMedia('(prefers-color-scheme: dark)');
		this.#systemDark = query.matches;
		query.addEventListener('change', (event) => {
			this.#systemDark = event.matches;
			this.#apply();
		});
	}

	get mode() {
		return this.#mode;
	}

	get isDark() {
		return this.#mode === 'system' ? this.#systemDark : this.#mode === 'dark';
	}

	set(mode: ThemeMode) {
		this.#mode = mode;
		if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, mode);
		this.#apply();
	}

	toggle() {
		this.set(this.isDark ? 'light' : 'dark');
	}

	#apply() {
		const root = document.documentElement;
		root.classList.toggle('dark', this.isDark);
		root.style.colorScheme = this.isDark ? 'dark' : 'light';
	}
}

export const theme = new Theme();
