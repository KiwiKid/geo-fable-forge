<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let eye = true;
	function clickEye(evt:any) {
		evt.stopPropagation();
		eye = !eye;
		dispatch('click-eye', eye);
	}
	
	let lines = true;
	function clickLines(evt:any) {
		evt.stopPropagation();
		lines = !lines;
		dispatch('click-lines', lines);
	}
</script>

<style>
	.selected {
		background-opacity: 25%;
		background-color: #DCC;
	}
	
	button {
		width: 2rem;
		height: 2rem;
		border: 0;
		background-color: transparent;
		transition-property: background-color, background-opacity; 
		transition-duration: 250ms;
		border-radius: 0.375rem;
	}
	
	.single-click:hover {
		background-opacity: 50%;
		background-color: lightgray;
	}
</style>

<!-- Icons from heroicons.dev -->
<button type="button" on:click={(evt) => clickLines(evt)} class:selected={lines} title="Search Mode">
	<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke-linecap="round" stroke-linejoin="round"></path>
		</svg>
</button>

<button type="button" class="single-click" on:click={() => dispatch('click-reset')} title="Reset View">
	<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
</button>

<button type="button" on:click={(evt) => clickEye(evt)} class:selected={eye} title="Show Markers">
	<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="{eye ? 2 : 1}" viewBox="0 0 24 24" stroke="currentColor">
	{#if eye}
		<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
	{:else}
		<path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
	{/if}
	</svg>
</button>

