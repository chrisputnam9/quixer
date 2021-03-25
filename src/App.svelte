<script>
    import Config from "./Config.svelte";
    import Search from "./Search.svelte"; 

    const hash = document.location.hash;
</script>

{#if hash === "#config"}
    <Config></Config>
{:else}
    <Search></Search>
{/if}
