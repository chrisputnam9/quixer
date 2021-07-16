/* global gapi GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import { syncData } from './sync-logic.js';
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
    if (local_data.sync.google_drive.file_id === 0) {
      // None saved locally - check drive by name
      local_data.sync.google_drive.file_id = await google_drive.findConfig();
    }

    // If config file exists, read it in and sync the data
    if (local_data.sync.google_drive.file_id !== 0) {
      configSyncAlert('Existing config found - reading & syncing...');
      drive_data = await google_drive.readConfig(local_data.sync.google_drive.file_id);
      if (drive_data) {
        local_data = syncData(local_data, drive_data);
        //console.groupCollapsed();
        //console.log('syncData', local_data);
        //console.groupEnd();
      } else {
        successful = false;
      }
    } else {
      configSyncAlert('No existing config file found - it will be created');
    }

    // Write the synced data to Google Drive
    // - as long as we've been successful so far
    if (successful) {
      configSyncAlert('Writing to Google Drive...');
      const file_id = await google_drive.writeConfig(
        JSON.stringify(local_data),
        local_data.sync.google_drive.file_id
      );
      if (file_id === 0) {
        successful = false;
      } else {
        local_data.sync.google_drive.file_id = file_id;
      }
    }

    // As long as everything has worked out so far...
    // - If there were issues along the way, errors or warnings would already be showing
    if (successful) {
      // Show success, wait a bit, then show pending again
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.SUCCESS);
      configSyncAlert('Sync Successful!', 'success');
    }

    window.setTimeout(function () {
      configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
    }, 2000);

    //console.groupCollapsed();
    //console.log('return', local_data);
    //console.groupEnd();

    return local_data;
  },

  /**
   * Find config file in Google Drive if it exists
   *  - Return file id if exists, otherwise 0
   */
  findConfig: async function () {
    let file_id = 0;

    await gapi.client.drive.files
      .list({
        spaces: 'appDataFolder',
        q: 'name = "config.json"',
        fields: 'nextPageToken, files(*)',
        pageSize: 10
      })
      .then(response => {
        if (response.result.files && response.result.files.length > 0) {
          if (response.result.files.length > 1) {
            configSyncAlert(
              'CS501 - Multiple config files found - will use the first one',
              'warning'
            );
          }

          //console.groupCollapsed();
          //console.log('findConfig - results:', response.result.files);
          //console.groupEnd();

          file_id = response.result.files[0].id;
        }
      })
      .catch(error => {
        configSyncAlert('CS502 - ' + JSON.stringify(error));
      });

    return file_id;
  },

  /**
   * Read config file contents from Google Drive
   *  - Return file contents
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
        //console.groupCollapsed();
        //console.log('readConfig - results:', response.result);
        //console.groupEnd();

        drive_data = response.result;
      })
      .catch(function (error) {
        configSyncAlert('CS503 - ' + JSON.stringify(error));
      });

    return drive_data;
  },

  /**
   * Write config file contents to Google Drive
   *  - Return ID of file
   */
  writeConfig: async function (contents, file_id = 0) {
    const metadata = {
      name: 'config.json',
      mimeType: 'application/json'
    };
    console.groupCollapsed();
    console.log('writeConfig - writing:', metadata, file_id, contents);
    console.groupEnd();

    configSyncAlert('Write not yet implemented', 'error');

    return file_id;
  }
};
