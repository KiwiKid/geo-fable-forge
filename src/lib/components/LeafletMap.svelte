<script lang="ts">
	//export const prerender = false;
	//export const ssr = false;
	
	console.log('import * as L from ')
	//import * as L from 'leaflet'
	console.log('import * as L from  AFTER')
	import MarkerPopup from './MarkerPopup.svelte';
	import * as markerIcons from './markers.js';
	import LoadingIndicator from './LoadingIndicator.svelte';
	import { searchPlaces } from '$lib/client/wiki';
	import type { PageData } from '../../routes/$types';
	import { onMount } from 'svelte';
	import type * as leafletType from 'leaflet';
	import Page from '../../routes/+page.svelte';
	export let data: PageData;

	//
	let L: typeof leafletType | undefined;

	onMount(async() => {
		L = ((await import('leaflet')).default)
		console.log('leaflet-loaded')
		const map = createMap();
		mapAction(map);
	})
	console.log('map import')
    let map: L.Map | null;
    
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
		
		
		//let markers = new Map();
		

				
		// We could do these in the toolbar's click handler but this is an example
		// of modifying the map with reactive syntax.
		/*$: if(markerLayers && map) {
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
		}*/

	function bindPopup(marker:any, createFn:any) {
			let popupComponent:any;
			marker.bindPopup(() => {
				let container = L ? L.DomUtil.create('div') : null;
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


	function markerIcon(content:string) {
		let html = `<div class="map-marker"><div>${markerIcons.library}</div><div class="marker-text">${content}</div></div>`;
		return L!.divIcon({
			html,
			className: 'map-marker'
		})
	}
	function createMarker(place:any) {
			console.log('createMarker')
			console.log(place)
			let icon = markerIcon(place.uid);
			let marker = L!.marker([+place.lat, +place.lng], {icon})
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
	function resizeMap() {
        if(map) { map.invalidateSize(); }
    }


	function createMap() {
		console.log('createMap')
		if(!L){
			throw new Error('\n\ncreateMap no LEAFLET\n\n')
		}
        const initialView:[number, number] = [39.8283, -98.5795];

		const container = document.getElementById('mapContainer')
		if(!container){
			throw new Error("No map container?")
		}

		let m = L.map(container, {preferCanvas: true }).setView(initialView, 5);

		L!.tileLayer(
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


	function createLoadingIndicator(lat:number, lng:number, map:L.Map){
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

			
				const ploy = L!.polygon(lookingGlass, { color: 'black'})
					//	.addTo(map)
				const circle = L!.circle([lat, lng], { radius: 1000})
				//.addTo(map)

				const layerG = L!.layerGroup()
				layerG.addLayer(ploy)
				layerG.addLayer(circle)
				map.addLayer(layerG)
				return layerG;
			}
			
			
		}

	function mapAction(map:leafletType.Map):SvelteActionReturnType {

		console.log('bower')
		//map = createMap(); 
		map.on('click', async function(e){
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
				const places = searchPlaces(popLocation).then((p) => {
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
		}else{

		let markerLayers = L!.layerGroup()
		for(let place of data.places) {
			console.log('for(let place of data.places) {')
			let m = createMarker(place);
			markerLayers.addLayer(m);
		}
				
		markerLayers.addTo(map);
		}

		return {
			destroy: () => {
	//			 toolbar.remove();
				map ? map.remove() : null
			}
		};
	}
</script>
<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
	integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
	crossorigin=""/> 
</svelte:head>

<div id="mapContainer" style="height:900px;width:100%" />