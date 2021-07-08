/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import {
  configSyncIsSignedIn,
  configSyncSaveState,
  configSyncMessageType,
  configSyncMessage
} from '../store/config-sync-state.js';

/**
 * Workflow:
 * On Config Screen:
 * 1. If not logged in, show login button
 * 2. When log in clicked, authorize with GDrive
 * 3. If authorized, show sync button
 * 4. When sync clicked, run sync function
 *
 * On All Screens:
 * 1. (after check for query params)
 * 2. If logged in, check last sync time
 * 3. If synced more than 1 day ago, run sync
 */

export const google_drive = {
  /**
   * Handle API Load
   */
  onLoad: function () {
    gapi.load('client:auth2', google_drive.initClient);
  },

  /**
   * Initialize
   */
  initClient: function () {
    gapi.client
      .init({
        apiKey: GOOGLE_DRIVE_API_KEY,
        clientId: GOOGLE_DRIVE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope:
          'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file'
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(google_drive.updateSigninStatus);

          // Handle the initial sign-in state.
          google_drive.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (_error) {
          configSyncSaveState.set(3);
          configSyncMessageType.set('error');
          configSyncMessage.set(JSON.stringify(_error, null, 2));
        }
      );
  },

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus: function (isSignedIn) {
    configSyncIsSignedIn.set(isSignedIn);
  },

  /**
   * Log in
   */

  /**
   * Log out
   */

  /**
   * Sync Google Drive config data with passed data param
   *  - Save merged data
   *  - Return merged data
   */
  sync: function (data) {
    console.log('sync', get(configSyncIsSignedIn));
    if (!get(configSyncIsSignedIn)) {
      configSyncSaveState.set(3);
      configSyncMessageType.set('warning');
      configSyncMessage.set(
        '<a href="/#config">Sign in to your Google Drive account</a> to back up and sync your config.'
      );
    }

    return data;
  }
};
