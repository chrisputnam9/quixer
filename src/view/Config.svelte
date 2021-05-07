<script>
  import { config } from '../store/config.js';

  let services = config.getValue('services');
  $: {
    console.log('reacting to services change');
    console.log(services);
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
        <label for="service_name">Name: </label>
        <input id="service_name" bind:value={service.name} />
      </div>

      <div class="service_field">
        <label for="service_alias">Alias: </label>
        <input id="service_alias" bind:value={service.alias} />
      </div>

      <div class="service_field">
        <label for="service_action_url">URL: </label>
        <input id="service_action_url" bind:value={service.action.url} />
        <br /><small>Use "%s" as placeholder for search term </small>
      </div>

      <button on:click={deleteService(service.id)}>Delete</button>
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
