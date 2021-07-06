import { writable } from 'svelte/store';

/** Boolean states - either is or is not **/
export const configSyncIsSignedIn = writable(false);

/**
 * Success state of current action, either:
 * - 0 - pending
 * - 1 - saving
 * - 2 - success
 * - 3 - error
 **/
export const configSyncSaveState = writable(0);

/** Messages **/
export const configSyncMessageType = writable('');
export const configSyncMessage = writable('');
