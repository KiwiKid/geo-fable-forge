import { error } from '@sveltejs/kit';
import WikiJS from 'wikijs';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import qs from 'querystring'
import { saveDocument, savePlace } from '$lib/client/firebase';

interface RequestParams {
	lat:string
	lng:string
}

export const GET: RequestHandler = async (params:any) => {
//	const decodedToken = await decodeToken(cookies.get('token') || '');
	console.log(`$decodedToken:{decodedToken}`)



  const query = qs.decode(params.request.url.slice(params.request.url.indexOf('?')+1)) as unknown as RequestParams

  if('lat' in query && 'lng' in query){
    const wikiRes = await WikiJS().geoSearch(+query.lat, +query.lng, 1000)
    .then((res: string[]) => {
      console.log('WOAH WIKI CALL')
        if(res?.length == 0){
          return {
            pageNames: [],
            lat: query.lat,
            lng: query.lng
          };
        } else {
          console.log(`Found ${res.length} matches`)
          return {
            pageNames: res as unknown as string[],
            lat: query.lat,
            lng: query.lng
          };
        }
    }).then((pn) => ).catch((e) => {
      console.error('Wikijs error')
      console.error(e)
      console.log(query)
    })
    return json(wikiRes);
  }else{
    return json({error: 'failed to get wikijs'})
  }

	
        
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
