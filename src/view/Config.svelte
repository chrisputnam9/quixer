<script>
  import { config } from '../store/config.js';

  let services = config.getValue('services');
  $: {
    config.setValue('services', services);
  }

  function addNewService() {
    services.push(config.newService());
    services = services;
  }

  function deleteService(id) {
    services = services.filter(service => service.id !== id);
  }
</script>

<h1>Config</h1>

<h2>Custom Services</h2>

<button on:click={addNewService}>Add New Service</button>

<div class="service-boxes">
  {#each services as service (service.id)}
    <div class="service-box" title="Service id {service.id} - {service.name}">
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
          bind:value={service.alias}
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
  .service-boxes {
    display: flex;
    flex-wrap: wrap;
  }
  .service-box {
    padding: 10px;
  }
</style>
