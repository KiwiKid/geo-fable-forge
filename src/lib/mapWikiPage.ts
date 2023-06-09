import type { Page } from "wikijs";


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

export interface wikiContent {
  title:string
  content:string
}

// These together will be total summary_info prompt length
const CONTENT_LENGTH = 1500
const SUMMARY_LENGTH = 750

export interface MappedPage {
  id:string
  wiki_id:string 
  url:string
  summary:string
  info:wikiInfo
  mainImage:string
  images:string[]
  categories:string[]
  references:string[]
  lat:number
  lng:number
}


const mapWikiPage = async (page:Page):Promise<MappedPage> => {
  const coords = await page.coordinates()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const urlParts:string[] = page.url().split('/')
  const id = urlParts[urlParts.length - 1];
  if(!id){
    throw new Error('could not get id from wiki url')
  }

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


    // TODO: parse page.info here

    const pageRes = {
      url: page.url(),
      id: id,
      wiki_id: page.raw.pageid.toString(),
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


    return pageRes;
}

export default mapWikiPage