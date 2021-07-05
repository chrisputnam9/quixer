/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import {
  configSyncIsSignedIn,
  configSyncSaveState,
  configSyncErrorMessage
  //configSyncSuccessMessage
} from '../store/config-sync-state.js';

// TODO Move everything from Config.svelte into this
export const google_drive = {
  sync: function (data) {
    console.log('sync', get(configSyncIsSignedIn));
    if (!get(configSyncIsSignedIn)) {
      configSyncSaveState.set(3);
      configSyncErrorMessage.set(
        '<a href="/#config">Sign in to your Google Drive account</a> to back up and sync your config.'
      );
    }

    return data;
  }
};
