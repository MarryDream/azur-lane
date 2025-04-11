import { aliasClass } from "#/azur-lane/init";
import { fuzzyMatch, MatchResult } from "./fuzzyMatch";

export type NameResult = {
	definite: true;
	info: string;
} | {
	definite: false;
	info: string | string[];
}

export function getRealName( name: string ): NameResult {
	const aliasSearchResult = aliasClass.search( name, true );
	if ( aliasSearchResult !== undefined ) {
		return { definite: true, info: aliasSearchResult };
	}
	
	const fuzzyMatchResult: MatchResult[] = fuzzyMatch( name );
	if ( fuzzyMatchResult.length === 0 ) {
		return { definite: false, info: "" };
	} else if ( fuzzyMatchResult[0].ratio >= 0.98 ) {
		return { definite: true, info: fuzzyMatchResult[0].content };
	} else {
		return { definite: false, info: fuzzyMatchResult.map( el => el.content ) };
	}
}