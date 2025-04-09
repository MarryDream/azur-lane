import { metaManagement } from "#/azur-lane/init";

export class AliasClass {
	private aliasMap: Map<string, string> = new Map();
	private realNameList: string[] = [];
	
	constructor() {
		const alias = metaManagement.getMeta( "meta/alias" );
		this.initData( alias );
		metaManagement.on( "meta/alias", data => {
			this.initData( data || {} );
		} );
	}
	
	private initData( metaData: Record<string, string[]> ) {
		const aliasMap = new Map();
		for ( let [ realName, aliasNames ] of Object.entries( metaData ) ) {
			for ( let alias of aliasNames ) {
				aliasMap.set( alias.toString(), realName );
			}
		}
		this.aliasMap = aliasMap;
		this.realNameList = Object.keys( metaData );
	}
	
	public getAllAliasKey( hasRealName = false ) {
		const keys = this.aliasMap.keys();
		if ( hasRealName ) {
			return [ ...this.realNameList, ...keys ];
		}
		return [ ...keys ];
	}
	
	public search( name: string, hasRealName = false ): string | undefined {
		if ( hasRealName && this.realNameList.includes( name ) ) {
			return name;
		}
		return this.aliasMap.get( name );
	}
}