import App from './App.svelte';
//import { initFirebase } from './initFirebase';

//initFirebase();
//const db = firebase.firestore()
//console.log(db)



const defaultVal = {
	lat: '39.8283',
	lng: '-98.5795'
};

const app = new App({
	target: document.body,
	props: {
		places: /*await db.collection('places').limit(500).get().catch((e) => {
			console.error('Could not get places')
			console.error(e)
		}) ||*/ [defaultVal]
	}
});

export default app;