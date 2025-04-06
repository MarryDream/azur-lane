import { defineDirective } from "@/modules/command";
import { getRandomNumber } from "@/utils/random";
import moment from "moment";
import { segment, Sendable } from "@/modules/lib";
import { getSignInInfo } from "#/azur-lane/common/signIn";

export default defineDirective( "order", async ( { messageData, redis, logger, file, sendMessage } ) => {
	const userId = messageData.user_id;
	
	// 获取用户签到信息
	const signInDataKey = `azur-lane:sign-in:${ userId }`;
	const signInInfoRes = await getSignInInfo( redis, signInDataKey );
	if ( !signInInfoRes.status ) {
		if ( signInInfoRes.logger ) {
			logger.error( `[azur-lane]${ signInInfoRes.logger }` );
		}
		return sendMessage( signInInfoRes.msg );
	}
	
	const signInInfo = signInInfoRes.data;
	const todayDate = moment().format( "YYYY-MM-DD" );
	
	// 今天已签到过的话就不给签到了
	if ( signInInfo.lastSignDate === todayDate ) {
		// 重复签到
		return sendMessage( "今天你已经签到过了哦" );
	}
	
	/* 信息更新 */
	// 签到天数+1
	signInInfo.totalDays += 1; // 累计签到天数 +1
	// 比对是否为连续签到
	const yesterdayDate = moment().subtract( 1, "days" ).format( "YYYY-MM-DD" ); // 昨天的日期
	if ( signInInfo.lastSignDate === yesterdayDate ) {
		// 昨天签到，连续签到 +1
		signInInfo.consecutiveDays += 1;
	} else {
		// 断签了，连续签到归零
		signInInfo.consecutiveDays = 1;
	}
	// 更新最后签到日期为今天
	signInInfo.lastSignDate = todayDate;
	// 奖励金币，每次签到奖励10金币
	signInInfo.gold = ( signInInfo.gold || 0 ) + 10; // 金币数量增加10
	
	await redis.setString( signInDataKey, JSON.stringify( signInInfo ) );
	
	const messageToSend: Sendable = [
		`签到成功！魔方+10\n`,
		`累计签到：${ signInInfo.totalDays }天\n`,
		`连续签到：${ signInInfo.consecutiveDays }天\n`,
		`魔方数量：${ signInInfo.gold }`
	];
	
	
	// 随机抽一个一格漫画
	const cartoonList = await file.getDirFiles( "azur-lane/assets/cartoon", "plugin" );
	
	let cartoonBase64: string | null;
	if ( cartoonList.length ) {
		// 随机选择一格漫画
		const randomCartoon = cartoonList[getRandomNumber( 0, cartoonList.length - 1 )];
		
		// 获取漫画图片的 base64
		cartoonBase64 = await file.loadFile( `azur-lane/assets/cartoon/${ randomCartoon }`, "plugin", "base64" );
		
		if ( cartoonBase64 ) {
			// 在消息最前面插入
			messageToSend.unshift( segment.image( `base64://${ cartoonBase64 })` ) );
		}
	}
	
	await sendMessage( messageToSend );
} );