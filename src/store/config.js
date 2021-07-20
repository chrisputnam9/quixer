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
const constructConfig = default_config => {
  let data = util.objectClone(default_config);
  let service_auto_id = 0;

  const service_template_string = JSON.stringify(data.service_template);
  const { subscribe, set } = writable(data);

  /**
   * Initialize the config instance
   *  - Load Local if any
   *  - Attempt Sync
   */
  const initialize = () => {
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
    service_auto_id = Object.entries(data.services).reduce((highest_id, service) => {
      const _id = parseInt(service[1].id);
      if (typeof _id === 'number' && !isNaN(_id)) {
        if (_id > highest_id) {
          return _id;
        }
      }
      return highest_id;
    }, service_auto_id);
  };

  /**
   * Sort services
   *  - Default fallback first
   *  - Active last
   *  - Custom config first, default config last
   *  - Newest first - based on ID
   *  - Alphabetical from there
   */
  const getSortedServices = () => {
    return Object.values(data.services).sort((service1, service2) => {
      /** Sort default service first **/
      if (service1.alias[0] == data.preferences.default_service_alias) {
        return -1;
      }
      if (service2.alias[0] == data.preferences.default_service_alias) {
        return 1;
      }

      /** Active at end **/
      if (service1.active !== service2.active) {
        return service1.active ? -1 : 1;
      }

      /** Custom first, default config last **/
      if (service1.from_default_config !== service2.from_default_config) {
        return service1.from_default_config ? 1 : -1;
      }

      /** Newest custom first **/
      if (typeof service1.id == 'number' && typeof service2.id == 'number') {
        return service1.id > service2.id ? -1 : 1;
      }

      /** Alphabetical by alias after that **/
      return service1.alias[0].localeCompare(service2.alias[0]);
    });
  };

  /**
   * Load from local storage if any
   */
  const loadLocal = () => {
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

        // Load all other data as is, where allowed
        for (const key in _data) {
          // REFERENCE: Config_Data_Allowed_To_Change
          switch (key) {
            case 'preferences':
            case 'sync':
            case 'updated_at':
              data[key] = _data[key];
              break;
            default:
              console.warn(
                `'${key}' found in config data is not allowed to override default data - this will be ignored and removed from stored data`
              );
              break;
          }
        }

        // Look through services, load as needed
        for (const id in new_services) {
          const service = data.services[id];
          const new_service = new_services[id];
          // If it's a default service, only allow overwrite of certain data
          if (service && service.from_default_config) {
            for (const key in new_service) {
              switch (key) {
                // REFERENCE: Default_Service_Data_Allowed_To_Change
                case 'action':
                case 'active':
                case 'alias':
                case 'updated_at':
                  service[key] = new_service[key];
                  break;
                default:
                  console.warn(
                    `'${key}' found in config data for service ${id} is not allowed to override default data - this will be ignored and removed from stored data`
                  );
                  break;
              }
            }
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
   * Prep data to save
   *  - Compare default data against
   */
  const prepToSave = () => {
    const toSave = util.objectClone(data);

    // Remove data that shouldn't be saved
    for (const key in toSave) {
      // REFERENCE: Config_Data_Allowed_To_Change
      switch (key) {
        case 'preferences':
        case 'sync':
        case 'updated_at':
          // OK to save
          break;
        default:
          delete toSave[key];
          break;
      }
    }

    toSave.services = {};

    // Filter services and save only custom & changed data
    for (const id in data.services) {
      const service = data.services[id];

      // Is it a default service? If not, good to save
      if (!(id in default_config.services)) {
        toSave.services[id] = service;
        continue;
      }

      // Otherwise, this is a default service - check for any change to service data
      const default_service = default_config.services[id];
      let changed_data = {
        // REFERENCE: Default_Service_Data_Allowed_To_Change
        action: service.action,
        alias: service.alias,
        active: service.active
        // updated_at - add it below only if something else changed
      };

      changed_data = util.diffObjectRecursive(changed_data, default_service);

      if (!util.isEmptyObject(changed_data)) {
        changed_data.updated_at = service.updated_at;
        toSave.services[id] = changed_data;
      }
    }
    return JSON.stringify(toSave);
  };

  /**
   * Save to local storage
   */
  const saveLocal = () => {
    local_storage.set('config', prepToSave());
  };

  /**
   * Sync with third-party storage
   */
  const sync = async () => {
    // Sync up with Google Drive
    data = await google_drive.sync(data);
    // Save synced data set to local storage
    saveLocal();
  };

  /**
   * Get key value on data object
   */
  const getValue = key => {
    if (key in data) {
      return data[key];
    }

    return undefined;
  };

  /**
   * Set key value on data object
   */
  const setValue = (key, value) => {
    data[key] = value;
    updateData();
    //sync();
    saveLocal();
  };

  /**
   * Update data in store
   *  - Update the updated_at stamp unless "false"
   */
  const updateData = (update_date = true) => {
    if (update_date) {
      data.updated_at = util.timestamp();
    }
    set(data);
  };

  /**
   * Update a service
   *  - Update the updated_at stamp if anything actually changed (unless "false")
   */
  const updateService = (service, update_date = true) => {

    // Compare data, see if anything actually changed

    if (update_date) {
      service.updated_at = util.timestamp();
    }
    data.services[service.id] = service;
  };

  /**
   * Get a clone of the service template object
   */
  const serviceTemplate = () => {
    return JSON.parse(service_template_string);
  };

  /**
   * Create a new service from the service template
   */
  const addNewService = () => {
    const service = serviceTemplate();
    service.id = ++service_auto_id;
    service.updated_at = util.timestamp();
    data.services[service.id] = service;
    updateData();
    return data.services;
  };

  /**
   * Get data as JSON
   */
  const toJson = () => {
    return JSON.stringify(data, null, 2);
  };

  /**
   * Import data from JSON
   */
  const importJson = json => {
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
    addNewService,
    getSortedServices,
    getValue,
    importJson,
    setValue,
    subscribe,
    sync,
    toJson,
    updateService
  };
};

export const config = constructConfig(default_config);
