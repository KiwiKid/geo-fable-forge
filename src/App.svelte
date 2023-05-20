<script context="module">
  import firebase from "firebase/app";


  export async function load({ page, fetch, session, context}){
  console.log('Both');
  console.log(`${page}, fetch, session, context}`)
  initFirebase();
  const db = firebase.firestore()
  const places = await db.collection('places').limit(500)
    
  }
</script>


<script>
  import { FirebaseApp, User, Doc, Collection } from "sveltefire";



  import L from 'leaflet';
	import MapToolbar from './MapToolbar.svelte';
	import MarkerPopup from './MarkerPopup.svelte';
	import * as markerIcons from './markers.js';
  import { initFirebase } from "./initFirebase";
	let map;
	
	const markerLocations = [
		[29.8283, -96.5795],
		[37.8283, -90.5795],
		[43.8283, -102.5795],
		[48.40, -122.5795],
		[43.60, -79.5795],
		[36.8283, -100.5795],
		[38.40, -122.5795],
	];
	
	const initialView = [39.8283, -98.5795];
	function createMap(container) {
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
	
	let toolbar = L.control({ position: 'topright' });
	let toolbarComponent;
	toolbar.onAdd = (map) => {
		let div = L.DomUtil.create('div');
		toolbarComponent = new MapToolbar({
			target: div,
			props: {}
		});

		toolbarComponent.$on('click-eye', ({ detail }) => eye = detail);
		toolbarComponent.$on('click-lines', ({ detail }) => lines = detail);
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
	
	// Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
	// `createFn` will be called whenever the popup is being created, and should create and return the component.
	function bindPopup(marker, createFn) {
		let popupComponent;
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
	
	function markerIcon(count) {
		let html = `<div class="map-marker"><div>${markerIcons.library}</div><div class="marker-text">${count}</div></div>`;
		return L.divIcon({
			html,
			className: 'map-marker'
		});
	}
	

	function createMarker(loc) {
		let count = Math.ceil(Math.random() * 25);
		let icon = markerIcon(count);
		let marker = L.marker(loc, {icon});
		bindPopup(marker, (m) => {
			let c = new MarkerPopup({
				target: m,
				props: {
					count
				}
			});
			
			c.$on('change', ({detail}) => {
				count = detail;
				marker.setIcon(markerIcon(count));
			});
			
			return c;
		});
		
		return marker;
	}
	
	function createLines() {
		return L.polyline(markerLocations, { color: '#E4E', opacity: 0.5 });
	}

	let markerLayers;
	let lineLayers;
  function mapAction(container) {
    map = createMap(container); 
		toolbar.addTo(map);
		
		markerLayers = L.layerGroup()
 		for(let location of markerLocations) {
 			let m = createMarker(location);
			markerLayers.addLayer(m);
 		}
		
		lineLayers = createLines();
		
		markerLayers.addTo(map);
		lineLayers.addTo(map);
		
    return {
       destroy: () => {
				 toolbar.remove();
				 map.remove();
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

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
crossorigin=""/>
<svelte:window on:resize={resizeMap} />
<main>

  <div class="map" style="height:900px;width:100%" use:mapAction />

  <!-- 1. 🔥 Firebase App -->
  <FirebaseApp {firebase}>

    <h1>💪🔥 Mode Activated</h1>

    <p>
      <strong>Tip:</strong>
      Open the browser console for development logging. Woah
    </p>

    <Collection path={`places`} let:data={places} let:ref={placesRef} log>
      <div>{places.title}</div>
    
    </Collection>


    <!-- 2. 😀 Get the current user -->
    <User let:user let:auth>
      Howdy 😀! User
      <em>{user.uid}</em>

      <button on:click={() => auth.signOut()}>Sign Out</button>

      <div slot="signed-out">

        <button on:click={() => auth.signInAnonymously()}>
          Sign In Anonymously
        </button>
      </div>

      <hr />

      <!-- 3. 📜 Get a Firestore document owned by a user -->
      <Doc path={`myplaces/${user.uid}`} let:data={myPlaces} let:ref={myPlacesRef} log>

        <h2>{myPlaces.title}</h2>

        <p>
          Document
          created at <em>{new Date(myPlaces.createdAt).toLocaleString()}</em>
        </p>
        <button
        on:click={() => myPlacesRef.set({
            title: '📜 I like Svelte',
            createdAt: Date.now()
          })}>
        My new my Place
      </button>
        <span slot="loading">Loading post...</span>
        <span slot="fallback">
          <button
            on:click={() => myPlacesRef.set({
                title: '📜 I like Svelte',
                createdAt: Date.now()
              })}>
            My new my Place
          </button>
        </span>

        <!-- 4. 💬 Get all the comments in its subcollection -->

        <h3>Comments</h3>
        <!---<Collection
          path={myPlacesRef.Doc('votes')}
          query={ref => ref.orderBy('upvoteCount')}
          let:data={votes}
          let:ref={votesRef}
          log>


          {#if 'upvoteCount' in votes}
            <div>{votes.upvote}</div>
          {/if}
          {JSON.stringify(votes)}
            <p>
               ID: <em>{comment.ref.id}</em> 
            </p>


          <button
            on:click={() => votesRef.set({
                upvote: (votes.upvote || 0) + 1,
                //createdAt: Date.now()
              })}>
           Upvote
          </button>

          <button
            on:click={() => votesRef.set({
                downvote: (votes.downvote || 0) -1,
                //createdAt: Date.now()
              })}>
           downvote
          </button>

          <span slot="loading">Loading votes...</span>

        </Collection>-->

      </Doc>
    </User>
  </FirebaseApp>

</main>


<!-- Styles -->
<style>
  main {
    text-align: center;
    margin: 0;
    padding: 0;
  }

  h1,
  em {
    color: #ff3e00;
  }

  hr {
    height: 1px;
    border: none;
    background: rgb(195, 195, 195);
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>