import { FIREBASE_SERVER_CONFIG } from '$env/static/private';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import admin from 'firebase-admin';
import type { Document } from '$lib/models/Document';
import type { Place as PlaceDoc } from '$lib/models/Place';
import type { Place } from '$lib/models/types'

function initializeFirebase() {
	if (!admin.apps.length) {
		const serviceAccount = JSON.parse(FIREBASE_SERVER_CONFIG);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
		});
	}
}

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
	if (!token || token === 'null' || token === 'undefined') return null;
	try {
		initializeFirebase();
		return await admin.auth().verifyIdToken(token);
	} catch (err) {
		return null;
	}
}

export async function getDocuments(collectionPath: string): Promise<Array<Document>> {
	initializeFirebase();
	const db = admin.firestore();
	const querySnapshot = await db.collection(collectionPath).get();
	const list: Array<Document> = [];
	querySnapshot.forEach((doc) => {
		const document: Document = <Document>doc.data(); // Just need the data on the server
		document._id = doc.id;
		list.push(document);
	});

	return list;
}

export async function createDocument(collectionPath: string, uid: string): Promise<Document> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	const document = <Document>doc.data(); // Just need the data on the server
	document._id = doc.id;
	return document;
}




export async function getPlace(wikiId:string): Promise<Place> {
	initializeFirebase();
	const db = admin.firestore();
	const querySnapshot = await db.collection('place').where("wikiId", "==", wikiId).get();

	const places: Place[] = querySnapshot.docs.map((doc) => {
		const data = doc.data();
		const place: Place = {
		  // Map the document data to the Place interface
		  title: data.title,
		  content: data.content,
		  lat: data.lat,
		  lng: data.lng,
		  wikiId: data.wikiId,
		  wikiTitle: data.wikiTitle,
		  wikiSummary: data.wikiSummary,
		  placeType: data.placeType
		};
		return place;
	  });
	
	return places[0];
}


export async function createPlace(place: Place): Promise<PlaceDoc> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection('place').add(place)).get();

	const document = <PlaceDoc>doc.data(); // Just need the data on the server
	document._id = doc.id;
	return document;
}

interface SavePlaceStoryProps {
	wikiId:string
	, title:string
	, content:string
}

export async function savePlaceStory({wikiId, title, content}:SavePlaceStoryProps):Promise<void>{
	initializeFirebase();
	const db = admin.firestore();
	const query = await db.collection('place').where("wikiId", "==", wikiId).get();


	if (!query.empty) {
		// Assuming we are only interested in the first matching document
		const doc = query.docs[0];
		const newDoc = {
			...doc.data(),
			title,
			content,
		}
    
		// Get the document's id and update
		await db.collection('place').doc(doc.id).update(newDoc);
	} else {
		throw new Error("Nah")
	}
	// Update firebase with newDoc
	
}

// Were not using this until the map gets slow
export async function getPlaces(leftLat: number, rightLat: number, topLng: number, bottomLng: number): Promise<Array<Place>> {
	initializeFirebase();
	const db = admin.firestore();
	const placeRef = db.collection('place');

	console.log(`[getPlaces] lLat:${leftLat} rLat:${rightLat} topLng:${topLng} bottomLng:${bottomLng}`)
	// TODO: add top/bottom filtering here
	const snapshot = await placeRef
				.where('lat', '<=', leftLat)
				.where('lat', '>=', rightLat)
				.get();

	let places: Place[] = snapshot.docs.map((doc) => {
		const data = doc.data();
		const place: Place = {
		  // Map the document data to the Place interface
		  lat: data.lat,
		  lng: data.lng,
		  wikiId: data.wikiId,
		  wikiTitle: data.wikiTitle,
		  wikiSummary: data.wikiSummary,
		  title: data.title,
		  content: data.content,
		  placeType: data.placeType,
		};
		return place;
	  });

	  console.log(`GOT ${places.length} PLACES lat>=${leftLat} lat <=${rightLat}`)

	places = places.filter(place => place.lng >= bottomLng && place.lng <= topLng);

	return places;
}
