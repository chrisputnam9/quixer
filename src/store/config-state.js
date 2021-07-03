import { writable } from 'svelte/store';

/** Boolean states - either is or is not **/
const isSignedIn = writable(false);

/**
 * Success state of current action, either:
 * - 0 - pending
 * - 1 - success
 * - 2 - error
 **/
const configSave = writable(0);

/** Messages **/
const errorMessage = writable('');
const successMessage = writable('');

export const config_state = {
  isSignedIn,
  configSave,
  errorMessage,
  successMessage
};
