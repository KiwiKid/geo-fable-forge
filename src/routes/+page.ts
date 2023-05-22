import { searchPlaces } from '$lib/client/wiki';
import type { PageLoad } from './$types';
import { getPlaces } from './Places.svelte';

//export const prerender = false;
//export const ssr = false;

export const load: PageLoad = async function load({ fetch, parent, url }) {
	const lat = url.searchParams.get('lat') || '0';
	const lng = url.searchParams.get('lng') || '0';
	const zoom = url.searchParams.get('zoom') || '10';
	const parentData = await parent();
	const places = !parentData.places ? await getPlaces() : parentData.places;
// searchPlaces({fetch, lat: parseInt(lat) || 0, lng: parseInt(lng) || 0})
	return {
		places
	};
};
