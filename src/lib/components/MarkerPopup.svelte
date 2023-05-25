<script lang="ts">
	import { populateStory } from '$lib/client/wiki';
	import type { Place } from '$lib/models/Place';
	import { createEventDispatcher } from 'svelte';
	import { compute_rest_props } from 'svelte/internal';
	//const dispatch = createEventDispatcher();
	
	 export let place:Place
	
	/*function addValue(delta) {
		count += delta;
		dispatch('change', count);
	}*/

	async function handleStoryPopulate(wikiId:string){
		console.log('handleStoryPopulate')
		const story = await populateStory({
			fetch: fetch,
			wikiId: wikiId
		}).catch((e) => {
			console.error(e)
		})
		
		if(!story){
			console.error('populate failed')	
		}else{
			console.log('handleStoryPopulate')
		}
	}
</script>

<style>
	button {
		width: 2rem
	}
</style>

<div>
	<!--<button on:click={() => addValue(-1)}>
		-
	</button>
	<button on:click={() => addValue(1)}>
		+
	</button>	-->
</div>

<div style="width:100%;text-align:center;font-weight:600">
	{JSON.stringify(place)}
            <div>
            <button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" on:click={() => handleStoryPopulate(place.wikiId)}>{'Load'}</button>
                <h1 class="text-xl font-bold underline text-center p-2">{place.title}</h1>

                <button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" 
				
				>{'Close'}</button>
            
            <details><summary>[Generated with AI]</summary><pre>{JSON.stringify(place.placeType, undefined, 4)}</pre><pre> {JSON.stringify(place, undefined, 4)}</pre></details>
		</div>

</div>
