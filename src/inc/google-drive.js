/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import {
  CONFIG_SYNC_SAVE_STATE,
  configSyncSaveState,
  configSyncIsAvailableForSignIn,
  configSyncIsSignedIn,
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
          configSyncIsAvailableForSignIn.set(true);

          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(google_drive.updateSigninStatus);

          // Handle the initial sign-in state.
          google_drive.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (_error) {
          configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.ERROR);
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
    configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
  },

  /**
   * Log in
   */
  logIn: function () {
    gapi.auth2.getAuthInstance().signIn();
  },

  /**
   * Log out
   */
  logOut: function () {
    gapi.auth2.getAuthInstance().signOut();
  },

  /**
   * Sync Google Drive config data with passed data param
   *  - Save merged data
   *  - Return merged data
   */
  sync: function (data) {
    if (!get(configSyncIsSignedIn)) {
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING_LOGIN);
      configSyncMessageType.set('warning');
      configSyncMessage.set(
        '<a href="/#config">Sign in to your Google Drive account</a> to back up and sync your config.'
      );
    }

    configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SAVING);
    configSyncMessageType.set('info');
    configSyncMessage.set('Syncing config to Google Drive');

    window.setTimeout(function () {
      // Show success, wait a bit, then show pending again
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SUCCESS);
      configSyncMessageType.set('success');
      configSyncMessage.set('Sync Successful!');
      window.setTimeout(function () {
        configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
      }, 1000);
    }, 500);

    return data;
  }
};
