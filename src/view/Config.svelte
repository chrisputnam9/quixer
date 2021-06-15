<script>
  import { config } from '../store/config.js';
  import { slide } from 'svelte/transition';

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
      servicesDisplay.forEach(service => {
        services[service.id] = service;
      });
    }

    config.setValue('services', services);
    sortAndMaybeFilter();

    config_json = config.toJson();
    config_json_altered = config_json;
    btnConfigSaveDisabled = true;
  }
  $: {
    console.log('Reacting to servicesDisplay change');
    if (servicesDisplay) {
      updateServices(true);
    }
  }

  function addNewService() {
    services = config.addNewService();
    updateServices();
  }

  function deleteService(id) {
    delete services[id];
    updateServices();
  }

  let filterInput;
  function sortAndMaybeFilter() {
    servicesDisplay = config.getSortedServices();

    if (filterInput && filterInput.value) {
      const pattern = new RegExp(filterInput.value, 'i');
      servicesDisplay = servicesDisplay.filter(service => {
        const values = Object.values(service);
        return values.some(value => {
          return String(value).match(pattern);
        });
      });
    }
  }

  updateServices();
</script>

<h1>Config</h1>

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
  <div class="box" style="flex:3">
    <button on:click={addNewService}>Add New Service</button>
  </div>

  <div class="box" style="flex:1">
    <input
      on:keyup={sortAndMaybeFilter}
      bind:this={filterInput}
      placeholder="Filter services"
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
          placeholder="Descriptive Name"
        />
      </div>

      <div class="service_field">
        <label for="service_{service.id}_alias">Alias: </label>
        <input
          id="service_{service.id}_alias"
          bind:value={service.alias[0]}
          placeholder="Alias / abbreviation"
        />
      </div>

      <div class="service_field">
        <label for="service_{service.id}_action_url">URL: </label>
        <input
          id="service_{service.id}_action_url"
          bind:value={service.action.url}
          placeholder="URL to open"
        />
        <br /><small>Use "%s" as placeholder for search term </small>
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
  label {
    font-size: 0.8em;
  }
  input {
    margin-bottom: 0;
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
    flex: 1 auto;
    padding: 10px;
  }
  .hidden {
    display: none !important;
  }
</style>
