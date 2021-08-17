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

<div class="container">
  <nav>
    {#if hash === '#config'}
      <a href="/#">Back to app</a>
    {:else}
      <a href="/#config">Configure Options</a>
    {/if}

    <span class="a-divider"> &nbsp; | &nbsp; </span>

    <a href="/about.html" target="_blank">About Quixer</a>

    <span class="a-divider"> &nbsp; | &nbsp; </span>

    <a class="icon" href="/about.html#contribution" target="_blank">
      <span class="hover-off">💙</span>
      <span class="hover-on">💚</span>
    </a>
  </nav>

  <main>
    {#if hash === '#config'}
      <Config />
    {:else}
      <Search />
    {/if}
  </main>

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
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: flex-start;
  }

  .container > * {
    width: 100%;
  }

  nav {
    text-align: right;
    padding-bottom: 10px;
  }

  .a-divider {
    color: #555;
  }

  a.icon:hover {
    text-decoration: none;
  }

  a.icon .hover-on,
  a.icon:hover .hover-off {
    display: none;
  }
  a.icon .hover-off,
  a.icon:hover .hover-on {
    display: inline;
  }
</style>
