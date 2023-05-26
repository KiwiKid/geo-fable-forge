import type { AnyObject } from '$lib/models/types';
import { Document } from './Document';
import { z} from 'zod'

export const searchSchema =  z.object({ llat: z.string(), rlat: z.string(), blng: z.string(), tlng: z.string(), zoom: z.string() })


export class Place extends Document {
	constructor(data: AnyObject = {}) {
		super(data);
		this._load(data);
		this._load(data);
		this._dbFields.push('lat', 'lng', 'title', 'wikiId', 'wikiTitle', 'wikiSummary', 'content', 'placeType');
	}

	_load(data: AnyObject) {
		if (data) {
			Object.assign(this, data);
		}
	}
	_collection = 'place';
	lat = 0;
	lng = 0;
	wikiId = '';
	wikiTitle = '';
	wikiSummary = ''
	title = 'loading..';
	content = '';
	placeType = '';
}
