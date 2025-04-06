import { defineDirective, Order } from "@/modules/command";
import moment from "moment";
import { segment } from "@/modules/lib";
import { getWife } from "#/azur-lane/common/wife";
import bot from "ROOT";

export default defineDirective( "order", async ( { messageData, redis, file, sendMessage } ) => {
	const userId = messageData.user_id;
	
	const wifeDataKey = `azur-lane:wife-today:${ userId }`;
	const userWife = await redis.getString( wifeDataKey );
	if ( userWife ) {
		const WIFE_REFRESH = <Order>bot.command.getSingle( "azur-lane.wife-refresh", await bot.auth.get( userId ) );
		const appendMsg = WIFE_REFRESH ? `，想换老婆的话可以使用 ${ WIFE_REFRESH.getHeaders()[0] } 哦` : "";
		return sendMessage( `你今天已经有老婆了！你的老婆是[${ userWife }]${ appendMsg }` );
	}
	
	const wifeRes = await getWife( file );
	if ( !wifeRes.status ) {
		return sendMessage( wifeRes.msg );
	}
	
	const wifeInfo = wifeRes.data; // 获取老婆列表
	// 记录保存该用户今天的老婆，到期时间为今晚十二点
	const expireTime = moment().endOf( "day" ).diff( moment(), "s" ); // 今天剩余的秒数
	await redis.setString( wifeDataKey, wifeInfo.name, expireTime );
	// 组装发送
	await sendMessage( [
		`今天你的老婆是：${ wifeInfo.name }`,
		segment.image( `base64://${ wifeInfo.avatarBase64 }` ),
		`"${ wifeInfo.propose }"`
	] );
} );