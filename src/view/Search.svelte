<script>
  import { config } from '../store/config.js';

  let search_category = '',
    search_phrase = '',
    elSearchForm;

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
    const search = decodeURI(match[1]);
    const search_match = search.match(/(^[^ :]+)( |:|$)(.*)$/);
    let service_match = false,
      category_alias = '';

    if (search_match) {
      category_alias = search_match[1].toLowerCase();
      service_match = services.filter(service => {
        return service.toLowerCase == category_alias;
      });
    }
    if (service_match) {
      search_category = category_alias;
      search_phrase = search_match[3];
      elSearchForm.submit();
    } else {
      search_phrase = search;
    }
  }
</script>

<form on:submit|preventDefault={search} bind:this={elSearchForm}>
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
