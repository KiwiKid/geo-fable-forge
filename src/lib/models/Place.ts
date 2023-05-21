import type { AnyObject } from '$lib/models/types';
import { Document } from './Document';


export class Place extends Document {
	constructor(data: AnyObject) {
		super(data);
		this._load(data);
		this._dbFields.push('lat');
        this._dbFields.push('lng');
        this._dbFields.push('title');
        this._dbFields.push('wikiId');
	}

	_collection = 'places';
	lat = 0;
	lng = 0;
	wikiId = '';
	title = 'loading..'
}
