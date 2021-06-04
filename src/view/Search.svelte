<script>
  /* global ENV_IS_LIVE */
  import { config } from '../store/config.js';
  import { onMount, tick } from 'svelte';

  let search_category = '',
    search_phrase = '';

  const services = config.getSortedServices();
  let results = services;
  let defaultResult = results[0];

  $: {
    const exact = results.filter(service => {
      return service.alias == search_category;
    });
    if (exact.length) defaultResult = exact[0];
    else defaultResult = results[0];
  }

  function complete() {
    const exact = results.filter(service => {
      return service.alias == this.value;
    });
    if (exact.length) {
      this.value = exact[0].alias;
    } else {
      this.value = defaultResult.alias;
    }
  }

  function filterResults() {
    results = services.filter(service => {
      const regex = new RegExp(search_category, 'i');
      return regex.test(service.alias) || regex.test(service.name);
    });
  }

  function search() {
    const action = defaultResult.action;
    if ('url' in action) {
      let url = action.url;
      url = url.replace('%s', search_phrase);
      openUrl(url);
    } else {
      alert('Action for ' + defaultResult.name + ' not yet supported');
    }
  }

  /**
   * Open a URL in browser
   */
  function openUrl(url) {
    const is_live = parseInt(ENV_IS_LIVE);
    if (is_live) {
      window.location.href = url;
    } else {
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        alert('Something went wrong, maybe popup blocked?');
      }
    }
  }

  onMount(async () => {
    // Quick and dirty query parse
    const query_pattern = /^\?q=([^&]+)(&|=|$)/;
    const query_match = document.location.search.match(query_pattern);
    if (query_match) {
      const query_search = decodeURI(query_match[1]);
      const query_search_match = query_search.match(/(^[^ :+]+)( |:|\+|$)(.*)$/);
      let service_match = false,
        category_alias = '';

      if (query_search_match) {
        category_alias = query_search_match[1].toLowerCase();
        service_match = services.filter(service => {
          return service.alias.toLowerCase() == category_alias;
        });
      }

      // Got a service alias match? Hit it!
      if (service_match.length > 0) {
        search_category = category_alias;
        search_phrase = query_search_match[3];
        filterResults();

        // See if it starts with "!" - if so, send to DDG
      } else if (query_search.match(/^!.*$/)) {
        openUrl('https://next.duckduckgo.com/?q=' + query_search);
        return true;
      } else {
        search_phrase = query_search;
      }

      await tick();
      search();
    }
  });
</script>

<form on:submit|preventDefault={search}>
  <input
    class="search_category"
    bind:value={search_category}
    on:keyup={filterResults}
    on:change={complete}
    placeholder="ddg:"
  />
  <input class="search_phrase" bind:value={search_phrase} />
  <button type="submit">Go</button>
</form>
<ul>
  {#each results as result (result.id)}
    <li class={result.id == defaultResult.id ? 'active' : ''}>
      {result.alias} ({result.name})
    </li>
  {/each}
</ul>

<style>
  li.active {
    font-weight: bold;
  }
</style>
