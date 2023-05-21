import { createDocument, getDocuments, decodeToken } from '$lib/server/firebase';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import WikiJS from 'wikijs';

interface Params {
	lat:string
	lng:string
}

export const GET: RequestHandler = async ({ cookies,  }) => {
	const decodedToken = await decodeToken(cookies.get('token') || '');
	console.log(`$decodedToken:{decodedToken}`)
	return await WikiJS().geoSearch(params.lat, params.lng, 1000)
          .then((res: string[]) => {
              if(res?.length == 0){
                return {
                  pageNames: [],
                  lat: params.lat,
                  lng: params.lng
                };
              } else {
                console.log(`Found ${res.length} matches`)
                return {
                  pageNames: res as unknown as string[],
                  lat: params.lat,
                  lng: params.lng
                };
              }
          })
        
	//const uid = decodedToken.uid;

//const collectionPath = url.searchParams.get('collectionPath');
//if (!collectionPath) {
//	throw error(400, 'Missing param collectionPath');
//}
//
//const docs = await getDocuments(collectionPath);
/*	if (!docs.length) {
		const doc = await createDocument(collectionPath);
		docs.push(doc);
	}*/
	//return new Response(JSON.stringify(docs));
};
