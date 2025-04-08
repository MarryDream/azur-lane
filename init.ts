import { OrderConfig } from "@/modules/command";
import { definePlugin } from "@/modules/plugin";
import * as m from "./module";

export let metaManagement: m.MetaManagement;

const signIn: OrderConfig = {
	type: "order",
	cmdKey: "azur-lane.sign-in",
	desc: [ "签到", "" ],
	headers: [ "签到" ],
	regexps: [],
	main: "achieves/signIn",
	detail: "签到获取插件货币"
}

const wifeToday: OrderConfig = {
	type: "order",
	cmdKey: "azur-lane.wife-today",
	desc: [ "今日老婆", "" ],
	headers: [ "今日老婆" ],
	regexps: [],
	main: "achieves/wife/today",
	detail: "查看今日老婆"
};

const wifeRefresh: OrderConfig = {
	type: "order",
	cmdKey: "azur-lane.wife-refresh",
	desc: [ "今日老婆刷新", "" ],
	headers: [ "今日老婆刷新" ],
	regexps: [],
	main: "achieves/wife/refresh.ts",
	detail: "刷新今日老婆，每次消耗2魔方"
};

export default definePlugin( {
	name: "碧蓝航线",
	cfgList: [ signIn, wifeToday, wifeRefresh ],
	publicDirs: [ "assets", "views" ],
	mounted( param ) {
		/* 初始化 meta 数据 */
		metaManagement = new m.MetaManagement( param.file, param.logger );
		/* 初始化 meta 监听器 */
		metaManagement.watchStart();
	}
} );