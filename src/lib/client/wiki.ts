import type { Place } from "$lib/models/Place";

interface SearchPlacesRequest {
    fetch:any;
    lat: number;
    lng: number;
  }

  interface SearchPlacesResponse {
    pageNames: string[];
    lat: number;
    lng: number;
  }



export async function wikiSearchPlaces(request: SearchPlacesRequest): Promise<SearchPlacesResponse> {
      const response = await request.fetch(`/api/wiki-search?lat=${request.lat}&lng=${request.lng}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if(!response){
        throw new Error("No wiki response")
      }
  
      return response.json() as unknown as SearchPlacesResponse;
  }

  interface PlacePopulateRequest {
    fetch:any
    wikiId:string
  }
  interface PopulatePlaceResponse {
    place:Place
  }

export async function populateStory(request: PlacePopulateRequest):Promise<PopulatePlaceResponse>{
  console.log('populateStory')
  const response = await request.fetch(`/api/populate?wikiId=${request.wikiId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if(!response){
    throw new Error("No wiki response")
  }

  return response.json() as unknown as PopulatePlaceResponse;
}
