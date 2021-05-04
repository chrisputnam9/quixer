<script>
  import Config from './view/Config.svelte';
  import Search from './view/Search.svelte';

  // Super cheap hash routing
  let hash = document.location.hash;
  function updateHash() {
    hash = document.location.hash;
  }
  window.onhashchange = updateHash;
</script>

{#if hash === '#config'}
  <a href="/#">Back to app</a>
  <Config />
{:else}
  <a href="/#config">Configure Options</a>
  <Search />
{/if}

<svelte:head>
  <script
    async
    defer
    src="https://apis.google.com/js/api.js"
    on:load={handleClientLoad}
    onreadystatechange="if (this.readyState === 'complete') this.onload()">
  </script>
</svelte:head>

<style>
  a {
    float: right;
  }
</style>
