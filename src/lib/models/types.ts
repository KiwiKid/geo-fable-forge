export type AnyObject = Record<string, unknown>;
export type Fetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

export interface UserSession {
	name: string | undefined;
	email: string | undefined;
	uid: string | undefined;
}

export interface Place {
	wikiId:string
	wikiTitle:string
	wikiSummary:string
	lat:number
	lng:number
	placeType:string
	title?:string
	content?:string
 }