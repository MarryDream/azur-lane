import { OrderConfig } from "@/modules/command";
import { definePlugin } from "@/modules/plugin";
import * as m from "./module";

export let metaManagement: m.MetaManagement;
export let aliasClass: m.AliasClass;

function initModules() {
	aliasClass = new m.AliasClass();
}

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
	main: "achieves/wife/refresh",
	detail: "刷新今日老婆，每次消耗2魔方"
};

const belovedWifeSet: OrderConfig = {
	type: "order",
	cmdKey: "azur-lane.beloved-wife-set",
	desc: [ "本名老婆", "[舰船名称]" ],
	headers: [ "本名老婆" ],
	regexps: [ ".+" ],
	main: "achieves/wife/belovedSet",
	detail: "设置本命老婆，本命老婆会在今日老婆中优先出现"
};

const wifeArtwork: OrderConfig = {
	type: "order",
	cmdKey: "azur-lane.wife-artwork",
	desc: [ "查看换装", "[舰船名称](换装名称)" ],
	headers: [ "换装" ],
	regexp: /^(\S+?)(?:\s+(\d{1,2}|通常|改造|誓约))?$/,
	main: "achieves/wife/artwork",
	detail: "获取舰娘立绘\n" +
		"换装名称支持列表: 1-2位数数字、通常、改造、誓约\n" +
		"不填则默认通常立绘"
};

export default definePlugin( {
	name: "碧蓝航线",
	cfgList: [ signIn, wifeToday, wifeRefresh, belovedWifeSet, wifeArtwork ],
	publicDirs: [ "assets", "views" ],
	mounted( param ) {
		/* 初始化 meta 数据 */
		metaManagement = new m.MetaManagement( param.file, param.logger );
		/* 初始化 meta 监听器 */
		metaManagement.watchStart();
		initModules();
	}
} );