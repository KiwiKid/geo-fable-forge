import type { PageLoad } from './$types';
import { getPlaces } from './Places.svelte';
export const load: PageLoad = async function load({ fetch, parent }) {
	const parentData = await parent();
	const places = !parentData.places ? await getPlaces(fetch) : parentData.places;

	return {
		places
	};
};
