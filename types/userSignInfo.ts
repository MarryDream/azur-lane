export interface IUserSignInfo {
	/**
	 * 累计签到天数
	 */
	totalDays: number;
	/**
	 * 连续签到天数
	 */
	consecutiveDays: number;
	/**
	 * 上次签到日期
	 */
	lastSignDate: string; // YYYY-MM-DD 格式的日期字符串，方便计算连续签到
	/**
	 * 金币数量
	 */
	gold: number;
}