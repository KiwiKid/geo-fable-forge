<script lang="ts">
	import { populateStory } from '$lib/client/wiki';
	import type { Place } from '$lib/models/Place';
	import { createEventDispatcher } from 'svelte';
	import { compute_rest_props } from 'svelte/internal';
	import { getPlaces } from '../../routes/Places.svelte';
	const dispatch = createEventDispatcher();
	
	 export let place:Place
	
	/*function addValue(delta) {
		count += delta;
		dispatch('change', count);
	}*/
	type MarkerState = 'loading' | 'populated' | 'mine' | 'unpopulated'
	let markerState:MarkerState = getMarkerState()

	async function handleStoryPopulate(wikiId:string){
		console.log('handleStoryPopulate')
		dispatch('loading')
		
		await populateStory({
			fetch: fetch,
			wikiId: wikiId
		}).then((story) => {
			console.log('handleStoryPopulate'+JSON.stringify(story)+' Re-loading places..')
			// TODO: this could just reload this place
			dispatch('story-load', { story })
			place = story.place
			//getPlaces();
		})
		.catch((e) => {
			console.error('populate failed')	

			console.error(e)
		})
	}

	function getMarkerState(){
		if(place.title || place.content){
			// todo: check the userSession.foundPlaces array
			return 'populated'
		}
		if(place.wikiId){
			return 'unpopulated'
		}
		return 'loading'
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
            <div>
            <button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" on:click={() => handleStoryPopulate(place.wikiId)}>{'Load'}</button>
                <h1 class="text-xl font-bold underline text-center p-2">{place.title}</h1>
				{#if place.content}
					<div>
						{place.content}
					</div>
				{/if}
                <button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" 
				
				>{'Close'}</button>
            
            <details><summary>[Generated with AI]</summary><pre> {JSON.stringify(place, undefined, 4)}</pre></details>
		</div>

</div>
