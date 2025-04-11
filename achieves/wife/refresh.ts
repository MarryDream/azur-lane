import { defineDirective, Order } from "@/modules/command";
import moment from "moment";
import { segment } from "@/modules/lib";
import { getWife } from "#/azur-lane/common/wife";
import { getSignInInfo } from "#/azur-lane/common/signIn";
import bot from "ROOT";
import { dbKey } from "#/azur-lane/common/databaseKey";

export default defineDirective( "order", async ( { messageData, redis, logger, sendMessage } ) => {
	const userId = messageData.user_id;
	const wifeDataKey = dbKey.wifeToday( userId );
	const userWife = await redis.getString( wifeDataKey );
	if ( !userWife ) {
		const WIFE_TODAY = <Order>bot.command.getSingle( "azur-lane.wife-today", await bot.auth.get( userId ) );
		const appendMsg = WIFE_TODAY ? `，先使用 ${ WIFE_TODAY.getHeaders()[0] } 娶个老婆吧` : "";
		return sendMessage( `你今天还没有老婆哦${ appendMsg }` );
	}
	
	// 获取用户签到信息
	const signInInfoRes = await getSignInInfo( redis, userId );
	if ( !signInInfoRes.status ) {
		if ( signInInfoRes.logger ) {
			logger.error( `[azur-lane]${ signInInfoRes.logger }` );
		}
		return sendMessage( signInInfoRes.msg );
	}
	const signInInfo = signInInfoRes.data;
	const goldNum = signInInfo.gold;
	if ( goldNum < 2 ) {
		return sendMessage( "魔方不够了哦" );
	}
	
	const wifeRes = await getWife( userId );
	if ( !wifeRes.status ) {
		return sendMessage( wifeRes.msg );
	}
	
	// 获取老婆列表
	const wifeInfo = wifeRes.data;
	// 记录保存该用户今天的老婆，到期时间为今晚十二点
	const expireTime = moment().endOf( "day" ).diff( moment(), "s" ); // 今天剩余的秒数
	await redis.setString( wifeDataKey, wifeInfo.name, expireTime );
	
	// 扣除本次刷新费用
	signInInfo.gold -= 2;
	await redis.setString( dbKey.signIn( userId ), JSON.stringify( signInInfo ) );
	
	// 组装发送
	await sendMessage( [
		`今天你的老婆是：${ wifeInfo.name }`,
		segment.image( `base64://${ wifeInfo.avatarBase64 }` ),
		`"${ wifeInfo.propose }"\n`,
		`消耗魔方:2  剩余魔方:${ signInInfo.gold }`
	] );
} );