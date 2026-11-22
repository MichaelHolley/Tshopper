import { error } from '@sveltejs/kit';
import { ALEXA_SKILL_ID } from '$app/env/private';
import { ask, end, readAlexaRequest, say, type AlexaRequest } from '#lib/server/alexa.js';
import { parseSpokenItems, type SpokenItems } from '#lib/server/ai.js';
import * as preferences from '#lib/server/preferences.js';
import * as shopping from '#lib/server/shopping.js';
import type { RequestHandler } from './$types';

type Replies = {
	prompt: string;
	help: string;
	supportedActions: string;
	unassigned: string;
	added: (items: string, store: string) => string;
	list: (items: string, store: string) => string;
	empty: (store: string) => string;
	more: (count: number) => string;
};

const REPLIES = {
	en: {
		prompt: 'How can I help with your list?',
		help: "Say, for example: add milk and two packs of butter. Or ask: what's on the list, or what's on the list for Lidl?",
		supportedActions: 'I can add items to your list or read it back.',
		unassigned: 'Unassigned',
		added: (items, store) => `Added ${items} to ${store}.`,
		list: (items, store) => `On your list for ${store}: ${items}.`,
		empty: (store) => `Your list for ${store} is empty.`,
		more: (count) => `${count} more`
	},
	de: {
		prompt: 'Wie kann ich dir mit deiner Liste helfen?',
		help: 'Sag zum Beispiel: füge Milch und zwei Packungen Butter hinzu. Oder frag: was steht auf der Liste, oder was brauche ich bei Lidl?',
		supportedActions: 'Ich kann Artikel zu deiner Liste hinzufügen oder sie vorlesen.',
		unassigned: 'Nicht zugeordnet',
		added: (items, store) => `${items} zu ${store} hinzugefügt.`,
		list: (items, store) => `Auf deiner Liste für ${store}: ${items}.`,
		empty: (store) => `Deine Liste für ${store} ist leer.`,
		more: (count) => `${count} weitere`
	}
} satisfies Record<string, Replies>;

type Language = keyof typeof REPLIES;

const MAX_READ_ITEMS = 10;

function languageOf(locale: string): Language {
	const language = locale.split('-')[0];
	return language in REPLIES ? (language as Language) : 'en';
}

export const POST: RequestHandler = async ({ request }) => {
	if (!ALEXA_SKILL_ID) error(404, 'Not found');

	let alexaRequest: AlexaRequest;
	try {
		alexaRequest = await readAlexaRequest(request, ALEXA_SKILL_ID);
	} catch (reason) {
		console.warn('Rejected Alexa request:', reason);
		error(400, 'Invalid Alexa request');
	}

	const { type, intent, locale } = alexaRequest;
	const language = languageOf(locale);
	const replies = REPLIES[language];
	// The SearchQuery slot only matches after a carrier phrase, so the prompt teaches one instead of inviting a bare answer.
	const prompt = `${replies.prompt} ${replies.help}`;
	if (type === 'LaunchRequest') return ask(prompt);
	if (type !== 'IntentRequest' || !intent) return end();

	switch (intent.name) {
		case 'AddItemIntent': {
			const phrase = intent.slots?.item?.value?.trim();
			return phrase ? say(await addSpokenItems(phrase, language)) : ask(prompt);
		}
		case 'ReadListIntent':
			return say(await readSpokenList(intent.slots?.store?.value, language));
		case 'AMAZON.HelpIntent':
			return ask(replies.help);
		case 'AMAZON.FallbackIntent':
			return ask(`${replies.supportedActions} ${replies.help}`);
		default:
			return end();
	}
};

async function readSpokenList(storeName: string | undefined, language: Language): Promise<string> {
	const [stores, { defaultStoreId }] = await Promise.all([
		shopping.listStores(),
		preferences.getPreferences()
	]);
	const namedStore = storeName?.trim().toLowerCase();
	const store =
		stores.find((s) => s.name.toLowerCase() === namedStore) ??
		stores.find((s) => s.id === defaultStoreId);
	const items = (await shopping.listItems(store?.id ?? null)).filter(
		(item) => item.checked === null
	);
	const replies = REPLIES[language];
	const storeLabel = store?.name ?? replies.unassigned;
	if (items.length === 0) return replies.empty(storeLabel);

	const spoken = items
		.slice(0, MAX_READ_ITEMS)
		.map(({ item, quantity }) => (quantity ? `${quantity} ${item}` : item));
	if (items.length > MAX_READ_ITEMS) spoken.push(replies.more(items.length - MAX_READ_ITEMS));
	const list = new Intl.ListFormat(language, { type: 'conjunction' }).format(spoken);
	return replies.list(list, storeLabel);
}

async function addSpokenItems(phrase: string, language: Language): Promise<string> {
	const [stores, { defaultStoreId }] = await Promise.all([
		shopping.listStores(),
		preferences.getPreferences()
	]);

	let parsed: SpokenItems | null = null;
	try {
		parsed = await parseSpokenItems(
			phrase,
			stores.map((s) => s.name)
		);
	} catch (reason) {
		console.warn('Adding the spoken phrase as is, parsing failed:', reason);
	}

	const items = parsed?.items.length ? parsed.items : [{ name: phrase, quantity: '' }];
	const namedStore = parsed?.store?.toLowerCase();
	const store =
		stores.find((s) => s.name.toLowerCase() === namedStore) ??
		stores.find((s) => s.id === defaultStoreId);

	await shopping.addItems(
		items.map(({ name, quantity }) => ({ item: name, quantity })),
		store?.id ?? null
	);

	const replies = REPLIES[language];
	const spoken = items.map(({ name, quantity }) => (quantity ? `${quantity} ${name}` : name));
	const list = new Intl.ListFormat(language, { type: 'conjunction' }).format(spoken);
	return replies.added(list, store?.name ?? replies.unassigned);
}
