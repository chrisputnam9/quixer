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
  console.log(local_data, remote_data);

  // Check top level updated_at - see if remote_data is newer
  //  - If so, replace local top level data with remote versions
  //  - If not, leave local top level data as is

  // REFERENCE: Top_Level_Config_Data

  // Loop through remote services
  // Submethod?:
  // - Exists in local?
  //   - Remote newer?
  //     - Copy in remote data
  //   - Local same or newer?
  //     - Leave local as is
  // - Exists in local trash?
  //   - Remote newer?
  //     - Restored remotely - copy in remote and remove from local trash
  //   - Local trash same or newer?
  //     - Trashed locally - Leave local as is
  // - Does not exist anywhere local?
  //   - New Service - copy remote to local

  // Loop through remote trash services
  // Submethod?: Same logic, just different compate....?
  // - Exists in local?
  //   - Remote trash newer?
  //     - Trashed remotely - remote local, copy remote trash to local trash
  //   - Local same or newer?
  //     - Restored locally - leave as is
  // - Exists in local trash?
  //   - Remote trash newer?
  //     - Copy in remote trash
  //   - Local trash same or newer?
  //     - Leave local as is
  // - Does not exist anywhere local?
  //   - New trashed service - copy remote trash to local

  return local_data;
};

/**
 * Sync a remote service based on:
 *  - Local services
 *  - Local services with opposite status (trash vs. non-trash)
 */
const syncService = (
  remote_service,
  local_services,
  local_services_opposite_status
) => {};
