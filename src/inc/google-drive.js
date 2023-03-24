/* global GOOGLE_DRIVE_API_KEY GOOGLE_DRIVE_CLIENT_ID */
//import MultiPartBuilder from 'multipart.js';
import { get } from 'svelte/store';
import { syncData } from './sync-logic.js';
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
	/**
	 * Time at which remote data was updated
	 * - Set after syncing, and based on remote at page load (effectively)
	 * - Checked to see if sync might be needed
	 */
	remote_updated_at: null,

	gapi: null,
	google: null,
	tokenClient: null,

	configFileId: 0,

	/**
	 * Initialize GAPI and GIS
	 */
	init: async function () {
		// Listen for sign in or data change and check for possible sync needed
		configSyncIsSignedIn.subscribe(google_drive.checkSyncAndChangeDates);
		configData.subscribe(google_drive.checkSyncAndChangeDates);

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
		google_drive.google = await util.newWindowVarPromise('google');
		await new Promise((resolve, reject) => {
			try {
				google_drive.tokenClient = google_drive.google.accounts.oauth2.initTokenClient({
					client_id: GOOGLE_DRIVE_CLIENT_ID,
					scope:
						'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
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
			return;
		} catch (error) {
			console.warn('NOT logged in due to invalid local Google account token\n', error);
		}

		// @TODO Check expiration of token

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
						configSyncIsSignedIn.set(true);
						resolve(resp);
					};
					google_drive.tokenClient.requestAccessToken({ prompt: '' });
				} catch (error) {
					console.error(error);
				}
			});
		} else {
			// Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
			throw new Error(error.body);
		}
	},

	/**
	 * If signed in, check sync and change dates, maybe alert
	 * - Listens for login state to change -> boolean passed
	 * - Listens for config data to change -> object passed
	 */
	checkSyncAndChangeDates: async function (changed_data) {
		// Whether signed into Google Drive
		const is_signed_in =
			typeof changed_data == 'boolean' ? changed_data : get(configSyncIsSignedIn);

		// Local Config Data
		const config_data = util.isObject(changed_data) ? changed_data : get(configData);
		const local_updated_at = config_data.upated_at ?? 0;
		const local_synced_at = config_data.sync?.google_drive?.synced_at ?? 0;
		const local_updated_after_sync = local_updated_at > local_synced_at;

		// Remote sync data - (will return 0 if not signed in)
		const remote_updated_at = await google_drive.getRemoteUpdatedAt();

		// If not currently signed in and never synced before, don't show any warnings
		// - wait for them to log in
		if (!is_signed_in && !local_synced_at) {
			return false;
		}

		if (local_updated_after_sync || remote_updated_at > local_synced_at) {
			configSyncAlert(
				(local_updated_after_sync ? 'Local' : 'Remote') +
					' changes made since last sync.  You may wish to sync now.'
			);
		}
	},

	/**
	 * Get Remote updated date
	 * - Only fetch once and cache in property to avoid extra calls
	 * - Used to determine whether sync might be needed
	 */
	getRemoteUpdatedAt: async function () {
		if (google_drive.remote_updated_at == null) {
			const signed_in = get(configSyncIsSignedIn);
			if (!signed_in) {
				return 0;
			}

			const local_data = get(configData);
			const config_file_id = local_data.sync?.google_drive?.file_id ?? 0;

			if (config_file_id !== 0) {
				const drive_data = await google_drive.readConfig(config_file_id);

				if (util.isObject(drive_data) && 'updated_at' in drive_data) {
					// Note: we only cache if we got a value
					// - otherwise, we should try again on the next call
					google_drive.remote_updated_at = drive_data.updated_at;
				}
			}
		}

		return google_drive.remote_updated_at;
	},

	/**
	 * Find config file in Google Drive if it exists
	 *  - Return file id if exists, otherwise 0
	 */
	findConfig: async function () {
		google_drive._findConfig().catch(error => {
			// If token expired or was invalidated, try getting a fresh one
			console.log('ERROR: ', error);
			google_drive
				.getToken(error)
				// Then try again to find config
				.then(google_drive._findConfig)
				.catch(console.error);
		});
	},

	_findConfig: async function () {
		console.log('_findConfig');
		return google_drive.gapi.client.drive.files
			.list({
				spaces: 'appDataFolder',
				q: 'name="config.json"',
				fields: 'nextPageToken,files(*)',
				pageSize: 10
			})
			.then(google_drive._processConfig);
	},

	_processConfig: function (response) {
		console.log('config: ', response);
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
