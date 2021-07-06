<script>
  import Alert from './view/Alert.svelte';
  import Config from './view/Config.svelte';
  import Search from './view/Search.svelte';
  import {
    configSyncSaveState,
    configSyncMessageType,
    configSyncMessage
  } from './store/config-sync-state.js';

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

{#if $configSyncSaveState > 0}
  <Alert type={$configSyncMessageType} message={$configSyncMessage} />
{/if}

<!-- svelte:head>
  <script
    async
    defer
    src="https://apis.google.com/js/api.js"
    on:load={handleClientLoad}
    onreadystatechange="if (this.readyState === 'complete') this.onload()" ✂prettier:content✂="CiAg" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script>
</svelte:head -->
<style>
  a {
    float: right;
  }
</style>
