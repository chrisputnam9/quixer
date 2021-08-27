import { config } from './store/config.js';

/**
 * Search logic
 *  - Used by search UX
 *  - Used by pre-app-load query string parse & search
 */

/* global ENV_IS_LIVE */

export const search_logic = {
  query_pattern: /^\?q=([^&]+)(&|=|$)/,
  services: [],
  results: [],
  search_category: '',
  search_phrase: '',
  initialized: false,

  /**
   * Initialize data
   */
  init: function () {
    search_logic.services = config.getSortedServices();
    search_logic.results = services;
    search_logic.initialized = true;
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

  filterResults: function () {
    search_logic.results = search_logic.services.filter(service => {
      const regex = new RegExp(search_logic.search_category, 'i');
      return regex.test(service.alias[0]) || regex.test(service.name);
    });
  },

  checkForQuery: function () {
    this.init();

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
      search_logic.search_category = category_alias;
      search_logic.search_phrase = query_search_match[3];
      search_logic.filterResults();

      // See if it starts with "!" - if so, send to DDG
    } else if (query_search.match(/^!.*$/)) {
      search_logic.openUrl('https://next.duckduckgo.com/?q=' + query_search);
    } else {
      search_logic.search_phrase = query_search;
    }

    search();
    return true;
  }
};
