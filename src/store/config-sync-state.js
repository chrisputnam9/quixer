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
  WARNING: 4,
  ERROR: 5
};
export const configSyncSaveState = writable(CONFIG_SYNC_SAVE_STATE.PENDING);

/** Messages **/
export const configSyncMessageType = writable('');
export const configSyncMessage = writable('');
export const configSyncAlert = function (message, type = 'info') {
  // Auto-set ERROR state
  if (type == 'error') {
    configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.ERROR);
  }
  configSyncMessageType.set(type);
  configSyncMessage.set(message);
};

/** Updated Date of Local Data **/
export const configUpdatedDate = writable('');
