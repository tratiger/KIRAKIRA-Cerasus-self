/**
 * 根据指定的格式来格式化日期时间。
 * @param date - 日期时间对象。
 * @param format - 格式化字符串。
 * @returns 格式化后的字符串。
 */
export function formatDate(date: Date, format: string) {
	if (!date) return "";
	const object = {
		"M+": date.getMonth() + 1, // month
		"d+": date.getDate(), // day
		"h+": date.getHours(), // hour
		"m+": date.getMinutes(), // minute
		"s+": date.getSeconds(), // second
		"q+": Math.floor((date.getMonth() + 3) / 3), // quarter
		S: date.getMilliseconds(), // millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (date.getFullYear() + "").slice(4 - RegExp.$1.length));
	for (const [key, value] of Object.entries(object))
		if (new RegExp("(" + key + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? String(value) : ("00" + value).slice(String(value).length));
	return format;
}

/**
 * 根据当前语言的规定格式来格式化日期时间。
 * @param date - 日期时间对象。
 * @returns 格式化后的字符串。
 */
export function formatDateWithLocale(
	date: Date | null,
	{
		time = false,
	}: {
		/** 是否同时显示时间？ */
		time?: boolean;
	} = {},
) {
	const locale = getCurrentLocaleLangCode(undefined, true);
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		...!time ? {} : {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		},
	};
	let result = Intl.DateTimeFormat(locale, options).format(date ?? new Date());
	if (date === null) result = result.replaceAll(/\d/g, "‒");
	return result;
}

/**
 * 根据当前语言所对应的时区格式化具有语义的日期。
 * @param timestamp - 时间戳。
 * @param semanticDays - 设定前 n 天可以按语义化转化，例如，设定为 2 只会有“今天”和“昨天”，设定为 3 则会有“今天”、“昨天”和“前天”。
 * @returns 格式化后的字符串。
 */
export function formatLocalizationSemanticDateTime(timestamp: number, semanticDays: number): string {
	const locale = getCurrentLocaleLangCode();
	const targetDate = new Date(timestamp);
	const now = new Date();

	const targetDateLocalString = formatDateWithLocale(targetDate, { time: false });
	const nowDateLocalString = formatDateWithLocale(now, { time: false });

	const targetDateLocal = new Date(targetDateLocalString);
	const nowDateLocal = new Date(nowDateLocalString);

	// Calculate the difference in time
	const differenceInSeconds = (nowDateLocal.getTime() - targetDateLocal.getTime()) / 1000;
	const differenceInDays = differenceInSeconds / (3600 * 24);

	if (differenceInDays < semanticDays && differenceInDays > -semanticDays) {
		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
		return rtf.format(-differenceInDays, "day");
	} else {
		const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
		return targetDate.toLocaleString(locale, options);
	}
}

/**
 * 生成符合 Cloudflare 风格的过期日期字符串，例如："2024-03-17T13:47:28Z"
 * @param expiresIn - 有效期限，单位：秒。
 * @returns 符合 Cloudflare 风格的过期日期字符串
 */
export function getCloudflareRFC3339ExpiryDateTime(expiresIn: number): string {
	return new Date(new Date().getTime() + expiresIn * 1000).toISOString().replace(/\.\d{3}/, "");
}

/**
 * 将绝对日期转换为相对于现在的相对日期字符串。
 * @param date - 要格式化的日期。
 * @param style - 格式化相对时间的样式。默认为 `"long"`。
 * @returns 格式化后的相对日期字符串（如：2 小时前、3 天前）。
 */
export function timeAgo(date: Date, style: Intl.RelativeTimeFormatStyle = "long") {
	const locale = getCurrentLocaleLangCode(undefined, true);
	const formatter = new Intl.RelativeTimeFormat(locale, { style });

	const now = Date.now();
	const past = date.getTime();
	const diff = past - now;

	const seconds = diff / 1000 | 0;
	if (Math.abs(seconds) < 60) return formatter.format(seconds, "seconds");

	const minutes = seconds / 60 | 0;
	if (Math.abs(minutes) < 60) return formatter.format(minutes, "minutes");

	const hours = minutes / 60 | 0;
	if (Math.abs(hours) < 60) return formatter.format(hours, "hours");

	const days = hours / 24 | 0;
	if (Math.abs(days) < 7) return formatter.format(days, "days");

	const weeks = days / 7 | 0; // TODO: 不可靠，当大于三周并小于一个月时会显示“零个月后”。
	if (Math.abs(weeks) < 4) return formatter.format(weeks, "weeks");

	const months = days / 30 | 0; // TODO: 不可靠，一个月不恒等于三十天。
	if (Math.abs(months) < 12) return formatter.format(months, "months");

	const years = days / 365 | 0; // TODO: 不可靠，一年不恒等于三百六十五天。
	return formatter.format(years, "years");
}
