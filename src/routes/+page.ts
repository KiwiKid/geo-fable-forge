import { searchPlaces } from '$lib/client/search';
import type { PageLoad } from './$types';

//export const prerender = false;
//export const ssr = false;

export const load: PageLoad = async function load({ fetch, parent, url }) {
	const llat = url.searchParams.get('llat') || 0;
	const rlat = url.searchParams.get('rlat') || 0;
	const blng = url.searchParams.get('blng') || 0;
	const tlng = url.searchParams.get('tlng') || 0;

	const zoom = url.searchParams.get('zoom') || '10';
	const parentData = await parent();
	const places = !parentData.places ? await searchPlaces({
		fetch,
		llat: +llat,
		rlat: +rlat,
		blng: +blng,
		tlng: +tlng,
	}) : parentData.places;
// searchPlaces({fetch, lat: parseInt(lat) || 0, lng: parseInt(lng) || 0})
	return {
		places
	};
};
