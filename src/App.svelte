<script>
  import Config from './Config.svelte';
  import Search from './Search.svelte';

  let hash = document.location.hash;

  // Super cheap hash routing
  function updateHash() {
    hash = document.location.hash;
  }
  window.onhashchange = updateHash;
</script>

{#if hash === '#config'}
  <Config />
  <a href="#">Back to app</a>
{:else}
  <Search />
  <a href="#config">Configure Options</a>
{/if}
