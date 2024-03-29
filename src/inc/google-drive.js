/* global GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import { syncData, didSyncResultInChange } from './sync-logic.js';
import { util } from './util.js';
import { local_storage } from './local-storage.js';
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
	gapi: null,
	google: null,
	tokenClient: null,

	configFileId: 0,

	syncNeeded: null,

	/**
	 * Initialize GAPI and GIS
	 */
	init: async function () {
		// Listen for sign in or data change and check for possible sync needed
		configSyncIsSignedIn.subscribe(google_drive.maybeShowSyncNeededAlert);
		configData.subscribe(google_drive.maybeShowSyncNeededAlert);

		// Load and initialize gapi.client
		google_drive.gapi = await util.newWindowVarPromise('gapi');
		await new Promise((resolve, reject) => {
			google_drive.gapi.load('client', { callback: resolve, onerror: reject });
		});
		await google_drive.gapi.client
			.init({
				apiKey: GOOGLE_DRIVE_API_KEY
			})
			.then(function () {
				google_drive.gapi.client.load(
					'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
				);
			});

		// Load the GIS client
		// Not building UX for this for now
		// - but email could be saved here to make future logins faster
		const email = local_storage.get('google_drive_user_login_email');
		if (email === null) {
			local_storage.set('google_drive_user_login_email', '');
		}
		google_drive.google = await util.newWindowVarPromise('google');
		await new Promise((resolve, reject) => {
			try {
				google_drive.tokenClient = google_drive.google.accounts.oauth2.initTokenClient({
					client_id: GOOGLE_DRIVE_CLIENT_ID,
					scope:
						'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
					hint: email,
					callback: '' // defined at request time in await/promise scope.
				});
				resolve();
			} catch (err) {
				reject(err);
			}
		});

		configSyncIsAvailableForSignIn.set(true);

		// See if we have a token saved in local storage already
		try {
			const tokenJson = local_storage.get('google_drive_gapi_client_token');
			if (!tokenJson) throw new Error('No Google account token saved in local storage');

			const token = JSON.parse(tokenJson);
			if (!token) throw new Error('Invalid JSON saved for Google account token');

			google_drive.gapi.client.setToken(token);
			configSyncIsSignedIn.set(true);

			// See if the token has expired
			// - if so, we'll try to get a new one right away
			// - as opposed to waiting for a failed request
			const token_expires = local_storage.get('google_drive_gapi_client_token_expires');
			if (token_expires !== null) {
				if (Math.ceil(Date.now() / 1000) > parseInt(token_expires)) {
					console.warn(
						'The Google account token in local storage has expired - attempting to get a new one'
					);
					google_drive.getToken();
				}
			}

			return;
		} catch (error) {
			console.warn('NOT logged in due to invalid local Google account token\n', error);
		}

		configSyncIsSignedIn.set(false);
	},

	/**
	 * Get a fresh valid token
	 */
	logIn: function () {
		google_drive.getToken();
	},

	/**
	 * Invalidate the current token/session
	 */
	logOut: function () {
		google_drive.gapi.client.setToken(null);
		local_storage.remove('google_drive_gapi_client_token');
		local_storage.remove('google_drive_gapi_client_token_expires');
		configSyncIsSignedIn.set(false);
	},

	getToken: async function (error) {
		if (
			typeof error === 'undefined' ||
			error.result.error.code == 401 ||
			(error.result.error.code == 403 && error.result.error.status == 'PERMISSION_DENIED')
		) {
			// The access token is missing, invalid, or expired, prompt for user consent to obtain one.
			await new Promise((resolve, reject) => {
				try {
					// Settle this promise in the response callback for requestAccessToken()
					google_drive.tokenClient.callback = resp => {
						if (resp.error !== undefined) {
							reject(resp);
						}
						// GIS has automatically updated gapi.client with the newly issued access token.
						const token = google_drive.gapi.client.getToken();
						// We save it into local storage for next time
						local_storage.set('google_drive_gapi_client_token', JSON.stringify(token));
						// Note when the token will expire
						const token_expires = Math.floor(Date.now() / 1000) + token.expires_in;
						local_storage.set('google_drive_gapi_client_token_expires', token_expires);
						configSyncIsSignedIn.set(true);
						resolve(resp);
					};

					// Handle errors
					google_drive.tokenClient.error_callback = error => {
						switch (error.type) {
							case 'popup_closed':
								reject('Google login canceled by closing popup');
								break;
							case 'popup_failed_to_open':
								reject(
									'Google account connection failed because popup window did not open.<br>Check browser settings for popups on this site.'
								);
								break;
							default:
								reject(error.message);
								break;
						}
					};

					// Request the token now that callbacks are in place
					google_drive.tokenClient.requestAccessToken({ prompt: '' });
				} catch (error) {
					reject(error);
				}
			}).catch(error => {
				configSyncAlert(error, 'error');
			});
		} else {
			// Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
			throw new Error(error.body);
		}
	},

	/**
	 * Check if a sync is needed and show alert if so
	 */
	maybeShowSyncNeededAlert: async function (changed_data) {
		const saveState = configSyncSaveState.get();
		if (saveState === CONFIG_SYNC_SAVE_STATE.ERROR) {
			// Don't override an error alert
			return;
		}
		const syncNeeded = await google_drive.isSyncNeeded(changed_data);
		if (syncNeeded) {
			configSyncAlert(
				'There have been ' +
					syncNeeded +
					' changes made since the last sync.<br><b>You may wish to sync now.</b>'
			);
		}
	},

	/**
	 * If signed in, check sync and change dates, maybe alert
	 * - Listens for login state to change -> boolean passed
	 * - Listens for config data to change -> object passed
	 */
	isSyncNeeded: async function (changed_data) {
		// If we already know sync is needed, no need to check again
		// until after a sync is done
		if (google_drive.syncNeeded) {
			return google_drive.syncNeeded;
		}

		// Default false - no sync needed
		google_drive.syncNeeded = false;

		// Whether signed into Google Drive
		const is_signed_in =
			typeof changed_data == 'boolean' ? changed_data : get(configSyncIsSignedIn);

		// Local Config Data
		const config_data = util.isObject(changed_data) ? changed_data : get(configData);
		const local_updated_at = config_data.updated_at ?? 0;
		const local_synced_at = config_data.sync?.google_drive?.synced_at ?? 0;
		const local_updated_after_sync = local_updated_at > local_synced_at;

		// Remote sync data - (will return 0 if not signed in)
		const remote_updated_at = await google_drive.getRemoteUpdatedAt();

		// Debugging output
		console.log('isSyncNeeded - fresh check:', {
			is_signed_in,
			config_data,
			local_updated_at,
			local_synced_at,
			local_updated_after_sync,
			remote_updated_at
		});

		// If not currently signed in and never synced before, don't show any warnings
		// - wait for them to log in before we let them know sync is needed
		if (!is_signed_in && !local_synced_at) {
			return google_drive.syncNeeded;
		}

		const syncNeeded = [];
		if (local_updated_after_sync) {
			syncNeeded.push('local');
		}
		if (remote_updated_at > local_synced_at) {
			syncNeeded.push('remote');
		}
		google_drive.syncNeeded = syncNeeded.join(' & ');

		return google_drive.syncNeeded;
	},

	/**
	 * Get Remote updated date
	 * - Only fetch once and cache in property to avoid extra calls
	 * - Used to determine whether sync might be needed
	 */
	getRemoteUpdatedAt: async function () {
		let remote_updated_at = 0;

		const signed_in = get(configSyncIsSignedIn);
		if (!signed_in) {
			return 0;
		}

		const drive_data = await google_drive.readConfig();

		if (util.isObject(drive_data) && 'updated_at' in drive_data) {
			// Note: we only cache if we got a value
			// - otherwise, we should try again on the next call
			remote_updated_at = drive_data.updated_at;
		}

		return remote_updated_at;
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

		let successful = false;
		let local_data_changed = false;
		let remote_data_changed = false;

		// Note data before sync
		const drive_data = await google_drive.readConfig();
		const local_data_before = util.objectClone(local_data);

		// Make note of sync time before starting
		const local_synced_at = local_data.sync?.google_drive?.synced_at ?? 0;

		// Attempt to read in remote config file
		if (util.isObject(drive_data)) {
			configSyncAlert('Existing remote config found - reading & syncing...');
			local_data = syncData(local_data, drive_data);
			local_data_changed = didSyncResultInChange(local_data, local_data_before);
			remote_data_changed = didSyncResultInChange(local_data, drive_data);
			successful = true;
		} else if (drive_data === false) {
			configSyncAlert('No existing remote config file found - it will be created');
			successful = true;
		} else {
			configSyncAlert('CS506 - Remote config file found, but failed to read it', 'error');
		}

		// Set new sync time assuming success
		local_data.sync.google_drive.synced_at = util.timestamp();

		// Set updated date to match synced date if data changed significantly from prior *remote*
		// - Set here so that it syncs to remote data
		// - See below for check if local data changed
		if (remote_data_changed) {
			local_data.updated_at = local_data.sync.google_drive.synced_at;
		}

		// Write the synced data to Google Drive
		// - as long as we've been successful so far
		if (successful) {
			successful = false;
			configSyncAlert('Writing to Google Drive...');
			const file_id = await google_drive.writeConfig(
				local_data,
				local_data.sync.google_drive.file_id
			);
			if (file_id !== 0) {
				successful = true;
				local_data.sync.google_drive.file_id = file_id;
			}
		}

		// Set local updated date to match synced date if data changed significantly from prior *remote*
		// - Set here so it *doesn't* sync to remote data
		// - See above for check if remote data changed
		if (local_data_changed) {
			local_data.updated_at = local_data.sync.google_drive.synced_at;
		}

		// As long as everything has worked out so far...
		// - If there were issues along the way, errors or warnings would already be showing
		if (successful) {
			// Show success, wait a bit, then show pending again
			configSyncAlert('Sync Successful!', 'success');
		} else {
			local_data.sync.google_drive.synced_at = local_synced_at;
		}

		window.setTimeout(function () {
			configSyncMessageShow.set(false);
			configSyncSaveState.set(CONFIG_SYNC_SAVE_STATE.PENDING);
		}, 2000);

		return local_data;
	},

	/**
	 * Read config file contents from Google Drive
	 *  - Return file contents
	 */
	readConfig: async function () {
		// Try and read the config file
		return await google_drive._readConfig().catch(error => {
			// If token expired or was invalidated, try getting a fresh one
			return (
				google_drive
					.getToken(error)
					// Then try again to read config
					.then(google_drive._readConfig)
					.catch(function (error) {
						configSyncAlert('CS504 - ' + JSON.stringify(error), 'error');
					})
			);
		});
	},

	_readConfig: async function () {
		const config_file_id = await google_drive.findConfig();
		if (config_file_id === 0) {
			return false;
		}

		return google_drive.gapi.client
			.request({
				path:
					'https://www.googleapis.com/drive/v3/files/' +
					encodeURIComponent(config_file_id) +
					'?alt=media',
				method: 'GET'
			})
			.then(google_drive._processReadConfig);
	},

	_processReadConfig: async function (response) {
		return response.result ?? null;
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

		await google_drive.gapi.client
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
	},

	/**
	 * Find config file in Google Drive if it exists
	 *  - Return file id if exists, otherwise 0
	 */
	findConfig: async function () {
		// See if we already have the ID stored on this object
		let config_file_id = google_drive.configFileId;
		if (config_file_id !== 0) {
			return config_file_id;
		}

		// See if we have the ID in local data
		const local_data = get(configData);
		config_file_id = local_data.sync.google_drive.file_id;
		if (config_file_id !== 0) {
			google_drive.configFileId = config_file_id;
			return config_file_id;
		}

		// Try and find the config file
		await google_drive._findConfig().catch(error => {
			// If token expired or was invalidated, try getting a fresh one
			google_drive
				.getToken(error)
				// Then try again to find config
				.then(google_drive._findConfig)
				.catch(function (error) {
					configSyncAlert(
						'CS507 - Error finding config file ' + JSON.stringify(error),
						'error'
					);
				});
		});

		// Return the file ID (or 0 if not found)
		// - will be set by _processFindConfig
		return google_drive.configFileId;
	},

	_findConfig: async function () {
		return google_drive.gapi.client.drive.files
			.list({
				spaces: 'appDataFolder',
				q: 'name="config.json"',
				fields: 'nextPageToken,files(*)',
				pageSize: 10
			})
			.then(google_drive._processFindConfig);
	},

	_processFindConfig: function (response) {
		if (response.result.files && response.result.files.length > 0) {
			if (response.result.files.length > 1) {
				configSyncAlert(
					'CS502 - Multiple config files found - will use the first one',
					'warning'
				);
			}

			google_drive.configFileId = response.result.files[0].id;
		}
	}
};
