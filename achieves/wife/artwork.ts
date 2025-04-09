import { defineDirective } from "@/modules/command";
import { getRealName, NameResult } from "#/azur-lane/common/name";
import { segment } from "@/modules/lib";

export default defineDirective( "order", async ( { file, sendMessage, matchResult } ) => {
	const [ name, artworkType ] = matchResult.match;
	const result: NameResult = getRealName( name );
	
	if ( result.definite ) {
		// 获取立绘图片名称，type 可能为空、数字、誓约、改造
		const artworkName = artworkType
			? Number.isNaN( +artworkType )
				? artworkType
				: `换装${ artworkType }`
			: "通常"
		/* 获取立绘图 */
		const artworkBase64 = await file.loadFile( `azur-lane/assets/character/${ result.info }/${ artworkName }.jpg`, "plugin", "base64" );
		if ( artworkBase64 ) {
			return sendMessage( segment.image( `base64://${ artworkBase64 }` ) );
		}
		
		// 此时没找到立绘图，尝试给出提示
		const charFileList = await file.getDirFiles( `azur-lane/assets/character/${ result.info }`, "plugin" );
		// 是否存在默认立绘
		const existNormal = charFileList.includes( "通常.jpg" );
		// 是否存在改造立绘
		const existReform = charFileList.includes( "改造.jpg" );
		// 是否存在誓约立绘
		const existPromise = charFileList.includes( "誓约.jpg" );
		// 普通立绘数量
		const normalArtList = charFileList.filter( el => el.startsWith( "换装" ) );
		const normalCount = normalArtList.length;
		if ( !existNormal && !existReform && !existPromise && normalCount === 0 ) {
			return sendMessage( `舰船[${ result.info }]没有任何换装图片，请联系 BOT 管理者` );
		}
		
		const tipMsgList: string[] = [ `未找到目标换装，舰船[${ result.info }]拥有如下换装:` ];
		if ( existNormal ) tipMsgList.push( `\n- 通常` );
		if ( normalCount ) tipMsgList.push( ...normalArtList.map( el => `\n- ${ el.replace( /换装(\d+)\.jpg/, "$1" ) }` ) );
		if ( existReform ) tipMsgList.push( `\n- 改造` );
		if ( existPromise ) tipMsgList.push( `\n- 誓约` );
		
		return sendMessage( tipMsgList );
	}
	if ( result.info === "" ) {
		return sendMessage( "未找到相关舰船信息，请检查角色名称是否正确。若确认无误，请联系 BOT 持有者" )
	}
	
	return sendMessage( `未找到相关舰船信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }` );
} );