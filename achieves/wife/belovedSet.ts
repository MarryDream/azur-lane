import { defineDirective } from "@/modules/command";
import { getRealName, NameResult } from "#/azur-lane/common/name";
import { dbKey } from "#/azur-lane/common/databaseKey";

export default defineDirective( "order", async ( { messageData, matchResult, sendMessage, redis } ) => {
	const [ wifeName ] = matchResult.match;
	const userId = messageData.user_id;
	const result: NameResult = getRealName( wifeName );
	
	if ( result.definite ) {
		await redis.setString( dbKey.belovedWife( userId ), result.info );
		return sendMessage( `已设置[${ result.info }]为本名老婆` );
	}
	if ( result.info === "" ) {
		return sendMessage( "未找到相关舰船信息，请检查角色名称是否正确。若确认无误，请联系 BOT 持有者" )
	}
	
	return sendMessage( `未找到相关舰船信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }` );
} );