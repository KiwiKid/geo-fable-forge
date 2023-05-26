interface SearchPlacesRequest {
    fetch:any;
    llat:number;
    rlat:number
    tlng:number
    blng:number
    zoom:number;
  }

  interface SearchPlacesResponse {
    pageNames: string[];
    lat: number;
    lng: number;
  }



export async function searchPlaces(request: SearchPlacesRequest): Promise<SearchPlacesResponse> {
  console.log('SEARCH PLACES ')
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

      return res;
    } catch (error) {
      // Handle error appropriately
      
      throw new Error('Failed to searchPlaces.');
    }
  }
