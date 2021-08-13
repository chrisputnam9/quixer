<script>
  import Alert from './view/Alert.svelte';
  import Config from './view/Config.svelte';
  import Search from './view/Search.svelte';
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

<a href="https://github.com/sponsors/chrisputnam9" target="_blank">💚</a>
<span class="a-divider"> &nbsp; | &nbsp; </span>

<a href="/about.html">About Quixer</a>
<span class="a-divider"> &nbsp; | &nbsp; </span>

{#if hash === '#config'}
  <a href="/#">Back to app</a>
  <Config />
{:else}
  <a href="/#config">Configure Options</a>
  <Search />
{/if}

{#if $configSyncSaveState != CONFIG_SYNC_SAVE_STATE.PENDING}
  <Alert type={$configSyncMessageType} message={$configSyncMessage} />
{/if}

<svelte:head>
  <script
    async
    defer
    src="https://apis.google.com/js/api.js"
    on:load={google_drive.onLoad}
    onreadystatechange="if (this.readyState === 'complete') this.onload()"></script>
</svelte:head>

<style>
  a,
  .a-divider {
    float: right;
  }
</style>
