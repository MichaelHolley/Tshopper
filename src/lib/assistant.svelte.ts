import { Chat } from '@ai-sdk/svelte';
import { DefaultChatTransport } from 'ai';

function create() {
	return new Chat({ transport: new DefaultChatTransport({ api: '/api/chat' }) });
}

let shared: Chat | null = null;

export function getChat(): Chat {
	if (typeof window === 'undefined') return create();
	return (shared ??= create());
}
