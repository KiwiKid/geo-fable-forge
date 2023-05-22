import type { AnyObject } from '$lib/models/types';
import { Document } from './Document';


export class Place extends Document {
	constructor(data: AnyObject = {}) {
		super(data);
		this._load(data);
		this._load(data);
		this._dbFields.push('lat', 'lng', 'title', 'wikiId');
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
	title = 'loading..'
}
