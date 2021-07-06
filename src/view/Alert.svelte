<script>
  export let type, message;
</script>

<div class="alert {type}">
  <p>{@html message}</p>
</div>

<style>
  .alert {
    position: fixed;
    bottom: 0;
    right: 0;
    box-sizing: border-box;
    padding: 0 10px;
    border-radius: 5px 0 0 0;

    background: #ddd;
  }

  .alert.info,
  .alert.information,
  .alert.informational {
    background: #8db5ff;
  }

  .alert.success {
    background: #99ff8d;
  }

  .alert.error {
    background: #ff8d8d;
  }

  .alert.warning,
  .alert.warn {
    background: #ffd18d;
  }
</style>
