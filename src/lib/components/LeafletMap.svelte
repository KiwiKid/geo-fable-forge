<script lang="ts">
	export const prerender = false;
	export const ssr = false;
	
	console.log('import * as L from ')
	//import * as L from 'leaflet'
	console.log('import * as L from  AFTER')
	import MarkerPopup from './MarkerPopup.svelte';
	import * as markerIcons from './markers.js';
	import LoadingIndicator from './LoadingIndicator.svelte';
	import type { PageData } from '../../routes/$types';
	import { onMount, setContext } from 'svelte';
	import type * as leafletTypes from 'leaflet';
	import Page from '../../routes/+page.svelte';
	import MapToolbar from './MapToolbar.svelte';
	import type { Place } from '$lib/models/Place';
	import { getPlace, searchPlaces } from '$lib/client/search';
	import { wikiSearchPlaces } from '$lib/client/wiki';
	import { debounce } from './debouce';
	import { Timer } from './timer';
	import { updateProfile } from 'firebase/auth';
	export let data: PageData;

	let popupCount = 0;
	let loadingCount = 0;
	let loadedStory = ''
	let loadedTitle = ''
	let pageMode:'newLocationSearch'|'exploreExisting' = data.places.length > 0 ? 'exploreExisting' : 'newLocationSearch'

	export async function getMapPlaces({fetch, map}:{ fetch:any, map:leafletTypes.Map}){
		const bounds = map?.getBounds();
		const zoom = map?.getZoom();


		if(bounds && zoom){

			const topLeft = bounds.getNorthWest()
			const bottomRight = bounds.getSouthEast()
			//const places =  await searchPlaces({fetch, llat: +topLeft.lat, rlat:+bottomRight.lat, tlng: +topLeft.lat, blng: +bottomRight.lng});
			searchPlaces({fetch, llat: +topLeft.lat, rlat:+bottomRight.lat, tlng: +topLeft.lat, blng: +bottomRight.lng, zoom: zoom })
				.then((newPlaces) => {
					let uniqueNewPlaces = newPlaces.places.filter(
							(newPlace:Place) => !data.places.some((existingPlace:Place) => existingPlace.wikiId === newPlace.wikiId)
						);
					data.places = data.places.concat(uniqueNewPlaces);
				})
		}else{
			console.log('searchPlaces no bounds')
		}
	}
		
		// TODO: move to getPlace API with lat/lng lookup
		/*const res = await fetch(`/api/data?collectionPath=place&createIfNone=true`);
		if (res.ok) {
			const places = await res.json();
			return places;
		}

		const { message } = await res.json();
		throw Error(message);*/
	

	//
	let L: typeof leafletTypes | undefined;
	const initialView:[number, number] = [39.8283, -98.5795];
	
	onMount(async() => {
		// TODO: consider moving to:

//			setContext(key, {
//				getMap: () => map,
//			});
		L = ((await import('leaflet')).default)
		console.log('leaflet-loaded')
		const map = createMap();
		mapAction(map);
	})

	console.log('map import')
    let map: L.Map | null;
    
		let eye = true;
		let lines = true;


	function addToolbar(map:L.Map){
		if(L === undefined){
			throw new Error("L is undefined 1")
		}
		let toolbar = new L.Control({ position: 'topright' });
		let toolbarComponent:any;
		toolbar.onAdd = (map:L.Map) => {
			if(L === undefined){
				throw new Error("L is undefined 2")
			}
			let div = L.DomUtil.create('div');
			toolbarComponent = new MapToolbar({
				target: div,
				props: {}
			});
			// pageMode
			toolbarComponent.$on('click-eye', ({ detail }: { detail: boolean }) => eye = detail);
			toolbarComponent.$on('click-eye', ({ detail }: { detail: boolean }) => eye = detail);

			toolbarComponent.$on('click-lines', ({ detail }: { detail: boolean }) => {
				lines = detail
				pageMode = pageMode === 'exploreExisting' ? 'newLocationSearch' : 'exploreExisting'
			});
			toolbarComponent.$on('click-reset', () => {
				map.setView(initialView, 5, { animate: true })
			})

			return div;
		}

		toolbar.onRemove = () => {
			if(toolbarComponent) {
				toolbarComponent.$destroy();
				toolbarComponent = null;
			}
		};
		toolbar.addTo(map)
	}
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


	function markerIcon(content:string, isPopulated:boolean, isLoading:boolean) {
		const icon = isLoading ? markerIcons.sparkles : isPopulated ? markerIcons.envelopeOpen : markerIcons.envelope;
		let html = `<div class="map-marker"><div>${icon}</div>
					<div class="marker-text">${content}</div></div>`;
		return L!.divIcon({
			html,
			className: 'map-marker'
		})
	}

	
	function createMarker(place:any) {
			let icon = markerIcon(place.wikiTitle, !!place.content, false);
			let marker = L!.marker([+place.lat, +place.lng], {icon})
			marker.on('popupopen', () =>{
				popupCount++;
			})

			marker.on('popupclose', () => {
				popupCount--;
			})
			bindPopup(marker, (m:any) => {
				console.log('bindPopup')
				let c = new MarkerPopup({
					target: m,
					props: {
						place
					}
				});

				const loadingTimer = new Timer();



				c.$on('loading', () => {
					console.log('loading EVENT SUBSRIBER FIERED')
					loadingTimer.methodToCallEverySecond = (timePassed) => {
						marker.setIcon(markerIcon(`${timePassed}s`, false, true))
						marker.setPopupContent(`Loading story (${timePassed}s so far)`)
					}
					loadingTimer.start()
					
				})
				
				c.$on('story-load', async ({detail}) => {
					console.log('story-load EVENT SUBSRIBER FIERED'+JSON.stringify(detail))
					// TODO: re-trigger load of this story
					marker.setIcon(markerIcon('LOADED', true, false));
					marker.openPopup();
					
					const updatedPlace = await getPlace(fetch, place.wikiId)

					console.log(updatedPlace)
					
					loadedTitle = detail.story.placeSave.title;
					loadedStory = detail.story.placeSave.content;
					loadingTimer.stop();
				});
				
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

		const container = document.getElementById('mapContainer')
		if(!container){
			throw new Error("No map container?")
		}
		const savedLocation:[number, number]|null = data.userSession && data.userSession.lastLocation ? [data.userSession.lastLocation.lng, data.userSession.lastLocation.lat] : null;
		let m = L.map(container, {preferCanvas: true, maxZoom: 17 });
		
		const STARTER_LOCATION:[number, number] = [-43.5320, 172.6306];
		const STARTER_ZOOM = 15;
		if(savedLocation){
			m.setView(savedLocation);
		}else{
			m.setView(STARTER_LOCATION, STARTER_ZOOM)
		}

		L!.tileLayer(
				'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
				{
				attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
					&copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
				subdomains: 'abcd',
				maxZoom: 17,
				}
		).addTo(m);

		return m;
	}


	function createLoadingIndicator(lat:number, lng:number, map:L.Map){
			loadingCount++
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


		function setUrl(map:leafletTypes.Map){
			const params = new URLSearchParams();
			const bounds = map?.getBounds();
			const center = map?.getCenter();
			const zoom = map?.getZoom();
			console.log('move  setUrl'+JSON.stringify(bounds))

			console.log(bounds)

				if(bounds){
					console.log('move end setUrl')
					console.log()


				const topLeft = bounds.getNorthWest()
				const bottomRight = bounds.getSouthEast()

					params.set('rlat', bottomRight.lat.toFixed(5).toString());
					params.set('llat', topLeft.lat.toFixed(5).toString());
					params.set('tlng', topLeft.lng.toFixed(5).toString());
					params.set('blng', bottomRight.lng.toFixed(5).toString());


					/*if(data.userSession){
						data.userSession.lastLocation = {
							lat: center.lat,
							lng: center.lng,
							zoom: zoom
						}
					}*/

					

					const url = new URL(window.location.href);
					url.search = params.toString();
					console.log(url)
					window.history.replaceState({}, '', url);
				}
		}

	function mapAction(map:L.Map):SvelteActionReturnType {

		map.on('moveend', debounce(() => {
			console.log('move end')
			setUrl(map)
			// TODONEXT: make this append new places to page data and only search if a unsearch lat range is found 
			getMapPlaces({fetch, map})
		}, 3000))
		//map = createMap(); 
		map.on('click', async function(e){
			if(pageMode !== 'newLocationSearch') return;
			var popLocation = e.latlng;

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
				await wikiSearchPlaces({
					fetch: fetch,
					lat: popLocation.lat,
					lng: popLocation.lng
				}).then((p) => {
				
					getMapPlaces({fetch, map}).then((p) => {
						if(loadingLayer){
							loadingLayer.remove()
						}
					})
					
					

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
		addToolbar(map)


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
<h1>{loadingCount} --- {pageMode}</h1>
<div id="mapContainer" style="height:900px;width:100%" />