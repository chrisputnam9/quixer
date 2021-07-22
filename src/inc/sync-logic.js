/**
 * Logic to sync up local data with remote data
 *
 * Goals:
 *  - Maintain additions
 *  - Maintain deletions
 *  - Maintain changes based on which was most recent
 *  - Where conflicts, prefer data with a newer updated_at timestamp
 *  - If data key exists in one set but not the other:
 *    - Check for the key in .trash in the missing data set
 *    - Compare updated_at - which was more recent, update in existing or update in .trash?
 */
export const syncData = function (local_data, remote_data) {
  console.log(local_data, remote_data);

  // TODO Service IDs - use a unique hash of some sort instead to make conflicts less likely?
  // - timestamp + client identifier of some sort?

  // TODO When service is deleted, move it to .trash key
  // -

  return local_data;
};
