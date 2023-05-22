<script>
	import { createEventDispatcher } from 'svelte';
	//const dispatch = createEventDispatcher();
	
	/**
	 * @type {any}
	 */
	 export let place;
	
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

<div>
	<!--<button on:click={() => addValue(-1)}>
		-
	</button>
	<button on:click={() => addValue(1)}>
		+
	</button>	-->
</div>

<div style="width:100%;text-align:center;font-weight:600">
	woah{JSON.stringify(place)}


	<img class='rounded-lg mr-2' src={`${place.main_image_url}`} alt={place.wiki_url}/>
            <div>
            <button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded">{'Close'}</button>
                <div>
                <h1 class="text-xl font-bold underline text-center p-2">{place.title}</h1>
                
                </div>

                <button class="float-right bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded" 
				
				>{'Close'}</button>
            
            <details><summary>[Generated with AI]</summary><pre>{JSON.stringify(place.placeType, undefined, 4)}</pre><pre> {JSON.stringify(place, undefined, 4)}</pre></details>
		</div>

</div>
