import WikiJS from 'wikijs';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import qs from 'querystring'
import { createPlace } from '$lib/server/firebase';
import type { AnyObject } from '$lib/models/types';
import type { wikiContent } from '$lib/mapWikiPage';


interface RequestParams {
	lat:string
	lng:string
}
export interface wikiInfo {
  general: {
    buildingType?:string // 'House'
    alternateNames?:string //'First State House'
    caption?:string  // 'The first state house with its original tenants'
    completionDate?:string //Fri Jan 01 1937 12:00:00 GMT+1200 (New Zealand Daylight Time)
    coordinates?:string //'-41.32437|174.81746,title|region:NZ_type:landmark'
    embedded?:string //'designation list'
    image?:string // 'First state house in Miramar.jpg'
    landlord?:string // 'Housing New Zealand Corporation'
    location:string[] //(2) ['Miramar, New Zealand', 'Wellington']
    name:string //'12 Fife Lane'
    owner:string
    openedDate:{
      date:string // Sat Sep 18 1937 11:30:00 GMT+1130 (New Zealand Standard Time)}
    }
  }
}

export const GET: RequestHandler = async (params:any) => {
//	const decodedToken = await decodeToken(cookies.get('token') || '');
  console.log('API/SEARCH/SERVER')




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
    }).then((p) => Promise.allSettled(p.pageNames.map(async (pn) => {



      return {
        name: pn,
        result: await WikiJS().page(pn).then(async (page) => {


          const CONTENT_LENGTH = 1500
          const SUMMARY_LENGTH = 750

          const sortFirstFields = ['History','Content']
          const filterFields = ['References', 'External Links']
          const summary_string = `SUMMARY:${(await page.summary()).substring(0, SUMMARY_LENGTH)} ${(await page.content() as unknown as wikiContent[])
            .sort((a,b) => {
              if(sortFirstFields.includes(a.title)){
                return -1;
              }else if(sortFirstFields.includes(b.title)){
                return 1;
              }else{
                return 0
              }
            })
            .filter((wc) => !filterFields.includes(wc.title))
            .map((wc) => `${wc.title.toUpperCase()}:${wc.content}`)
            .join('').substring(0, CONTENT_LENGTH)}`


            const coords = await page.coordinates()

            const pageRes = {
              url: page.url(),
              wiki_id: page.raw.pageid,
             // displayName: page.
              summary: summary_string,
              info: await page.fullInfo() as wikiInfo,
              mainImage: await page.mainImage(),
              images: await page.images(),
              categories: await page.categories(),
              references: await page.references(),
              lat: coords.lat,
              lng: coords.lon,
            }
            console.log('pageRes')
            console.log(pageRes)

            createPlace({
              wikiId: page.raw.pageid.toString(),
              wikiTitle: page.raw.title,
              wikiSummary: summary_string,
              title: page.url(),
              lat: coords.lat,
              lng: coords.lon,
            }).then((res) => {
              console.log('Wiki Place Summary row created')
              console.log(res)
            }).catch((e) => {
              console.log('Wiki Place Summary row failed')
              console.error(e)
            })

            // TODO: for each result, save the summary, title and lat, lng for ai story gen 

            return pageRes;
        })
      }
    })))
    
    /*.then((p) => Promise.all(p.pageNames.map((pn) => WikiJS().page(pn).then((m) => mapWikiPage(m)))))
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
