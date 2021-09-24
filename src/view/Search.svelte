<script>
  import { onDestroy, onMount } from 'svelte';
  import { search_logic } from '../inc/search-logic.js';

  // Initialize search logic
  search_logic.init();

  // Stores for nice reactivity
  let search_category = search_logic.search_category,
    search_phrase = search_logic.search_phrase,
    service_results = search_logic.service_results;

  let searchCategoryEl;
  onMount(async () => {
    // Focus default field
    searchCategoryEl.focus();
  });
  onDestroy(async () => {
    // Focus default field
    searchCategoryEl.focus();
    search_logic.deinit();
  });
</script>

<div class="container">
  <div class="search-container">
    <form on:submit|preventDefault={search_logic.executeServiceAction} class="search-box">
      <input
        aria-label="Search category - service alias"
        class="search_category"
        bind:this={searchCategoryEl}
        bind:value={$search_category}
        placeholder="{search_logic.default_service_alias}:"
      />
      <input
        aria-label="Search phrase"
        class="search_phrase"
        bind:value={$search_phrase}
      />
      <button type="submit">Go</button>
    </form>
    <div class="search-results textarea" tabindex="0">
      <ol>
        {#each $service_results as result (result.id)}
          <li class={result.id == search_logic.first_service_result.id ? 'active' : ''}>
            {result.alias[0]} ({result.name})
          </li>
        {/each}
      </ol>
    </div>
  </div>
</div>

<h1>Quixer - Search</h1>

<style>
  h1 {
    font-size: 1em;
    text-align: right;
    opacity: 0.7;
  }

  .container {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: flex-start;
  }

  .search-container {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: flex-start;
    width: 500px;
    max-width: 100% !important;
  }

  form.search-box {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-between;
    align-items: stretch;
  }

  form.search-box > *,
  .search-results > * {
    flex: 1 auto;
    margin: 2px;
  }

  .search-results {
    position: relative;
    width: 100%;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: flex-start;
    height: 50vh;
    overflow: auto;
    margin: 2px;
  }

  .search-results ol {
    list-style: none;
    padding: 8px;

    height: auto;
  }

  .search-results::before {
    content: '';
    display: block;
    width: 100%;
    height: 40%;
    position: absolute;
    bottom: 0;
  }

  .search-results ol li {
    margin: 0;
    padding: 0;
  }

  li.active {
    font-weight: bold;
  }
</style>
