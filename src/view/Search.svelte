<script>
  /* global ENV_IS_LIVE */
  import { onMount, tick } from 'svelte';
  import { config } from '../store/config.js';

  let searchCategoryEl,
    search_category = '',
    search_category_default = config.getValue('preferences').default_service_alias,
    search_phrase = '';

  const services = config.getSortedServices();
  let results = services;
  let defaultResult = results[0];

  $: {
    let _search_category = search_category;
    if (_search_category == '') {
      _search_category = search_category_default;
    }
    const exact = results.filter(service => {
      return service.alias[0] == _search_category;
    });
    if (exact.length) defaultResult = exact[0];
    else defaultResult = results[0];
  }

  function complete() {
    const exact = results.filter(service => {
      return service.alias[0] == this.value;
    });
    if (exact.length) {
      this.value = exact[0].alias[0];
    } else {
      this.value = defaultResult.alias[0];
    }
  }

  function filterResults() {
    results = services.filter(service => {
      const regex = new RegExp(search_category, 'i');
      return regex.test(service.alias[0]) || regex.test(service.name);
    });
  }

  function search() {
    const action = defaultResult.action;
    if (
      search_phrase == '' &&
      'url_no_search' in action &&
      action.url_no_search.trim() !== ''
    ) {
      let url = action.url_no_search;
      openUrl(url);
    } else if ('url' in action) {
      let url = action.url;
      url = url.replace('%s', search_phrase);
      openUrl(url);
    } else {
      alert('Action for ' + defaultResult.name + ' not yet supported');
    }
  }

  onMount(async () => {
    // Focus default field
    searchCategoryEl.focus();
  });
</script>

<div class="container">
  <div class="search-container">
    <form on:submit|preventDefault={search} class="search-box">
      <input
        class="search_category"
        bind:this={searchCategoryEl}
        bind:value={search_category}
        on:keyup={filterResults}
        on:change={complete}
        placeholder="{search_category_default}:"
      />
      <input class="search_phrase" bind:value={search_phrase} />
      <button type="submit">Go</button>
    </form>
    <div class="search-results">
      <ol class="textarea">
        {#each results as result (result.id)}
          <li class={result.id == defaultResult.id ? 'active' : ''}>
            {result.alias[0]} ({result.name})
          </li>
        {/each}
      </ol>
    </div>
  </div>
</div>

<style>
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
    overflow: hidden;
  }

  .search-results ol {
    list-style: none;
    padding: 8px;

    height: auto;
    max-height: 50vh;
    overflow: hidden;
  }

  .search-results::before {
    content: '';
    display: block;
    width: 100%;
    height: 40%;
    position: absolute;
    bottom: 0;
    background: linear-gradient(transparent, #111);
  }

  .search-results ol li {
    margin: 0;
    padding: 0;
  }

  li.active {
    font-weight: bold;
  }
</style>
