import App from './App.svelte';
import { search_logic } from './inc/search-logic.js';

// TODO explicitly init and close

if (!search_logic.checkForQuery()) {
  var app = new App({
    target: document.body
  });
}

export default app;
