import type { AnyObject } from '$lib/models/types';
import { Document } from './Document';


export class Place extends Document {
	constructor(data: AnyObject = {}) {
		super(data);
		this._load(data);
	}

	_load(data: AnyObject) {
		if (data) {
			Object.assign(this, data);
		}
	}
	_dbFields = ['lat', 'lng', 'title', 'wikiId'];
	_collection = 'place';
	/*lat = 0;
	lng = 0;
	wikiId = '';
	title = 'loading..'*/
}
