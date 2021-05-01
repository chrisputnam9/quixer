<script>
  import {config} from "../store/config.js"

</script>

<h1>Config</h1>

<h2>Custom Services</h2>
{#each $config.services as service (service.id)}
  <div class="service" title="Service id {service.id} - {service.name}">

    <div class="service_field">
      <label for="service_name">Name: </label>
      <input id="service_name" bind:value="{service.name}" />
    </div>

    <div class="service_field">
      <label for="service_alias">Alias: </label>
      <input id="service_alias" bind:value="{service.alias}" />
    </div>

    <div class="service_field">
      <label for="service_action_url">URL: </label>
      <input id="service_action_url" bind:value="{service.action_url}" />
      <br><small>Use "%s" as placeholder for search term
    </div>
  </div>
{/each}

<style>
  label {
    font-size: .8em;
  }
</style>
