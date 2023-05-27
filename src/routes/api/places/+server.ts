import { getPlaces } from '$lib/server/firebase';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { searchSchema } from '$lib/models/Place';
import { parse } from 'querystring';



export const GET: RequestHandler = async ({ cookies, url, params }) => {
	console.log('API/DATA/SERVER')
	console.log('GET SERVER.ts')


	const query = parse(url?.search.substring(1))
	const coordinates = searchSchema.parse(query);

	const docs = await getPlaces(+coordinates.llat, +coordinates.rlat, +coordinates.tlng, +coordinates.blng);
/*	if (!docs.length) {
		const doc = await createDocument(collectionPath);
		docs.push(doc);
	}*/

	return new Response(JSON.stringify(docs));
};
