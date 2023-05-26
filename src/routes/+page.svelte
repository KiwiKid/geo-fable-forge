
<script lang="ts">
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import { browser } from '$app/environment'
	
	import type { PageData } from './$types';
	export let data: PageData;
	import LeafletMap from '$lib/components/LeafletMap.svelte';

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />

</svelte:head>



<section>
	{#if browser}
		<LeafletMap data={data}/>
	{:else}
		<p>Loading...</p>
	{/if}
	<details><summary>Places ({data.places.length})</summary>{JSON.stringify(data)}</details>
	{#if data.places}
		<div>{data.places}</div>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
