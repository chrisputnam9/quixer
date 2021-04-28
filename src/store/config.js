import { writable } from 'svelte/store'
import {default_config} from '../data/default-config.js'
import {google_drive} from '../inc/google-drive.js'

/**
 * Build a new config store interface
 *
 * Data sources:
 *  - Defaults - hard-coded
 *  - Local - cached in local storage
 *  - Sync - synced with third-party storage
 *
 * Methods:
 *  - Sync
 *    - Sync between local and third-party storage
 *
 *  Update Services - single method
 *  - AddService
 *  - ModifyService
 *  - DeleteService
 */
function constructConfig(default_config) {

  let data = default_config;
  const { subscribe, set } = writable(data);

  /**
   * Initialize the config instance
   *  - Load Local if any
   *  - Attempt Sync
   */
  const initialize = function () {
    loadLocal();
    sync();
  }  

  /**
   * Load from local storage if any
   */
  const loadLocal = function () {
    // TODO
  }

  /**
   * Save to local storage
   */
  const saveLocal = function () {
    // TODO
  }

  /**
   * Sync with third-party storage
   */
  const sync = function () {
    data = google_drive.sync(data);
    updateData(false);
  }

  /**
   * Set key value on data object
   */
  const setValue = function (key, value) {
    data.key = value;
    saveLocal();
    updateData();
  }

  /**
   * Update data in store
   *  - Update the updated_at stamp unless "false"
   */
  const updateData = function (update_date=true) {
    if (update_date) {
      data.updated_at = new Date().getTime();
    }
    set(data);
  }

  initialize();

  return { subscribe, setValue};
}

export const config = constructConfig(default_config);
