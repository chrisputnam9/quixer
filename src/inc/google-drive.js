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
    console.log('init');
  },

  /**
   * Log in to Google Drive
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
