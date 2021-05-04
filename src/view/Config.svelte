<script>
  import { config } from '../store/config.js';

  let services = config.getValue('services');
  $: {
    config.setValue('services', services);
  }
</script>

<h1>Config</h1>

<h2>Custom Services</h2>

<button>Add New Service</button>

<div class="service-boxes">
  {#each services as service (service.id)}
    <div class="service-box" title="Service id {service.id} - {service.name}">
      <div class="service_field">
        <label for="service_name">Name: </label>
        <input id="service_name" bind:value={service.name} />
        <br><small>{service.name}</small>
      </div>

      <div class="service_field">
        <label for="service_alias">Alias: </label>
        <input id="service_alias" bind:value={service.alias} />
        <br><small>{service.alias}</small>
      </div>

      <div class="service_field">
        <label for="service_action_url">URL: </label>
        <input id="service_action_url" bind:value={service.action.url} />
        <br /><small>Use "%s" as placeholder for search term </small>
        <br><small>{service.action.url}</small>
      </div>

      <button>Delete</button>
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
