/**
 * 数据库相关的 key
 */
export const dbKey = {
	/** 本命老婆 */
	belovedWife: ( userId: string | number ) => `azur-lane:beloved-wife:${ userId }`,
	/** 今日老婆 */
	wifeToday: ( userId: string | number ) => `azur-lane:wife-today:${ userId }`,
	/** 签到 */
	signIn: ( userId: string | number ) => `azur-lane:sign-in:${ userId }`,
}