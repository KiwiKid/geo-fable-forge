<script lang="ts">
	import { populateStory } from '$lib/client/wiki';
	import type { Place } from '$lib/models/Place';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export const prerender = false;
	export const ssr = false;

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
		markerState = 'loading'
		
		await populateStory({
			fetch: fetch,
			wikiId: wikiId
		}).then((story) => {
			console.log('handleStoryPopulate'+JSON.stringify(story)+' Re-loading places..')
			// TODO: this could just reload this place
			dispatch('story-load', { story })
			markerState = 'populated'
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

	.leaflet-popup-close-button {
      transform: scale(2);
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

<div class="w-96 max-h-96 whitespace-normal overflow-y-auto" style="width:100%;text-align:center;font-weight:600 ">
            <div>

				{#if place.content}
					<h1 class="text-xl font-bold underline text-center p-2">{place.title}</h1>
					<div>
						{place.content}
					</div>
					<details class="max-w-96 whitespace-pre"><summary>[Generated with AI]</summary><pre> {JSON.stringify(place, undefined, 4)}</pre></details>

				{:else}
					<h1>SEED: {place.wikiTitle}</h1>
					<details><summary></summary>{place.wikiSummary}</details>
					<button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" on:click={() => handleStoryPopulate(place.wikiId)}>Load</button>
				{/if}
            
		</div>

</div>
