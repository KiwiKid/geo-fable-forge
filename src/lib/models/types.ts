export type AnyObject = Record<string, unknown>;
export type Fetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

export interface UserSession {
	name: string | undefined;
	email: string | undefined;
	uid: string | undefined;
}

export interface Place {
	wikiId:string
	lat:number
	lng:number
	title?:string
	story?:string
 }