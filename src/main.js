import App from './App.svelte';
import { config } from './store/config.js';

// Check for query string first, before loading App
const query_pattern = /^\?q=([^&]+)(&|=|$)/;
const query_match = document.location.search.match(query_pattern);

if (query_match) {
  const services = config.getSortedServices();
  let results = services;

  const query_search = decodeURIComponent(query_match[1]);
  const query_search_match = query_search.match(/(^[^ :+]+)( |:|\+|$)(.*)$/);
  let service_match = false,
    category_alias = '',
    search_category = '',
    search_phrase = '';

  if (query_search_match) {
    category_alias = query_search_match[1];
    service_match = services.filter(service => {
      return service.alias[0] == category_alias;
    });
  }

  // Got a service alias match? Hit it!
  if (service_match.length > 0) {
    search_category = category_alias;
    search_phrase = query_search_match[3];
    results = filterResults(services, search_category);

    // See if it starts with "!" - if so, send to DDG
  } else if (query_search.match(/^!.*$/)) {
    openUrl('https://next.duckduckgo.com/?q=' + query_search);
  } else {
    search_phrase = query_search;
  }

  search();
} else {
  var app = new App({
    target: document.body
  });
}

export default app;
