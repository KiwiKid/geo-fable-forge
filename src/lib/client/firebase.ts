import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {
	collection,
	getFirestore,
	query,
	where,
	addDoc,
	doc,
	onSnapshot,
	setDoc,
	deleteDoc
} from 'firebase/firestore';
import {
	getAuth,
	signInAnonymously,
	signInWithRedirect,
	signOut as _signOut,
	GoogleAuthProvider,
	onIdTokenChanged,
	EmailAuthProvider
} from 'firebase/auth';
import type { Document } from '$lib/models/Document';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { AnyObject } from '$lib/models/types';
import { invalidateAll } from '$app/navigation';
import type { Place } from '$lib/models/Place';

async function setToken(token: string) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ token })
	};

	await fetch('/api/token', options);
}

function listenForAuthChanges() {
	const auth = getAuth(app);

	onIdTokenChanged(
		auth,
		async (user) => {
			if (user) {
				const token = await user.getIdToken();
				await setToken(token);
			} else {
				await setToken('');
			}
			await invalidateAll();
		},
		(err) => console.error(err.message)
	);
}

export let app: FirebaseApp;
export let db: Firestore;
export function initializeFirebase(options: FirebaseOptions) {
	if (!browser) {
		throw new Error("Can't use the Firebase client on the server.");
	}
	if (!app) {
		app = initializeApp(options);
		db = getFirestore(app);
		listenForAuthChanges();
	}
}

function getDbObject(document: Document): Partial<Document> {
	const obj: AnyObject = {};
	Object.keys(document)
		.filter((k) => document._dbFields.includes(k))
		.forEach((k) => {
			obj[k] = document[k as keyof Document];
		});
	return obj;
}
interface SavePlaceStoryProps {
	wikiId:string
	, title:string
	, content:string
}

export async function savePlace(place:Place){
	const dbObject = getDbObject(place);

	if (place._id) {
		await setDoc(doc(db, 'place', place._id), dbObject);
	} else {
		const todoRef = await addDoc(collection(db, place._collection), dbObject);
		place._id = todoRef.id;
	}
}


export async function saveDocument(document: Document) {
	const dbObject = getDbObject(document);
	if (!document._collection) throw Error('Objects that extends Document must specify __collection');

	if (document._id) {
		await setDoc(doc(db, document._collection, document._id), dbObject);
	} else {
		const todoRef = await addDoc(collection(db, document._collection), dbObject);
		document._id = todoRef.id;
	}
}

export function getDocumentStore<T extends Document>(
	type: { new (data: AnyObject): T },
	document: T,
	onDeleted: () => void = () => undefined
) {
	return readable<T>(document, (set) => {
		let dbUnsubscribe: () => void;
		let unsubbed = false;
		const unsub = () => {
			unsubbed = true;
			if (dbUnsubscribe) {
				dbUnsubscribe();
			}
		};
		if (browser) {
			(async () => {
				if (unsubbed) return;
				dbUnsubscribe = onSnapshot(doc(db, document._collection, document._id), (doc) => {
					if (doc.exists()) {
						const newDoc = new type(doc.data());
						newDoc._id = doc.id;
						set(newDoc);
					} else {
						onDeleted();
						dbUnsubscribe();
					}
				});
			})();
		}

		return unsub;
	});
}

function providerFor(name: string) {
	switch (name) {
		case 'google':
			return new GoogleAuthProvider();
		case 'email':
			return new EmailAuthProvider();
		case 'anon':
			return new EmailAuthProvider()
		default:
			throw 'unknown provider ' + name;
	}
}

export async function anonSignIn(){
	const auth = getAuth(app);
	
	return signInAnonymously(auth).catch((e) =>{
		console.error('signInAnonymously failed', e)
	})
}

export async function signInWith(name: string) {
	const auth = getAuth(app);
	const provider = providerFor(name);
	await signInWithRedirect(auth, provider);
}

export async function signOut() {
	const auth = getAuth(app);
	await _signOut(auth);
}

export async function deleteDocument(document: Document) {
	if (!document._collection) throw Error('Objects that extends Document must specify __collection');

	await deleteDoc(doc(db, document._collection, document._id));
}

export function getCollectionStore<T extends Document>(
	type: { new (data: AnyObject): T },
	collectionPath: string,
	uid: string,
	initialData: Array<T> = []
) {
	return readable<Array<T>>(initialData, (set) => {
		let dbUnsubscribe: () => void;
		let unsubbed = false;
		const unsub = () => {
			unsubbed = true;
			if (dbUnsubscribe) {
				dbUnsubscribe();
			}
		};
		if (browser) {
			(async () => {
				if (unsubbed) return;
				const q = query(collection(db, collectionPath), where('uid', '==', uid));
				dbUnsubscribe = onSnapshot(q, (docs) => {
					const newDocuments: Array<T> = [];
					docs.forEach((doc) => {
						const newDoc = new type(doc.data());
						newDoc._id = doc.id;
						newDocuments.push(newDoc);
					});
					set(newDocuments);
				});
			})();
		}

		return unsub;
	});
}
