import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const { userSession, places } = locals;
	return { userSession, places };
};
