import App from './App.svelte';
import { config } from './store/config.js';

// Check for query string first, before loading App
const query_pattern = /^\?q=([^&]+)(&|=|$)/;
const query_match = document.location.search.match(query_pattern);

if (query_match) {
  alert(query_match);
  console.log(config);
} else {
  var app = new App({
    target: document.body
  });
}

export default app;
