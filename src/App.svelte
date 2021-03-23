<script>
  let search_category = '',
    search_phrase = '';

  const services = [
    {
      id: '0',
      alias: 'ddg:',
      name: 'DuckDuckGo / Bang!',
      action: {
        url: 'https://next.duckduckgo.com/?q=%s'
      }
    },
    {
      id: '2',
      alias: 'gm:',
      name: 'Gmail / Google Mail',
      action: {
        url: 'https://mail.google.com/mail/u/0/#search/%s'
      }
    },
    {
      id: '3',
      alias: 'g:',
      name: 'Google',
      action: {
        url: 'https://www.google.com/search?hl=en&q=%s'
      }
    }
  ];

  let results = services;
  let defaultResult = results[0];

  $: {
    const exact = results.filter(service => {
      return service.alias == search_category;
    });
    if (exact.length) defaultResult = exact[0];
    else defaultResult = results[0];
  }

  function complete(event) {
    const exact = results.filter(service => {
      return service.alias == this.value;
    });
    if (exact.length) {
      this.value = exact[0].alias;
    } else {
      this.value = defaultResult.alias;
    }
  }

  function filterResults(event) {
    results = services.filter(service => {
      const regex = new RegExp(this.value, 'i');
      return regex.test(service.alias) || regex.test(service.name);
    });
  }

  function search(event) {
    const action = defaultResult.action;
    if ('url' in action) {
      let url = action.url;
      url = url.replace('%s', search_phrase);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        console.log('WINDOW WOULD CLOSE AT THIS POINT');
        // window.close();
      } else {
        alert('Something went wrong, maybe popup blocked?');
      }
    } else {
      alert('Action for ' + defaultResult.name + ' not yet supported');
    }
    console.log(defaultResult);
    console.log(search_phrase);
  }
</script>

<form on:submit|preventDefault={search}>
  <input
    class="search_category"
    bind:value={search_category}
    on:keyup={filterResults}
    on:change={complete}
    placeholder="ddg:"
  />
  <input class="search_category" bind:value={search_phrase} />
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
