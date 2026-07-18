import { toast } from 'svelte-sonner';

/** Rejection handler for fire-and-forget commands: `deleteItem(id).catch(toastError('...'))`. */
export const toastError = (message: string) => () => toast.error(message);
