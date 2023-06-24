import { writable } from 'svelte/store';

/** Boolean states - either is or is not **/
export const configSyncIsAvailableForSignIn = writable(false);
export const configSyncIsSignedIn = writable(false);

/**
 * Success state of current action:
 **/
export const CONFIG_SYNC_SAVE_STATE = {
	PENDING_LOGIN: 0,
	PENDING: 1,
	SAVING: 2,
	SUCCESS: 3,
	ERROR: 4
};
export const configSyncSaveState = writable(CONFIG_SYNC_SAVE_STATE.PENDING);

/** Messages **/
// Whether to show the alert message
export const configSyncMessageShow = writable(false);
// See Alert.svelte - CSS classes for types
export const configSyncMessageType = writable('');
export const configSyncMessage = writable('');
export const configSyncAlert = function (message, type = 'info') {
	// Auto-set certain states
	switch (type) {
		case 'error':
			configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.ERROR);
			console.error(message);
			break;
		case 'success':
			configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SUCCESS);
			console.info(message);
			break;
		default:
			console.log(message);
			break;
	}
	configSyncMessageShow.set(true);
	configSyncMessageType.set(type);
	configSyncMessage.set(message);
};

/** Config Data **/
export const configData = writable({});
