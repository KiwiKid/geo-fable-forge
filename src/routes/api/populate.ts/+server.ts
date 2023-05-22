import { getPlace } from "$lib/server/firebase";
import type { RequestHandler } from "./$types";
import qs from 'querystring'

interface RequestParams {
	wikiId:string
}

export const PUT:RequestHandler = async ({request}) => {
    console.log('API/POPULATE/SERVER')
    const query = qs.decode(request.url.slice(request.url.indexOf('?')+1)) as unknown as RequestParams;


    const place = await getPlace(query.wikiId)

    return new Response(JSON.stringify(place))
}