export const useAppSettingsCookies = defineStore("app-settings-cookies", {
	state: () => ({
		// 请尽可能简短，因为Cookies有大小限制。
		bgShown: false,
	}),
	persist: true,
});
