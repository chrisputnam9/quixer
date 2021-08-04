<script>
  import { onMount } from 'svelte';
  import { config } from '../store/config.js';
  import { slide } from 'svelte/transition';
  import { google_drive } from '../inc/google-drive.js';
  import {
    CONFIG_SYNC_SAVE_STATE,
    configSyncSaveState,
    configSyncIsAvailableForSignIn,
    configSyncIsSignedIn
  } from '../store/config-sync-state.js';

  let config_json = config.json;
  let config_json_altered = config_json;
  let btnConfigSaveDisabled = true;
  let txtConfigJson;
  function txtConfigJsonKeyUp() {
    config_json_altered = txtConfigJson.value;
    btnConfigSaveDisabled = config_json_altered == config_json;
  }
  function btnConfigSaveClick() {
    if (config.importJson(config_json_altered)) {
      services = config.getValue('services');
      updateServices();
      config_json = config.toJson();
      config_json_altered = config_json;
      btnConfigSaveDisabled = true;
    }
  }

  let showImportExport = false;
  function toggleImportExport() {
    showImportExport = !showImportExport;
  }

  let services = config.getValue('services');
  let servicesDisplay;
  function updateServices(fromDisplay = false) {
    if (fromDisplay && servicesDisplay) {
      servicesDisplay.forEach(service => config.updateService(service));
    }

    config.setValue('services', services);
    sortAndMaybeFilter();

    config_json = config.toJson();
    config_json_altered = config_json;
    btnConfigSaveDisabled = true;
  }
  $: {
    if (servicesDisplay) {
      updateServices(true);
    }
  }

  function addNewService() {
    services = config.addNewService();
    updateServices();
  }

  function deleteService(id) {
    config.deleteService(id);
    updateServices();
  }

  let filterInputEl;
  function sortAndMaybeFilter() {
    servicesDisplay = config.getSortedServices();

    if (filterInputEl && filterInputEl.value) {
      const pattern = new RegExp(filterInputEl.value, 'i');
      servicesDisplay = servicesDisplay.filter(service => {
        const values = Object.values(service);
        return values.some(value => {
          return String(value).match(pattern);
        });
      });
    }
  }

  async function sync() {
    await config.sync();
    updateServices();
  }

  onMount(async () => {
    // Focus default field
    filterInputEl.focus();
  });

  updateServices();
</script>

<h1>Config</h1>

{#if $configSyncIsSignedIn}
  <button
    disabled={$configSyncSaveState != CONFIG_SYNC_SAVE_STATE.PENDING}
    on:click={sync}
  >
    {#if $configSyncSaveState == CONFIG_SYNC_SAVE_STATE.PENDING}
      Sync with Google Drive
    {:else if $configSyncSaveState == CONFIG_SYNC_SAVE_STATE.PENDING_LOGIN}
      Pending Login - This shouldn't show...
    {:else if $configSyncSaveState == CONFIG_SYNC_SAVE_STATE.SAVING}
      Syncing...
    {:else if $configSyncSaveState == CONFIG_SYNC_SAVE_STATE.SUCCESS}
      Sync Complete
    {:else if $configSyncSaveState == CONFIG_SYNC_SAVE_STATE.ERROR}
      Sync Failed
    {:else}
      Sync Save State Error
    {/if}
  </button>
  <button on:click={google_drive.logOut}> Log Out of Google Drive </button>
{:else}
  <button disabled={!$configSyncIsAvailableForSignIn} on:click={google_drive.logIn}>
    {#if $configSyncIsAvailableForSignIn}
      Log In - Sync to Google Drive
    {:else}
      Loading...
    {/if}
  </button>
{/if}

<br />
<button on:click={toggleImportExport}
  >{#if showImportExport}Hide{/if} Import/Export</button
>
{#if showImportExport}
  <div class="import-export" transition:slide>
    <p>
      <b>Use Caution With This Feature</b>
      <br />Copy the JSON formatted text and save it somewhere safe to create a backup.
      <br />To import, edit or paste in valid JSON and click Save.
    </p>
    <textarea
      style="width:100%;height:400px"
      bind:this={txtConfigJson}
      on:keyup={txtConfigJsonKeyUp}
      value={config_json}
    />
    <br />
    <button disabled={btnConfigSaveDisabled} on:click={btnConfigSaveClick}>Save</button>
  </div>
{/if}

<h2>Custom Services</h2>

<div class="boxes">
  <div class="box" style="flex:2">
    <button on:click={addNewService}>Add New Service</button>
  </div>

  <div class="box" style="flex:1">
    <input
      on:keyup={sortAndMaybeFilter}
      bind:this={filterInputEl}
      placeholder="Filter services"
      class="filter_input"
    />
  </div>
</div>

<div class="boxes">
  {#each servicesDisplay as service (service.id)}
    <div
      class="box {service.hidden ? 'hidden' : ''}"
      title="Service id {service.id} - {service.name}"
    >
      <div class="service_field">
        <label for="service_{service.id}_name">Name: </label>
        <input
          id="service_{service.id}_name"
          bind:value={service.name}
          readonly={service.from_default_config}
          placeholder="Descriptive Name"
          class="service_input"
        />
      </div>

      <div class="service_field">
        <label for="service_{service.id}_alias">Alias: </label>
        <input
          id="service_{service.id}_alias"
          bind:value={service.alias[0]}
          placeholder="Alias / abbreviation"
          class="service_input"
        />
      </div>

      <div class="service_field">
        <label for="service_{service.id}_action_url">URL: </label>
        <input
          id="service_{service.id}_action_url"
          bind:value={service.action.url}
          placeholder="URL to open"
          class="service_input"
        />
        <br /><small>Use "%s" as placeholder for search term </small>
      </div>

      <div class="service_field">
        <label for="service_{service.id}_action_url_no_search"
          >URL without search:
        </label>
        <input
          id="service_{service.id}_action_url_no_search"
          bind:value={service.action.url_no_search}
          placeholder="Default - same as URL"
          class="service_input"
        />
      </div>

      <div class="service_field">
        <label for="service_{service.id}_active">
          <input
            id="service_{service.id}_active"
            type="checkbox"
            bind:checked={service.active}
          />
          Enabled
        </label>
      </div>

      {#if !service.from_default_config}
        <button on:click={deleteService(service.id)}>Delete</button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .service_field {
    padding: 2px 0;
  }
  label {
    font-size: 0.8em;
  }
  input {
    margin-bottom: 0;
  }
  input.service_input,
  input.filter_input {
    width: 100%;
    max-width: 400px;
  }
  small {
    font-size: 0.6em;
  }
  .boxes {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
  }
  .box {
    flex: 1 1 0;
    padding: 10px;
    min-width: 300px;
  }
  .hidden {
    display: none !important;
  }
</style>
