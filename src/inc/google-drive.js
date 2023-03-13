/* global GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import { syncData } from './sync-logic.js';
import { util } from './util.js';
import {
	CONFIG_SYNC_SAVE_STATE,
	configSyncAlert,
	configSyncIsAvailableForSignIn,
	configSyncIsSignedIn,
	configSyncSaveState,
	configSyncMessageShow,
	configData
} from '../store/config-stores.js';
import MultiPartBuilder from './multipart.js';

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
	 * Time at which remote data was updated
	 * - Set after syncing, and based on remote at page load (effectively)
	 * - Checked to see if sync might be needed
	 */
	remote_updated_at: null,

	gapi: null,
	google: null,
	tokenClient: null,

	/**
	 * Initialize GAPI and GIS
	 */
	init: async function () {
		// Load and initialize gapi.client
		google_drive.gapi = await util.newWindowVarPromise('gapi');
		await new Promise((resolve, reject) => {
			google_drive.gapi.load('client', { callback: resolve, onerror: reject });
		});
		await google_drive.gapi.client.init({}).then(function () {
			google_drive.gapi.client.load(
				'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
			);
		});

		// Load the GIS client
		google_drive.google = await util.newWindowVarPromise('google');
		await new Promise((resolve, reject) => {
			try {
				google_drive.tokenClient = google_drive.google.accounts.oauth2.initTokenClient({
					client_id: GOOGLE_DRIVE_CLIENT_ID,
					api_key: GOOGLE_DRIVE_API_KEY,
					scope:
						'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
					prompt: 'consent',
					callback: '' // defined at request time in await/promise scope.
				});
				resolve();
			} catch (err) {
				reject(err);
			}
		});

		// Test it out - try and find config
		google_drive.findConfig();
	},

	/**
	 * Handle API Load
	 */
	onLoad: function () {
		gapi.load('client:auth2', google_drive.initClient);

		// Listen for sign-in
		configSyncIsSignedIn.subscribe(google_drive.checkSyncAndChangeDates);
		configData.subscribe(google_drive.checkSyncAndChangeDates);
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
			.then(() => {
				configSyncIsAvailableForSignIn.set(true);

				// Listen for sign-in state changes.
				gapi.auth2.getAuthInstance().isSignedIn.listen(google_drive.updateSigninStatus);

				// Handle the initial sign-in state.
				google_drive.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
			})
			.catch(error => {
				configSyncAlert('CS501 - ' + JSON.stringify(error, null, 2), 'error');
			});
	},

	/**
	 *  Called when the signed in status changes, to update the UI
	 *  appropriately. After a sign-in, the API is called.
	 */
	updateSigninStatus: function (isSignedIn) {
		configSyncIsSignedIn.set(isSignedIn);
	},

	/**
	 * If signed in, check sync and change dates, maybe alert
	 * - Listens for sign-in status to change
	 * - Listens for config data to change
	 */
	checkSyncAndChangeDates: async function (changed_data) {
		let local_updated_after_sync = false;
		let remote_updated_after_sync = false;

		// Whether signed into Google Drive
		let is_signed_in;
		if (typeof changed_data == 'boolean') {
			is_signed_in = changed_data;
		} else {
			is_signed_in = get(google_drive.configSyncIsSignedIn);
		}

		// Local updated_at
		let local_updated_at = 0;

		// Local synced_at
		let local_synced_at = 0;

		// Remote updated_at
		let remote_updated_at = 0;

		// If changed data is an object, it should be our local config data
		let config_data;
		if (util.isObject(changed_data)) {
			config_data = changed_data;
		} else {
			// otherwise, get the local config data
			config_data = get(configData);
		}

		//  - try grabbing local_updated_at
		if ('updated_at' in config_data) {
			local_updated_at = config_data.updated_at;
		}

		//  - try grabbing local_synced_at
		if (
			'sync' in config_data &&
			'google_drive' in config_data.sync &&
			'synced_at' in config_data.sync.google_drive
		) {
			local_synced_at = config_data.sync.google_drive.synced_at;
		}

		// If not currently signed in and never synced before, don't show any warnings
		if (!is_signed_in && !local_synced_at) {
			return;
		}

		local_updated_after_sync = local_updated_at > local_synced_at;

		// If no new local changes, check remote updated date
		if (!local_updated_after_sync) {
			remote_updated_at = await google_drive.getRemoteUpdatedAt();
			remote_updated_after_sync = remote_updated_at > local_synced_at;
		}

		if (local_updated_after_sync || remote_updated_after_sync) {
			configSyncAlert(
				(local_updated_after_sync ? 'Local' : 'Remote') +
					' changes made since last sync.  You may wish to sync now.'
			);
		}
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
			configSyncAlert(
				'<a href="/#config">Sign in to your Google Drive account</a> to back up and sync your config.',
				'warning'
			);
			configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING_LOGIN);
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
				local_data,
				local_data.sync.google_drive.file_id
			);
			if (file_id === 0) {
				successful = false;
			} else {
				local_data.sync.google_drive.file_id = file_id;
				local_data.sync.google_drive.synced_at = util.timestamp();
			}
		}

		// As long as everything has worked out so far...
		// - If there were issues along the way, errors or warnings would already be showing
		if (successful) {
			// Show success, wait a bit, then show pending again
			configSyncAlert('Sync Successful!', 'success');
		}

		window.setTimeout(function () {
			configSyncMessageShow.set(false);
			configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
		}, 2000);

		return local_data;
	},

	/**
	 * Find config file in Google Drive if it exists
	 *  - Return file id if exists, otherwise 0
	 */
	findConfig: async function () {
		let file_id = 0;

		google_drive.gapi.client.drive.files
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
							'CS502 - Multiple config files found - will use the first one',
							'warning'
						);
					}

					file_id = response.result.files[0].id;
				}
			})
			.catch(error => {
				console.log('ERROR');
				configSyncAlert('CS503 - ' + JSON.stringify(error));
			});

		return file_id;
	},

	/**
	 * Get Remote updated date
	 * - Only fetch once and cache in property to avoid lots of calls
	 * - Used to determine whether sync might be needed
	 */
	getRemoteUpdatedAt: async function () {
		if (google_drive.remote_updated == null) {
			const signed_in = get(configSyncIsSignedIn);
			if (!signed_in) {
				return 0;
			}

			const local_data = get(configData);

			if (
				'sync' in local_data &&
				'google_drive' in local_data.sync &&
				'file_id' in local_data.sync.google_drive &&
				local_data.sync.google_drive.file_id !== 0
			) {
				const drive_data = await google_drive.readConfig(
					local_data.sync.google_drive.file_id
				);

				if (util.isObject(drive_data) && 'updated_at' in drive_data) {
					google_drive.remote_updated_at = drive_data.updated_at;
				}
			}
		}

		return google_drive.remote_updated_at;
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
				drive_data = response.result;
			})
			.catch(function (error) {
				configSyncAlert('CS504 - ' + JSON.stringify(error));
			});

		return drive_data;
	},

	/**
	 * Write config file contents to Google Drive
	 *  - Return ID of file
	 */
	writeConfig: async function (data, file_id = 0) {
		const jsonData = JSON.stringify(data);
		const metadata = {
			name: 'config.json',
			mimeType: 'application/json'
		};

		if (!file_id) {
			metadata.parents = ['appDataFolder'];
		}

		var multipart = new MultiPartBuilder()
			.append('application/json', JSON.stringify(metadata))
			.append(metadata.mimeType, jsonData)
			.finish();

		await gapi.client
			.request({
				path:
					'https://content.googleapis.com/upload/drive/v3/files/' +
					(file_id ? encodeURIComponent(file_id) : '') +
					'?uploadType=multipart&fields=id',
				method: file_id ? 'PATCH' : 'POST',
				params: {
					uploadType: 'multipart',
					supportsTeamDrives: true,
					fields: 'id'
				},
				headers: { 'Content-Type': multipart.type },
				body: multipart.body
			})
			.then(response => {
				file_id = response.result.id;
				configSyncAlert('Config saved successfully (ID ' + file_id + ')');
			})
			.catch(error => {
				configSyncAlert('CS505 - ' + JSON.stringify(error), 'error');
			});

		return file_id;
	}
};
