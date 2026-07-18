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

const IMAGE_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
/** Data URLs carry base64, which inflates the payload by 4/3; the scheme header adds a few dozen chars. */
const MAX_IMAGE_URL_LENGTH = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 128;
/** The client resends every prior data URL each turn, so the cap is per conversation, not per message. */
const MAX_IMAGES_PER_REQUEST = 4;

const imagePartSchema = z.object({
	type: z.literal('file'),
	mediaType: z.enum(IMAGE_MEDIA_TYPES),
	url: z.string().startsWith('data:image/').max(MAX_IMAGE_URL_LENGTH)
});

const fileParts = (message: UIMessage) =>
	(message.parts ?? []).filter((part) => part.type === 'file');

const messageSchema = z
	.custom<UIMessage>((value) => typeof value === 'object' && value !== null)
	.superRefine((message, ctx) => {
		const parts = fileParts(message);

		if (parts.length > 1) {
			ctx.addIssue({ code: 'custom', message: 'Only one image per message' });
		}

		for (const part of parts) {
			if (!imagePartSchema.safeParse(part).success) {
				ctx.addIssue({ code: 'custom', message: 'Attachments must be images' });
			}
		}
	});

const bodySchema = z.object({
	messages: z.array(messageSchema).superRefine((messages, ctx) => {
		const images = messages.reduce((count, message) => count + fileParts(message).length, 0);
		if (images > MAX_IMAGES_PER_REQUEST) {
			ctx.addIssue({ code: 'custom', message: 'Too many images in this conversation' });
		}
	}),
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
