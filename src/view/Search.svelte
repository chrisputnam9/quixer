<script>
  import { config } from '../store/config.js';

  let search_category = '',
    search_phrase = '',
    elSearchCategory,
    elSearchPhrase;

  const services = config.getValue('services');
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
      const regex = new RegExp(this.value, 'i');
      return regex.test(service.alias) || regex.test(service.name);
    });
  }

  function search() {
    const action = defaultResult.action;
    if ('url' in action) {
      let url = action.url;
      url = url.replace('%s', search_phrase);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        // TODO
        console.log('WINDOW WOULD CLOSE AT THIS POINT');
        // window.close();
      } else {
        alert('Something went wrong, maybe popup blocked?');
      }
    } else {
      alert('Action for ' + defaultResult.name + ' not yet supported');
    }
  }

  // Quick and dirty query parse
  const query_pattern = /^\?q=([^&]+)(&|=|$)/;
  const match = document.location.search.match(query_pattern);
  if (match) {
    const search_split = decodeURI(match[1]).split(/ |:/);
    console.log(search_split);
  }
</script>

<form on:submit|preventDefault={search}>
  <input
    class="search_category"
    bind:this={elSearchCategory}
    bind:value={search_category}
    on:keyup={filterResults}
    on:change={complete}
    placeholder="ddg:"
  />
  <input class="search_phrase" bind:this={elSearchPhrase} bind:value={search_phrase} />
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
