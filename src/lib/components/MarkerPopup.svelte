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

	async function handleStoryPopulate(evt:any, wikiId:string){
		evt.preventDefault();
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

	export function getPopulatedMarkerContent(title:string, content:string){
		return `<h1 class="text-md font-bold underline text-center p-2">${title}</h1>
					<div>
						${content}
					</div>
					<details class="max-w-96 whitespace-pre"><summary>[Generated with AI]</summary><pre> {JSON.stringify(place, undefined, 4)}</pre></details>`
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

<div style="width:300px" class="max-h-36 whitespace-pre-wrap overflow-y-auto">
            <div style="width:300px">

				{#if place.content}
				{@html getPopulatedMarkerContent(place.title, place.content)}

				{:else}
					<h1>SEED: {place.wikiTitle}</h1>
					<button style="width:300px" class=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" on:click={(evt) => handleStoryPopulate(evt, place.wikiId)}>Load</button>

					<details><summary></summary>{place.wikiSummary}</details>
				{/if}
            
		</div>

</div>
