import { util } from './util.js';

/**
 * Logic to sync up local data with remote data
 *
 * Goals:
 *  - Compare services based on UUIDs
 *  - Maintain additions
 *  - Maintain deletions/trash
 *  - Maintain restores/untrash/undelete
 *  - Maintain changes based on which was most recent

 *  - Where conflicts, prefer data with a newer updated_at timestamp
 *  - If data key exists in one set but not the other:
 *    - Check for the key in __trash in the missing data set
 *    - Compare updated_at - which was more recent, update in existing or update in __trash?
 */
export const syncData = (local_data, remote_data) => {
	// Check top level updated_at - see if remote_data is newer
	//  - If so, replace local top level data with remote versions
	//  - If not, leave local top level data as is
	if (remote_data.updated_at > local_data.updated_at) {
		// REFERENCE: Top_Level_Config_Data
		local_data.preferences = remote_data.preferences;
		local_data.sync = remote_data.sync;
		local_data.updated_at = remote_data.updated_at;
	}

	// Sync in remote services
	for (const id in remote_data.services) {
		syncService(
			remote_data.services[id],
			local_data.services,
			local_data.__trash.services,
			true // Prefer remote if equal opposite status
			// eg. If found in trash locally with same updated date, restore it
			//  - very unlikely, but theoretically possible
		);
	}

	// Sync in remote trash
	for (const id in remote_data.__trash.services) {
		syncService(
			remote_data.__trash.services[id],
			local_data.__trash.services,
			local_data.services
		);
	}

	return local_data;
};

/**
 * Confirm if there was any actual change from a sync
 */
export const didSyncResultInChange = (data1, data2) => {
	const preferences_changed = !util.objectsSame(
		data1.preferences ?? {},
		data2.preferences ?? {}
	);
	const services_changed = !util.objectsSame(data1.services ?? {}, data2.services ?? {});
	const trash_changed = !util.objectsSame(
		data1.__trash?.services ?? {},
		data2.__trash?.services ?? {}
	);
	return preferences_changed || services_changed || trash_changed;
};

/**
 * Sync a remote service based on:
 *  - Local services
 *  - Local services with opposite status (trash vs. non-trash)
 */
const syncService = (
	remote_service,
	local_services,
	local_services_opposite_status,
	prefer_remote_if_equal_opposite_status = false
) => {
	const id = remote_service.id;

	// Exists in local?
	if (id in local_services) {
		const local_service = local_services[id];

		// Remote newer?
		if (remote_service.updated_at > local_service.updated_at) {
			// Copy in remote data
			local_services[id] = remote_service;
		}

		// Otherwise, leave local as is
	}

	// Exists in local opposite status?
	else if (id in local_services_opposite_status) {
		const local_service = local_services_opposite_status[id];

		// Remote newer?
		if (
			remote_service.updated_at > local_service.updated_at ||
			(prefer_remote_if_equal_opposite_status &&
				remote_service.updated_at === local_service.updated_at)
		) {
			// Status changed remotely - copy in remote and remove from local opposite status
			local_services[id] = remote_service;
			delete local_services_opposite_status[id];
		}

		// Otherwise, status changed locally - leave local as is
	}

	// Does not exist anywhere local?
	else {
		// New Service - copy remote to local
		local_services[id] = remote_service;
	}
};
