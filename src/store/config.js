import { writable } from 'svelte/store';
import { default_config } from '../data/default-config.js';
import { google_drive } from '../inc/google-drive.js';

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
  let service_auto_id = 0; // TODO have this set up during init

  const service_template_string = JSON.stringify(data.service_template);
  const { subscribe, set } = writable(data);

  /**
   * Initialize the config instance
   *  - Load Local if any
   *  - Attempt Sync
   */
  const initialize = function () {
    // TODO populate default services with extra data from template & custom logic
    const service_template = serviceTemplate();
    setValue(
      'services',
      data.services.map(service => {
        service = {
          ...service_template,
          ...service
        };
        service.from_default_config = true;
        service.id = 'd' + service.id;
        return service;
      })
    );
    loadLocal();
    sync();
  };

  /**
   * Load from local storage if any
   */
  const loadLocal = function () {
    // TODO
  };

  /**
   * Save to local storage
   */
  const saveLocal = function () {
    // TODO
  };

  /**
   * Sync with third-party storage
   */
  const sync = function () {
    data = google_drive.sync(data);
    updateData(false);
  };

  /**
   * Get key value on data object
   */
  const getValue = function (key) {
    if (key in data) {
      return data[key];
    }

    return undefined;
  };

  /**
   * Set key value on data object
   */
  const setValue = function (key, value) {
    data[key] = value;
    saveLocal();
    updateData();
  };

  /**
   * Update data in store
   *  - Update the updated_at stamp unless "false"
   */
  const updateData = function (update_date = true) {
    if (update_date) {
      data.updated_at = new Date().getTime();
    }
    set(data);
  };

  /**
   * Get a clone of the service template object
   */
  const serviceTemplate = function () {
    return JSON.parse(service_template_string);
  };

  /**
   * Create a new service from the service template
   */
  const newService = function () {
    const service = serviceTemplate();
    service.id = ++service_auto_id;
    return service;
  };

  initialize();

  return { subscribe, setValue, getValue, newService };
}

export const config = constructConfig(default_config);
