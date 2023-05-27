import { searchPlaces } from '$lib/client/search';
import { searchSchema } from '$lib/models/Place';
import type { PageLoad } from './$types';
import { z } from 'zod';
//export const prerender = false;
//export const ssr = false;



export const load: PageLoad = async function load({ fetch, parent, url }) {

	const defaultParams = {
		llat: -43.00,
		rlat: -43.5320,
		blng: 172.13,
		tlng: 172.63,
		zoom: 10
	}

	const coordinates = Object.keys(url.searchParams).length > 0 ? searchSchema.parse(url.searchParams) : defaultParams



	const zoom = url.searchParams.get('zoom') || '10';
	const parentData = await parent();
	const places = !parentData.places ? await searchPlaces({
		fetch,
		llat: +coordinates.llat,
		rlat: +coordinates.rlat,
		blng: +coordinates.blng,
		tlng: +coordinates.tlng,
		zoom: +coordinates.zoom
	}) : parentData.places;
// searchPlaces({fetch, lat: parseInt(lat) || 0, lng: parseInt(lng) || 0})
	return {
		places: places.places,
		location: coordinates
	};
};
