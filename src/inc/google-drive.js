/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import {
  CONFIG_SYNC_SAVE_STATE,
  configSyncAlert,
  configSyncIsAvailableForSignIn,
  configSyncIsSignedIn,
  configSyncMessage,
  configSyncMessageType,
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
  sync: function (local_data) {
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
    const metadata = {
      name: 'config.json',
      mimeType: 'application/json'
    };

    // See if there is an existing config file
    if (local_data.sync.google_drive.file_id == 0) {
      // None saved locally - check drive by name
      let local_data.sync.google_drive.file_id = google_drive.findConfig();
      console.log(local_data.sync.google_drive.file_id);
    }

    // If config file exists, read it in and sync the data
    if (local_data.sync.google_drive.file_id != 0) {
    }
    
    // Write the synced data to Google Drive

    // Show success, wait a bit, then show pending again
    configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SUCCESS);
    configSyncAlert('Sync Successful!', 'success');
    window.setTimeout(function () {
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
    }, 1000);

    return local_data;
  },

  /**
   * Find config file in Google Drive if it exists
   */
  findConfig: function () {
    let drive_data = false;
    gapi.client.drive.files
      .list({
        spaces: 'appDataFolder',
        q: 'name = "config.json"',
        fields: 'nextPageToken, files(*)',
        pageSize: 10
      })
      .then(
        function (response) {
          console.log(response);
          if (response.result.files && response.result.files.length > 0) {
            if (response.result.files.length > 1) {
              console.err(
                'Multiple config files found - will use the first one - report error CS501 to https://github.com/chrisputnam9/quixer/issues along with any potentially helpful information'
              );
            }
            local_data.sync.google_drive.file_id = response.result.files[0].id;
            configSyncAlert(
              "Config found, ID: ' + local_data.sync.google_drive.file_id + ' - Loading..."
            );

            gapi.client
              .request({
                path:
                  'https://www.googleapis.com/drive/v3/files/' +
                  encodeURIComponent(local_data.sync.google_drive.file_id) +
                  '?alt=media',
                method: 'GET'
              })
              .then(function (response) {
                console.log(response);
                drive_data = response.result;
                error = 'Config loaded: ' + JSON.stringify(configDrive);
              })
              .catch(function (_error) {
                error = _error;
              });
          }
        },
        function (_error) {
          error = JSON.stringify(_error);
        }
      );
  },

  /**
   * Read config file contents from Google Drive
   */
  readConfig: function (file_id) {
  }
};
