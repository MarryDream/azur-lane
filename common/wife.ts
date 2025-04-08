import { getRandomNumber } from "@/utils/random";
import { ICharacterInfo } from "#/azur-lane/types/characterInfo";
import FileManagement from "@/modules/file";
import { metaManagement } from "#/azur-lane/init";

type WifeRes = {
	status: true;
	data: ICharacterInfo & { avatarBase64: string }
} | {
	status: false;
	msg: string;
}

// 获取老婆
export async function getWife( file: FileManagement ): Promise<WifeRes> {
	const charaList = Object.keys( metaManagement.getMeta( "meta/alias" ) );
	if ( !charaList.length ) {
		return { status: false, msg: "没有可用的舰船数据，请联系 BOT 管理者。" };
	}
	
	// 随机抽一个角色
	const randomIndex = getRandomNumber( 0, charaList.length - 1 );
	const randomChar = charaList[randomIndex];
	
	// 获取舰船信息
	const charDirPath = `azur-lane/assets/character/${ randomChar }/`;
	const charaInfo = <ICharacterInfo | null>( await file.loadYAML( charDirPath + "info", "plugin" ) );
	if ( !charaInfo ) {
		return { status: false, msg: `无法获取舰船[${ randomChar }]信息，请联系 BOT 管理者。` };
	}
	
	// 获取舰船头像
	const avatarBase64 = await file.loadFile( charDirPath + "avatar.jpg", "plugin", "base64" );
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