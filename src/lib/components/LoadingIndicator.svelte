

<script>
	import { createEventDispatcher } from 'svelte';
	//const dispatch = createEventDispatcher();
	
	/**
	 * @type {any}
	 */
	 export let loadingPlace;
	
	/*function addValue(delta) {
		count += delta;
		dispatch('change', count);
	}*/
</script>

<style>
	button {
		width: 2rem
	}
</style>

<div style="width:100%;text-align:center;font-weight:600">
	{JSON.stringify(loadingPlace)}
</div>
