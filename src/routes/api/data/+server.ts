import { createDocument, getDocuments, decodeToken } from '$lib/server/firebase';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	console.log('GET SERVER.ts')
	const decodedToken = await decodeToken(cookies.get('token') || '');
	if (!decodedToken && !url.search.startsWith('?collectionPath=place')) {

		throw error(401, 'Not logged in');
	}
	//const uid = decodedToken.uid;

	const collectionPath = url.searchParams.get('collectionPath');
	if (!collectionPath) {
		throw error(400, 'Missing param collectionPath');
	}

	const docs = await getDocuments(collectionPath);
/*	if (!docs.length) {
		const doc = await createDocument(collectionPath);
		docs.push(doc);
	}*/

	return new Response(JSON.stringify(docs));
};
