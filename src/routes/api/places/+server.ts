import { createDocument, getDocuments, decodeToken, getPlaces } from '$lib/server/firebase';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url, params }) => {
	console.log('API/DATA/SERVER')
	console.log('GET SERVER.ts')
add shared starting location
    const leftLat = url.searchParams.get('llat');
    const rightLat = url.searchParams.get('rlat');
    const topLng = url.searchParams.get('tlng');
    const bottomLng = url.searchParams.get('blng');
console.log(`${leftLat}${rightLat}${topLng}${bottomLng}`)
    // validate the parameters
    if (!leftLat || !rightLat || !topLng || !bottomLng) {
		
        throw error(400, 'Missing param collectionPath');
      /*  return {
            status: 400,
            body: {
                error: 'Missing lat or lng query parameter'
            }
        };*/
    }
	//const decodedToken = await decodeToken(cookies.get('token') || '');
	//if (!decodedToken && !url.search.startsWith('?collectionPath=place')) {
//
	//	throw error(401, 'Not logged in');
	//}
	//const uid = decodedToken.uid;

	/*const collectionPath = url.searchParams.get('collectionPath');
	if (!collectionPath) {
		throw error(400, 'Missing param collectionPath');
	}*/

	const docs = await getPlaces(+leftLat, +rightLat, +topLng, +bottomLng);
/*	if (!docs.length) {
		const doc = await createDocument(collectionPath);
		docs.push(doc);
	}*/

	return new Response(JSON.stringify(docs));
};
