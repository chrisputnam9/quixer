import App from './App.svelte';
import { search_logic } from './inc/search-logic.js';

search_logic.init();
const query_match = search_logic.checkForQuery();
search_logic.deinit();

if (!query_match) {
  var app = new App({
    target: document.body
  });
}

export default app;
