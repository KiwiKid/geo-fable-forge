import { getPlace, getPlaces } from '$lib/server/firebase';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { searchSchema } from '$lib/models/Place';
import { parse } from 'querystring';

const getPlaceSchema = z.object({ wikiId: z.string()})

export const GET: RequestHandler = async ({ url }) => {
	console.log('API/DATA/SERVER')
	console.log('GET SINGLE SERVER.ts')


	const query = parse(url?.search.substring(1))
	const id = getPlaceSchema.parse(query);

	const docs = await getPlace(id.wikiId);
/*	if (!docs.length) {
		const doc = await createDocument(collectionPath);
		docs.push(doc);
	}*/

	return new Response(JSON.stringify(docs));
};
