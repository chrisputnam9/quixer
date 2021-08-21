<script>
  import Alert from './view/Alert.svelte';
  import Config from './view/Config.svelte';
  import Search from './view/Search.svelte';
  import Nav from './view/Nav.svelte';
  import { google_drive } from './inc/google-drive.js';
  import {
    CONFIG_SYNC_SAVE_STATE,
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

<div class="container">
  {#if hash === '#config'}
    <Nav {hash} />
    <main>
      <Config />
    </main>
  {:else}
    <main>
      <Search />
    </main>
    <Nav {hash} />
  {/if}

  {#if $configSyncSaveState != CONFIG_SYNC_SAVE_STATE.PENDING}
    <Alert type={$configSyncMessageType} message={$configSyncMessage} />
  {/if}
</div>

<svelte:head>
  <script
    async
    defer
    src="https://apis.google.com/js/api.js"
    on:load={google_drive.onLoad}
    onreadystatechange="if (this.readyState === 'complete') this.onload()"></script>
</svelte:head>

<style>
  .container {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: space-between;
    justify-content: center;
    align-items: flex-start;
  }

  .main {
    width: 100%;
  }
</style>
