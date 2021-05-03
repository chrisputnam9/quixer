<script>
  import { config } from '../store/config.js';

  let services = config.getValue('services');
  $: {
    config.setValue('services', services);
  }
</script>

<h1>Config</h1>

<h2>Custom Services</h2>
<div class="services">
  {#each services as service (service.id)}
    <div class="service" title="Service id {service.id} - {service.name}">
      <div class="service_field">
        <label for="service_name">Name: </label>
        <input id="service_name" bind:value={service.name} />
        <small>{service.name}</small>
      </div>

      <div class="service_field">
        <label for="service_alias">Alias: </label>
        <input id="service_alias" bind:value={service.alias} />
        <small>{service.alias}</small>
      </div>

      <div class="service_field">
        <label for="service_action_url">URL: </label>
        <input id="service_action_url" bind:value={service.action.url} />
        <small>{service.action.url}</small>
        <br /><small>Use "%s" as placeholder for search term </small>
      </div>
    </div>
  {/each}
</div>

<style>
  label {
    font-size: 0.8em;
  }
</style>
