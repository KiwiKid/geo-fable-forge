interface SearchPlacesRequest {
    fetch:any;
    llat:number;
    rlat:number
    tlng:number
    blng:number
  }

  interface SearchPlacesResponse {
    pageNames: string[];
    lat: number;
    lng: number;
  }



export async function searchPlaces(request: SearchPlacesRequest): Promise<SearchPlacesResponse> {
    try {
      const response = await request.fetch(`/api/search?rlat=${request.rlat}&llat=${request.llat}&tlng=${request.tlng}&blng=${request.blng}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if(!response){
        throw new Error("No wiki response")
      }
  
      return response.json() as unknown as SearchPlacesResponse;
    } catch (error) {
      // Handle error appropriately
      
      throw new Error('Failed to searchPlaces.');
    }
  }
