<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';

	
	import type { PageData } from './$types';
	export let data: PageData;

	import L, {Map as LMap} from 'leaflet';
	import MapToolbar from '../lib/components/MapToolbar.svelte';
	import MarkerPopup from '../lib/components/MarkerPopup.svelte';
	import * as markerIcons from '../lib/components/markers.js';
	import type { Place } from '$lib/models/Place';
	import { searchPlaces } from '$lib/client/wiki';
	import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';

	let map:LMap | null;

	const initialView:[number, number] = [39.8283, -98.5795];
	function createMap(container:any) {
	  let m = L.map(container, {preferCanvas: true }).setView(initialView, 5);
    	L.tileLayer(
			'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
			{
			attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
				&copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
			subdomains: 'abcd',
			maxZoom: 14,
			}
	  ).addTo(m);


    return m;
  }
	
	let eye = true;
	let lines = true;
	
	//let toolbar = new L.Control({ position: 'topright' });
	let toolbarComponent:any;
	/*toolbar.onAdd = (map:LMap) => {
		let div = L.DomUtil.create('div');
		toolbarComponent = new MapToolbar({
			target: div,
			props: {}
		});

		toolbarComponent.$on('click-eye', ({ detail }) => eye = detail);
		toolbarComponent.$on('click-lines', ({ detail }) => lines = detail);
		//toolbarComponent.$on('click-reset', () => {
		//	map.setView(initialView, 5, { animate: true })
		//})

		return div;
	}

	toolbar.onRemove = () => {
		if(toolbarComponent) {
			toolbarComponent.$destroy();
			toolbarComponent = null;
		}
	};*/
	
	// Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
	// `createFn` will be called whenever the popup is being created, and should create and return the component.
	function bindPopup(marker:any, createFn:any) {
		let popupComponent:any;
		marker.bindPopup(() => {
			let container = L.DomUtil.create('div');
			popupComponent = createFn(container);
			return container;
		});

		marker.on('popupclose', () => {
			if(popupComponent) {
				let old = popupComponent;
				popupComponent = null;
				// Wait to destroy until after the fadeout completes.
				setTimeout(() => {
					old.$destroy();
				}, 500);

			}
		});
	}
	
	let markers = new Map();
	
	function markerIcon(content:string) {
		let html = `<div class="map-marker"><div>${markerIcons.library}</div><div class="marker-text">${content}</div></div>`;
		return L.divIcon({
			html,
			className: 'map-marker'
		});
	}

	function createLoadingIndicator(lat:number, lng:number, map:LMap){
		//let icon = markerIcon(place.uid);
		const lookingGlass:[[[number, number],[number, number], [number, number], [number, number]]] = [
			[
				[lat-0.015, lng+0.023], // btoom
				[lat-0.0063, lng+0.0087], // Left
				[lat-0.005, lng+0.0102], // TOP
				[lat-0.014, lng+0.0242] // Right
			]
		]
		if(map){

		
			const ploy = L.polygon(lookingGlass, { color: 'black'})
				//	.addTo(map)
			const circle = L.circle([lat, lng], { radius: 1000})
			//.addTo(map)

			const layerG = L.layerGroup()
			layerG.addLayer(ploy)
			layerG.addLayer(circle)
			map.addLayer(layerG)
			return layerG;
		}
		
		
	}
	

	function createMarker(place:Place) {
		console.log('createMarker')
		console.log(place)
		let icon = markerIcon(place.uid);
		let marker = L.marker([+place.lat, +place.lng], {icon});
		bindPopup(marker, (m:any) => {
			console.log('bindPopup')
			let c = new MarkerPopup({
				target: m,
				props: {
					place
				}
			});

/*			c.$on('loading', () => {
				marker.setIcon(markerIcon('LOADING'))
			})
			
			c.$on('story-load', ({detail}) => {
				// TODO: re-trigger load of this story
				marker.setIcon(markerIcon('LOADED'));
			});*/
			
			return c;
		});
		
		return marker;
	}
	
	function createLines() {
    if(!data.places){
      console.error('No Data?')
    }else{
      return L.polyline(data.places, { color: '#E4E', opacity: 0.5 });
    }
		
	}

	let markerLayers:any;
	let lineLayers:any
  function mapAction(container:any) {

    map = createMap(container); 

	

	map.on('click', async function(e){
		console.log(`\n\n\n\n\nclick\n\n\n\n\n${e.latlng.lat}`)
		var popLocation= e.latlng;

		const div = document.createElement('div')
		
		let c = new LoadingIndicator({
			target: div,
				props: {
					loadingPlace: {
						lat: e.latlng.lat,
						lng: e.latlng.lng
					}
				}
			});



		



		if(map){
			const loadingLayer = createLoadingIndicator(e.latlng.lat, e.latlng.lng, map)
			const places = await searchPlaces(popLocation).then((p) => {
				// TODO: add places to map
				console.log(p)
				console.log('REMOVE loadingLayer?.remove()')
				console.log(loadingLayer)

				//loadingLayer?.remove()
			}).catch((e) => {
				loadingLayer?.remove()
			})

			//map.fitBounds(poly.getBounds());

			//	.setLatLngs()
				//.setContent('<p>Hello world!<br />This is a nice popup.</p>')
				//.openOn(map);  
		}
	})
	//toolbar.addTo(map);


    if(!data.places){
      console.error('No Data?')
      return;
    }else{

      markerLayers = L.layerGroup()
      for(let place of data.places) {
		console.log('for(let place of data.places) {')
        let m = createMarker(place);
        markerLayers.addLayer(m);
      }
    
		
      lineLayers = createLines();
      
      markerLayers.addTo(map);
      lineLayers.addTo(map);
    }

    return {
       destroy: () => {
	//			 toolbar.remove();
				 map ? map.remove() : null
				 map = null;
			 }
    };
	}
	
	// We could do these in the toolbar's click handler but this is an example
	// of modifying the map with reactive syntax.
	$: if(markerLayers && map) {
		if(eye) {
			markerLayers.addTo(map);
		} else {
			markerLayers.remove();
		}
	}
	
	$: if(lineLayers && map) {
		if(lines) {
			lineLayers.addTo(map);
		} else {
			lineLayers.remove();
		}
	}

	function resizeMap() {
	  if(map) { map.invalidateSize(); }
  }

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
crossorigin=""/>
<svelte:window on:resize={resizeMap} />
<div class="map" style="height:900px;width:100%" use:mapAction />

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app WORKING2
	</h1>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<h1>{JSON.stringify(data)}</h1>
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
