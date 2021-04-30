import { writable } from 'svelte/store';

/** Boolean states - either is or is not **/
export const isSignedIn = writable(false);
export const isSaved = writable(false);

/**
 * Success state of current action, either:
 * - 0 - pending
 * - 1 - success
 * - 2 - error
 **/
export const configError = writable(0);

/** Messages **/
export const errorMessage = writable("");
export const successMessage = writable("");
