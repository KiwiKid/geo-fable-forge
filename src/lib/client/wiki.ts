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



export async function searchPlaces(request: SearchPlacesRequest): Promise<SearchPlacesResponse> {
    try {
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
    } catch (error) {
      // Handle error appropriately
      
      throw new Error('Failed to searchPlaces.');
    }
  }
