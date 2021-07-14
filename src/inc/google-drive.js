/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import { sync } from 'sync-logic.js';
import {
  CONFIG_SYNC_SAVE_STATE,
  configSyncAlert,
  configSyncIsAvailableForSignIn,
  configSyncIsSignedIn,
  configSyncSaveState
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
          configSyncAlert(JSON.stringify(_error, null, 2), 'error');
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
  sync: async function (local_data) {
    if (!get(configSyncIsSignedIn)) {
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING_LOGIN);
      configSyncAlert(
        '<a href="/#config">Sign in to your Google Drive account</a> to back up and sync your config.',
        'warning'
      );
      return local_data;
    }

    configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SAVING);
    configSyncAlert('Syncing config to Google Drive');

    let drive_data = false;
    let successful = true;

    // See if there is an existing config file
    if (local_data.sync.google_drive.file_id == 0) {
      // None saved locally - check drive by name
      local_data.sync.google_drive.file_id = await google_drive.findConfig();
      console.log(local_data.sync.google_drive.file_id);
    }

    // If config file exists, read it in and sync the data
    if (local_data.sync.google_drive.file_id != 0) {
      drive_data = await google_drive.readConfig(local_data.sync.google_drive.file_id);
      if (drive_data) {
        local_data = sync(local_data, drive_data);
      } else {
        successful = false;
      }
    }

    // Write the synced data to Google Drive
    // - as long as we've been successful so far
    if (successful) {
      successful = await google_drive.writeConfig(local_data);
    }

    // As long as everything has worked out so far...
    // - If there were issues along the way, errors or warnings would already be showing
    if (successful) {
      // Show success, wait a bit, then show pending again
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SUCCESS);
      configSyncAlert('Sync Successful!', 'success');
      window.setTimeout(function () {
        configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
      }, 1000);
    }

    return local_data;
  },

  /**
   * Find config file in Google Drive if it exists
   */
  findConfig: async function () {
    let file_id = false;
    await gapi.client.drive.files
      .list({
        spaces: 'appDataFolder',
        q: 'name = "config.json"',
        fields: 'nextPageToken, files(*)',
        pageSize: 10
      })
      .then(response => {
        console.log(response);
        if (response.result.files && response.result.files.length > 0) {
          if (response.result.files.length > 1) {
            configSyncAlert(
              'CS501 - Multiple config files found - will use the first one',
              'warning'
            );
          }
          file_id = response.result.files[0].id;
          configSyncAlert('Config found, ID: ' + file_id);
        } else {
          configSyncAlert('No existing config file found');
        }
      })
      .catch(error => {
        configSyncAlert('CS502 - ' + JSON.stringify(error));
      });
  },

  /**
   * Read config file contents from Google Drive
   */
  readConfig: async function (file_id) {
    let drive_data = false;

    await gapi.client
      .request({
        path:
          'https://www.googleapis.com/drive/v3/files/' +
          encodeURIComponent(file_id) +
          '?alt=media',
        method: 'GET'
      })
      .then(function (response) {
        drive_data = response.result;
        configSyncAlert('Config loaded from Google Drive');
      })
      .catch(function (error) {
        configSyncAlert('CS503 - ' + JSON.stringify(error));
      });

    return drive_data;
  },

  /**
   * Write config file contents to Google Drive
   */
  writeConfig: async function (contents, file_id = false) {
    const metadata = {
      name: 'config.json',
      mimeType: 'application/json'
    };
    console.log(metadata, file_id, contents);
  }
};
