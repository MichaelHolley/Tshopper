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
	addOnly: string;
	unassigned: string;
	added: (items: string, store: string) => string;
};

const REPLIES = {
	en: {
		prompt: 'What should I add?',
		help: 'Say, for example: add milk and two packs of butter.',
		addOnly: 'I can only add items to your list.',
		unassigned: 'Unassigned',
		added: (items, store) => `Added ${items} to ${store}.`
	},
	de: {
		prompt: 'Was soll ich hinzufügen?',
		help: 'Sag zum Beispiel: füge Milch und zwei Packungen Butter hinzu.',
		addOnly: 'Ich kann nur Artikel zu deiner Liste hinzufügen.',
		unassigned: 'Nicht zugeordnet',
		added: (items, store) => `${items} zu ${store} hinzugefügt.`
	}
} satisfies Record<string, Replies>;

type Language = keyof typeof REPLIES;

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
		case 'AMAZON.HelpIntent':
			return ask(replies.help);
		case 'AMAZON.FallbackIntent':
			return ask(`${replies.addOnly} ${replies.help}`);
		default:
			return end();
	}
};

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
