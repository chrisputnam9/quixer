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
export const syncData = function (local_data, remote_data) {
  console.log(local_data, remote_data);

  // TODO When service is deleted, move it to __trash key

  // TODO Add low-priority issues for:
  // - viewing trash
  // - restoring from trash
  // - deleting from trash (warn about sync impact)
  // - emptying trash (warn about sync impact)

  return local_data;
};
