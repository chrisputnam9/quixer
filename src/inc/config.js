import { get } from 'svelte/store';
import { default_config } from '../data/default-config.js';
import { google_drive } from '../inc/google-drive.js';
import { local_storage } from '../inc/local-storage.js';
import { util } from '../inc/util.js';
import { configData } from '../store/config-stores.js';

/**
 * Build a new config store interface
 */
const constructConfig = default_config => {
  configData.set(util.objectClone(default_config));

  let data = get(configData);
  let highest_service_index = 0;

  const service_template_string = JSON.stringify(data.service_template);

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
    highest_service_index = Object.entries(data.services).reduce(
      (highest_id, service) => {
        const _id = parseInt(service[1].id.replace(/^(\d+).*$/, '$1'));
        if (typeof _id === 'number' && !isNaN(_id)) {
          if (_id > highest_id) {
            return _id;
          }
        }
        return highest_id;
      },
      highest_service_index
    );
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
    return Object.values(util.objectClone(data.services)).sort((service1, service2) => {
      let alias1 = null;
      let alias2 = null;

      if ('alias' in service1 && 0 in service1.alias) {
        alias1 = service1.alias[0];
      }

      if ('alias' in service2 && 0 in service2.alias) {
        alias2 = service2.alias[0];
      }

      /** Sort default service first **/
      if (alias1 == data.preferences.default_service_alias) {
        return -1;
      }
      if (alias2 == data.preferences.default_service_alias) {
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
      if (!service1.from_default_config && !service2.from_default_config) {
        return service1.id.localeCompare(service2.id);
      }

      /** Alphabetical by name after that **/
      return service1.name.localeCompare(service2.name);
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
            case '__trash':
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
                case 'active':
                case 'alias':
                case 'updated_at':
                  service[key] = new_service[key];
                  break;
                case 'action':
                  for (const _action in new_service.action) {
                    service[_action] = new_service.action[_action];
                  }
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
  const prepToSave = (json = true) => {
    let toSave = util.objectClone(data);

    // Remove data that shouldn't be saved
    for (const key in toSave) {
      // REFERENCE: Config_Data_Allowed_To_Change
      switch (key) {
        case 'preferences':
        case 'sync':
        case 'updated_at':
        case '__trash':
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
      let changed_data = {};
      // REFERENCE: Default_Service_Data_Allowed_To_Change
      if ('action' in service) {
        changed_data.action = service.action;
      }
      if ('alias' in service) {
        changed_data.alias = service.alias;
      }
      if ('active' in service) {
        changed_data.active = service.active;
      }
      if ('updated_at' in service) {
        // Must maintain this to allow reversions to sync
        changed_data.updated_at = service.updated_at;
        // - ie. maintaining that the data is as it should be, even if same as defaults
      }

      changed_data = util.diffObjectRecursive(changed_data, default_service);

      if (
        !('url_no_search' in default_config.services[id].action) &&
        'action' in changed_data &&
        'url_no_search' in changed_data.action &&
        changed_data.action.url_no_search.trim() === ''
      ) {
        delete changed_data.action.url_no_search;
      }

      if (changed_data.updated_at === 0) {
        delete changed_data.updated_at;
      }

      if (!util.isEmptyObject(changed_data)) {
        toSave.services[id] = changed_data;
      }
    }

    if (json) {
      return JSON.stringify(toSave, null, 2);
    } else {
      return toSave;
    }
  };

  /**
   * Prep data for export
   */
  const prepToExport = (json = true) => {
    const toExport = prepToSave(false);
    delete toExport.updated_at;
    delete toExport.sync;

    if (json) {
      return JSON.stringify(toExport, null, 2);
    } else {
      return toExport;
    }
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
  const setValue = (key, value, update_date = true) => {
    data[key] = value;
    updateData(update_date);
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
    configData.set(data);
  };

  /**
   * Delete a service
   *  - Move it to the trash
   */
  const deleteService = id => {
    // Move to trash
    data.__trash.services[id] = data.services[id];

    // Update date to signify modification
    data.__trash.services[id].updated_at = util.timestamp();

    // Remove from services
    delete data.services[id];

    // Update Data - date & store
    updateData();
  };

  /**
   * Update a service
   *  - Update the updated_at stamp if anything actually changed (unless "false")
   */
  const updateService = (service, update_date = true) => {
    // Compare data, see if anything actually changed
    if (util.objectsSame(service, data.services[service.id])) {
      return false;
    }

    if (update_date) {
      service.updated_at = util.timestamp();
    }
    data.services[service.id] = service;

    // Update Data - date & store
    updateData();

    return true;
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
    service.id = ++highest_service_index + '-' + util.getUUID();
    service.updated_at = util.timestamp();
    data.services[service.id] = service;

    // Update Data - date & store
    updateData();

    return data.services;
  };

  /**
   * Import data from JSON
   */
  const importJson = json => {
    if (json == prepToExport()) {
      alert('No changes to data, skipping import');
      return false;
    }

    try {
      const _data = JSON.parse(json);
      for (const key in _data) {
        data[key] = _data[key];
      }
      updateData();
      saveLocal();
    } catch (error) {
      console.error(error);
      alert('Issue with import, see console for more detail:\n\n' + error);
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
    prepToExport,
    setValue,
    sync,
    deleteService,
    updateService
  };
};

export const config = constructConfig(default_config);
