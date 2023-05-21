import { error } from '@sveltejs/kit';
import WikiJS from 'wikijs';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import qs from 'querystring'
import { createDocument } from '$lib/server/firebase';
import mapWikiPage, { type MappedPage } from '$lib/mapWikiPage';
import { savePlace } from '$lib/client/firebase';

interface RequestParams {
	lat:string
	lng:string
}

export const POST: RequestHandler = async (params:any) => {
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
            lat: params.request.lat,
            lng: params.request.lng
          };
        } else {
          console.log(`Found ${res.length} matches`)
         // createDocument('places', )
          return {
            pageNames: res as unknown as string[],
            lat: params.request.lat,
            lng: params.request.lng
          };
        }
    }).then((p) => Promise.all(p.pageNames.map((pn) => WikiJS().page(pn))))
      .then((page) => page.map(mapWikiPage))
      .then(async (fps:Promise<MappedPage>[]) => {
        const saves = await Promise.all( fps.map((fp) => {
          const res = await fp;
          
          savePlace({
            _collection: 'place',
            lat: res.lat,
            lng: res.lng,
            wikiId: res.wiki_id,
            title: res.summary,

        })))
        
        console.error('Wikijs error')
        console.error(e)
        console.log(params)
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
