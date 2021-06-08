import { writable } from 'svelte/store';
import { default_config } from '../data/default-config.js';
import { google_drive } from '../inc/google-drive.js';
import { local_storage } from '../inc/local-storage.js';
import { util } from '../inc/util.js';

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
  let service_auto_id = 0;

  const service_template_string = JSON.stringify(data.service_template);
  const { subscribe, set } = writable(data);

  /**
   * Initialize the config instance
   *  - Load Local if any
   *  - Attempt Sync
   */
  const initialize = function () {
    const service_template = serviceTemplate();
    data.services = util.objectMap(data.services, service => {
      service = {
        ...service_template,
        ...service
      };
      service.from_default_config = true;
      //service.id = 'd' + service.id;
      return service;
    });
    loadLocal();
    sync();
    service_auto_id = Object.entries(data.services).reduce((highest_id, service) => {
      if (typeof service.id === 'number') {
        if (service.id > highest_id) {
          return service.id;
        }
      }
      return highest_id;
    }, service_auto_id);
  };

  /**
   * Sort services
   *  - Active last
   *  - Defaults last
   *  - Newest first - based on ID
   */
  const getSortedServices = function () {
    return Object.values(data.services).sort((service1, service2) => {
      if (service1.active !== service2.active) {
        return service1.active ? -1 : 1;
      }

      if (service1.from_default_config !== service2.from_default_config) {
        return service1.from_default_config ? 1 : -1;
      }

      if (typeof service1.id === typeof service2.id) {
        return service1.id > service2.id ? -1 : 1;
      }
    });
  };

  /**
   * Load from local storage if any
   */
  const loadLocal = function () {
    const json = local_storage.get('config');
    if (json) {
      const _data = JSON.parse(json);
      // Check out the data before saving it
      if (
        _data &&
        typeof _data === 'object' &&
        Object.values(_data).length > 0 &&
        'services' in _data
      ) {
        // Load services with special logic to prevent *removal* of defaults
        const new_services = _data.services;
        delete _data.services;

        for (const id in new_services) {
          const service = data.services[id];
          const new_service = new_services[id];
          // If it's a default service, only allow overwrite of certain data
          if (service && service.from_default_config) {
            service.action = new_service.action;
            service.active = new_service.active;
            service.alias = new_service.alias;
            service.updated_at = new_service.updated_at;
          } else {
            data.services[id] = new_service;
          }
        }
      } else {
        console.warn('Not loading local data - there is an issue with it.');
      }
    }
  };

  /**
   * Save to local storage
   */
  const saveLocal = function () {
    local_storage.set('config', JSON.stringify(data));
  };

  /**
   * Sync with third-party storage
   */
  const sync = function () {
    data = google_drive.sync(data);
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
    updateData();
    saveLocal();
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
  const addNewService = function () {
    const service = serviceTemplate();
    service.id = ++service_auto_id;
    data.services[service.id] = service;
    updateData();
    return data.services;
  };

  /**
   * Get data as JSON
   */
  const toJson = function () {
    return JSON.stringify(data, null, 2);
  };

  /**
   * Import data from JSON
   */
  const importJson = function (json) {
    if (json == toJson()) {
      alert('No changes to data, skipping import');
      return false;
    }

    try {
      const _data = JSON.parse(json);
      data = _data;
      updateData();
    } catch (error) {
      alert('Issue with import:\n\n' + error);
      return false;
    }

    return true;
  };

  initialize();

  return {
    subscribe,
    setValue,
    getValue,
    toJson,
    importJson,
    addNewService,
    getSortedServices
  };
}

export const config = constructConfig(default_config);
