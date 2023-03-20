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

		// See if we have a token saved in local storage
		try {
			const tokenJson = local_storage.get('google_drive_gapi_client_token');
			if (tokenJson) {
				const token = JSON.parse(tokenJson);
				google_drive.gapi.client.setToken(token);
				google_drive.findConfig();
				return;
			}
		} catch (error) {
			console.error(
				'Invalid token stored in local storage or unable to retreive token',
				'Fresh token will be fetched instead'
			);
		}

		// No token, so we need to get one
		google_drive.getToken().then(google_drive.findConfig);
		google_drive.tokenClient.callback = function () {
			google_drive.findConfig();
		};
		google_drive.tokenClient.requestAccessToken({ prompt: '' });
	},

	getToken: async function (error) {
		if (
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
