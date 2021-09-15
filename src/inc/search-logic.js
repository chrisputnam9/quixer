import { config } from './config.js';
import { writable, get } from 'svelte/store';

/**
 * Search logic
 *  - Used by search UX
 *  - Used by pre-app-load query string parse & search
 */

/* global ENV_IS_LIVE */

export const search_logic = {
  query_pattern: /^\?q=([^&]+)(&|=|$)/,

  services: [],

  // Stores
  search_category: null,
  search_phrase: null,
  service_results: null,
  subscriptions: [],

  first_service_result: [],
  default_service_alias: '',

  initialized: false,

  /**
   * Initialize data
   */
  init: function () {
    if (search_logic.initialized) return;

    search_logic.services = config.getSortedServices();

    // Init stores
    search_logic.search_category = writable('');
    search_logic.search_phrase = writable('');
    search_logic.service_results = writable(search_logic.services);

    // When search_category changes, filter service results accordingly
    search_logic.subscriptions.push(
      search_logic.search_category.subscribe(search_logic.filterServiceResults)
    );

    search_logic.first_service_result = search_logic.services[0];
    search_logic.default_service_alias = config.getValue(
      'preferences'
    ).default_service_alias;

    search_logic.initialized = true;
  },

  /**
   * Close down subscriptions when no longer needed
   */
  deinit: function () {
    if (!search_logic.initialized) return;

    for (const unsubscribe of search_logic.subscriptions) {
      unsubscribe();
    }
    search_logic.initialized = false;
  },

  /**
   * Open a URL in browser
   */
  openUrl: function (url) {
    const is_live = parseInt(ENV_IS_LIVE);
    if (is_live) {
      window.location.href = url;
    } else {
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        alert('Something went wrong, maybe popup blocked?');
      }
    }
  },

  executeServiceAction: function () {
    const action = search_logic.first_service_result.action,
      search_phrase = get(search_logic.search_phrase);

    if (
      search_phrase == '' &&
      'url_no_search' in action &&
      action.url_no_search.trim() !== ''
    ) {
      let url = action.url_no_search;
      search_logic.openUrl(url);
    } else if ('url' in action) {
      let url = action.url;
      url = url.replace('%s', search_phrase);
      search_logic.openUrl(url);
    } else {
      alert(
        'Action for ' + search_logic.first_service_result.name + ' not yet supported'
      );
    }
  },

  filterServiceResults: function (search_category) {
    // Filter results based on search category
    const service_results = search_logic.services.filter(service => {
      const regex = new RegExp(search_category, 'i');
      return regex.test(service.alias[0]) || regex.test(service.name);
    });

    // Look for an exact match to highlight
    let _search_category = search_category;

    // If no search category, we highlight the default alias
    if (_search_category == '') {
      _search_category = search_logic.default_service_alias;
    }

    // Look for an exact match to highlight
    const exact = service_results.filter(service => {
      return service.alias[0] == _search_category;
    });
    if (exact.length) {
      search_logic.first_service_result = exact[0];
    } else {
      search_logic.first_service_result = service_results[0];
    }

    search_logic.service_results.set(service_results);
  },

  checkForQuery: function () {
    // Check for query string first, before loading App
    const query_match = document.location.search.match(search_logic.query_pattern);
    if (!query_match) return false;

    const query_search = decodeURIComponent(query_match[1]);
    const query_search_match = query_search.match(/(^[^ :+]+)( |:|\+|$)(.*)$/);

    let service_match = [],
      category_alias = '';

    if (query_search_match) {
      category_alias = query_search_match[1];
      service_match = search_logic.services.filter(service => {
        return service.alias[0] == category_alias;
      });
    }

    // Got a service alias match? Hit it!
    if (service_match.length > 0) {
      search_logic.search_category.set(category_alias);
      search_logic.search_phrase.set(query_search_match[3]);

      // See if it starts with "!" - if so, send to DDG
    } else if (query_search.match(/^!.*$/)) {
      search_logic.openUrl('https://next.duckduckgo.com/?q=' + query_search);
    } else {
      search_logic.search_phrase.set(query_search);
    }

    search_logic.executeServiceAction();
    return true;
  }
};
