import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from '$app/env/private';
import { shoppingTools, systemPrompt } from '$lib/server/ai';
import * as shopping from '$lib/server/shopping';
import type { RequestHandler } from './$types';

/** Generous bound on round-trips, not on operations — a single turn may batch many tool calls. */
const MAX_STEPS = 25;

const bodySchema = z.object({
	messages: z.array(z.custom<UIMessage>()),
	storeId: z.string().nullable()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.authenticated) error(401, 'Not authenticated');

	const parsed = bodySchema.safeParse(await request.json());
	if (!parsed.success) error(400, 'Invalid chat request');
	const { messages, storeId } = parsed.data;

	const stores = await shopping.listStores();
	if (storeId !== null && !stores.some((s) => s.id === storeId)) error(400, 'Unknown store');
	const storeName = stores.find((s) => s.id === storeId)?.name ?? 'Unassigned';

	const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });

	const result = streamText({
		model: openrouter(OPENROUTER_MODEL),
		system: systemPrompt(storeName),
		messages: await convertToModelMessages(messages),
		tools: shoppingTools(storeId),
		stopWhen: stepCountIs(MAX_STEPS)
	});

	return result.toUIMessageStreamResponse();
};
