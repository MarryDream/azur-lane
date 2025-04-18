import Database from "@/modules/database";
import moment from "moment";
import { IUserSignInfo } from "#/azur-lane/types/userSignInfo";
import { dbKey } from "#/azur-lane/common/databaseKey";

type SignInRes = {
	status: true;
	data: IUserSignInfo
} | {
	status: false;
	msg: string;
	logger?: string; // 是否记录日志
}

// 获取签到信息
export async function getSignInInfo( redis: Database, userId: string | number ): Promise<SignInRes> {
	// 获取用户签到信息
	const signInInfoStr = await redis.getString( dbKey.signIn( userId ) );
	
	let signInInfo: IUserSignInfo;
	
	if ( signInInfoStr ) {
		try {
			signInInfo = JSON.parse( signInInfoStr );
			return { status: true, data: signInInfo }
		} catch ( error ) {
			return {
				status: false,
				msg: "未正常获取到签到信息，请重试或联系 BOT 管理者。",
				logger: `解析签到信息数据[${ userId }]的签到信息失败，数据：${ signInInfoStr }，错误：${ ( <Error> error ).message }`
			}
		}
	}
	// 无信息时设置初始值
	return {
		status: true,
		data: {
			totalDays: 0,
			consecutiveDays: 0,
			lastSignDate: "", // 今天签到
			gold: 0
		}
	}
}