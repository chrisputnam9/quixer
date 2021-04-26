import { writable } from 'svelte/store'
import default_config from '../data/default-config.js'
import google_drive from '../inc/google-drive.js'

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

  const { subscribe, set } = writable(default_config);

  const config = this;
  config.subscribe = subscribe;
  config.data = default_config;

  /**
   * Initialize the config instance
   *  - Load Local if any
   *  - Attempt Sync
   */
  config.initialize = function () {
    config.loadLocal();
    config.sync();
  }  

  /**
   * Load from local storage if any
   */
  config.loadLocal = function () {
    // TODO
  }

  /**
   * Save to local storage
   */
  config.saveLocal = function () {
    // TODO
  }

  /**
   * Sync with third-party storage
   */
  config.sync = function () {
    config.data = google_drive.sync(config.data);
    set(config.data);
  }

  /**
   * Set key value on data object
   * TODO consider making a function that does "set" and optionally sets updated_at...
   */
  config.set = function (key, value) {
    config.data.key = value;
    // TODO - set updated_at to current utime
    set(config.data);
  }

  return config;
}

export const config = constructConfig(default_config);
