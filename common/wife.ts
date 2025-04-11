import bot from "ROOT";
import { getRandomNumber } from "@/utils/random";
import { ICharacterInfo } from "#/azur-lane/types/characterInfo";
import { metaManagement } from "#/azur-lane/init";
import { dbKey } from "#/azur-lane/common/databaseKey";

type WifeRes = {
	status: true;
	data: ICharacterInfo & { avatarBase64: string }
} | {
	status: false;
	msg: string;
}

// 获取老婆
export async function getWife( userID: string | number ): Promise<WifeRes> {
	const charaList = Object.keys( metaManagement.getMeta( "meta/alias" ) );
	if ( !charaList.length ) {
		return { status: false, msg: "没有可用的舰船数据，请联系 BOT 管理者。" };
	}

	// 如果已存在今日老婆，避免重复
	const todayWife = await bot.redis.getString( dbKey.wifeToday( userID ) );
	if ( todayWife ) {
		const index = charaList.indexOf( todayWife );
		if ( index > -1 ) {
			charaList.splice( index, 1 );
		}
	}

	// 先进行本命老婆判定
	const belovedWife = await bot.redis.getString( dbKey.belovedWife( userID ) );
	let randomChar: string = "";
	// 如果存在本命老婆且本命老婆在待抽取列表中存在，先以 20% 概率进行抽取
	if ( belovedWife && charaList.includes( belovedWife ) ) {
		// 如果待抽取列表仅剩下本命老婆，必定抽到，否则就走 20% 判定
		if ( charaList.length === 1 || Math.random() < 0.2 ) {
			randomChar = belovedWife;
		} else {
			// 若未抽到，从待抽取列表列表中移除本命老婆
			const index = charaList.indexOf( belovedWife );
			if ( index > -1 ) {
				charaList.splice( index, 1 );
			}
		}
	}
	
	if ( !randomChar ) {
		// 随机抽一个角色
		const randomIndex = getRandomNumber( 0, charaList.length - 1 );
		randomChar = charaList[randomIndex];
	}
	
	// 获取舰船信息
	const charDirPath = `azur-lane/assets/character/${ randomChar }/`;
	const charaInfo = <ICharacterInfo | null>( await bot.file.loadYAML( charDirPath + "info", "plugin" ) );
	if ( !charaInfo ) {
		return { status: false, msg: `无法获取舰船[${ randomChar }]信息，请联系 BOT 管理者。` };
	}
	
	// 获取舰船头像
	const avatarBase64 = await bot.file.loadFile( charDirPath + "avatar.jpg", "plugin", "base64" );
	if ( !avatarBase64 ) {
		return { status: false, msg: `无法获取舰船[${ randomChar }]头像，请联系 BOT 管理者。` };
	}
	
	return {
		status: true,
		data: {
			...charaInfo,
			avatarBase64
		}
	};
}