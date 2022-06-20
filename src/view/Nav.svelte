<script>
	/* global CURRENT_DATE_STAMP */
	export let hash = '';

	const current_date_stamp = CURRENT_DATE_STAMP;
</script>

<nav>
	{#if hash === '#config'}
		<a href="/#">Back to app</a>
	{:else}
		<a href="/#config">Configure Options</a>
	{/if}

	<span class="a-divider"> &nbsp; | &nbsp; </span>

	<a href="/about.html" target="_blank">About Quixer</a>
	<span class="a-divider"> &nbsp; | &nbsp; </span>

	<a href="/tips" target="_blank">Tips</a>

	<span class="a-divider"> &nbsp; | &nbsp; </span>

	<a class="icon" href="/about.html#contribution" target="_blank">
		<span class="hover-off">💙</span>
		<span class="hover-on">💚</span>
	</a>

	<span class="publish-date align-right" title="Quixer current version publish date"
		>{current_date_stamp}</span
	>
</nav>

<style>
	nav {
		width: 100%;
		text-align: left;
		padding-top: 10px;
		align-self: flex-end;
	}

	.a-divider {
		color: #555;
	}

	a.icon:hover {
		text-decoration: none;
	}

	a.icon .hover-on,
	a.icon:hover .hover-off,
	a.icon:focus .hover-off {
		display: none;
	}
	a.icon .hover-off,
	a.icon:hover .hover-on,
	a.icon:focus .hover-on {
		display: inline;
	}

	.align-right {
		text-align: right;
		float: right;
	}
</style>
