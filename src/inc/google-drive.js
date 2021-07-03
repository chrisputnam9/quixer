/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
import MultiPartBuilder from 'multipart.js';
import {
  isSignedIn,
  configSave,
  errorMessage,
  successMessage
} from '../store/config-state.js';

// TODO Move everything from Config.svelte into this
export const google_drive = {
  sync: function (data) {
    if (!isSignedIn) {
      configSave.set(2);
      errorMessage.set(
        'Sign in to Google Drive account to back up and sync your config.'
      );
    }

    return data;
  }
};
