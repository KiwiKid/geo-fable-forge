import type { Place } from "$lib/models/Place";

interface SearchPlacesRequest {
    fetch:any;
    llat:number;
    rlat:number
    tlng:number
    blng:number
    zoom:number;
  }

  interface SearchPlacesResponse {
    places:Place[]
  }

export async function getPlace(request:any, wikiId:string){
  console.log('getPlace client')
    try {
      const response = await request.fetch(`/api/place?wikiId=${wikiId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch((e:any) =>{
        console.error('Search place failed', {e})
      })

      if(!response){
        throw new Error("No searchPlace response")
      }
  
      const res = await response.json()

      console.log(`SEARCH PLACES client ${res.length}`)

      return {
        place: res
      }
    } catch (error) {
      // Handle error appropriately
      
      throw new Error('Failed to searchPlaces.');
    }
}

export async function searchPlaces(request: SearchPlacesRequest): Promise<SearchPlacesResponse> {
  console.log('SEARCH PLACES client')
    try {
      const response = await request.fetch(`/api/places?rlat=${request.rlat}&llat=${request.llat}&tlng=${request.tlng}&blng=${request.blng}&zoom=${request.zoom}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch((e:any) =>{
        console.error('Search places failed', {e})
      })

      if(!response){
        throw new Error("No searchPlaces response")
      }
  
      const res = await response.json()

      console.log(`SEARCH PLACES client ${res.length}`)

      return {
        places: res
      }
    } catch (error) {
      // Handle error appropriately
      
      throw new Error('Failed to searchPlaces.');
    }
  }
