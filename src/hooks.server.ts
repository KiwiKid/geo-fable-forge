import { decodeToken } from '$lib/server/firebase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token') || '';
	const lastLocation = event.cookies.get('lastLocation');
	const decodedToken = await decodeToken(token);
	if (decodedToken) {
		const { uid, name, email } = decodedToken;
		event.locals.userSession = { uid, name, email, lastLocation: lastLocation };
	}

	const response = await resolve(event);

	return response;
};
