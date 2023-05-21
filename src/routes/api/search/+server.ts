import WikiJS from 'wikijs';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import qs from 'querystring'


interface RequestParams {
	lat:string
	lng:string
}

export const GET: RequestHandler = async (params:any) => {
//	const decodedToken = await decodeToken(cookies.get('token') || '');
	console.log(`$decodedToken:{decodedToken}`)



  const query = qs.decode(params.request.url.slice(params.request.url.indexOf('?')+1)) as unknown as RequestParams

  if('lat' in query && 'lng' in query){
    return await WikiJS().geoSearch(+query.lat, +query.lng, 1000)
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
         // createDocument('places', )
          return {
            pageNames: res as unknown as string[],
            lat: query.lat,
            lng: query.lng
          };
        }
    })/*.then((p) => Promise.all(p.pageNames.map((pn) => WikiJS().page(pn).then((m) => mapWikiPage(m)))))
      .then(async (fps:MappedPage[]) => {
        const saves = await Promise.all(fps.map(async (fp) => {
          const res = fp;
          
          return savePlace(new Place({
            lat: res.lat,
         //  _collection: 'place',
         //  uid: 'woah',
         //  _id: res.wiki_id,
         //  _load: () => {
         //    console.log('LOADED')
         //  }
            lng: res.lng,
            wikiId: res.wiki_id,
            title: res.summary,

        })).then(() => {
          console.log('place saved')
        }).catch((e) => {
          console.log('place save error ')
          console.error(e)
        })
      }))
      return json(saves);
    })*/
    .then((res) => {
      return json({res})
    })
    .catch((e) => {
      return json({error: 'failed to save place '+e.stack})
    })
    
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
};
