<script setup lang="ts">
	const add = ref("");
	const remove = useNoop;

	const currentLanguage = computed(getCurrentLocale); // 当前用户的语言

	const isClickAddButton = ref(false); // 是否点击了添加屏蔽按钮（是否正在获取待屏蔽目标的信息）
	const isShowAlert = ref(false); // 是否正在显示待屏蔽数据
	const isAddButtonUnclickalbe = computed(() => isClickAddButton.value || isShowAlert.value); // 不能点击添加按钮

	const blockUserList = ref<GetBlockListResponseDto["result"]>(); // 被屏蔽的用户列表
	const blockUserListPage = ref(0); // 被屏蔽的用户列表的页码
	const blockUserListPageSize = ref(0); // 被屏蔽的用户列表的每页数量
	const inputPendingBlockUid = ref(Infinity); // 用户输入的待屏蔽用户 UID
	const isFetchPendingBlockUserInfo = ref(false); // 是否正在请求待屏蔽用户数据
	const isShowAddBlockUserAlert = ref(false); // 是否展示待屏蔽用户信息对话框
	const pendingBlockUserInfo = ref<GetUserInfoByUidResponseDto["result"]>(); // 待屏蔽用户信息
	const isBlockingUser = ref(false); // 正在屏蔽用户

	const hideUserList = ref<GetBlockListResponseDto["result"]>(); // 被隐藏的用户列表
	const hideUserListPage = ref(0); // 被隐藏的用户列表的页码
	const hideUserListPageSize = ref(0); // 被隐藏的用户列表的每页数
	const inputPendingHideUid = ref(Infinity); // 用户输入的待隐藏用户 UID
	const isFetchPendingHideUserInfo = ref(false); // 是否正在请求待隐藏用户数据
	const isShowAddHideUserAlert = ref(false); // 是否展示待隐藏用户信息对话框
	const pendingHideUserInfo = ref<GetUserInfoByUidResponseDto["result"]>(); // 待隐藏用户信息
	const isHidingUser = ref(false); // 正在隐藏用户

	// const blockTagList = ref<DisplayVideoTag[]>();
	const blockTagList = ref<Map<VideoTag["tagId"], VideoTag>>(new Map()); // 视频标签
	const displayBlockTagList = computed<DisplayVideoTag[]>(() => [...blockTagList.value.values()].map(tagName => getDisplayVideoTagWithCurrentLanguage(currentLanguage.value, tagName))); // 用于显示的 TAG，相较于上方的 tags 数据结构更简单。
	
	const blockTagListPage = ref(0);
	const blockTagListPageSize = ref(0);
	const flyoutTag = ref<FlyoutModel>(); // TAG 的删除浮窗
	const contextualToolbar = ref<FlyoutModel>(); // TAG 的工具烂浮窗
	const hoveredTagContent = ref<[number, string]>(); // 鼠标 hover 的 TAG
	const hideExceptMe = ref(false);
	const hideTimeoutId = ref<Timeout>();

	const blockKeywordList = ref<GetBlockListResponseDto["result"]>();
	const blockKeywordListPage = ref(0);
	const blockKeywordListPageSize = ref(0);

	const blockRegexList = ref<GetBlockListResponseDto["result"]>();
	const blockRegexListPage = ref(0);
	const blockRegexListPageSize = ref(0);

	/**
	 * 获取待屏蔽用户的信息
	 */
	async function getPendingBlockUserInfo() {
		isClickAddButton.value = true;
		try {
			if (inputPendingBlockUid.value === Infinity) {
				isClickAddButton.value = false;
				return;
			}

			if (inputPendingBlockUid.value === undefined || inputPendingBlockUid.value === null || inputPendingBlockUid.value < 1) {
				console.error("ERROR", "待屏蔽用户的 UID 格式不正确，不能为空或小于零");
				// TODO: 使用多语言
				useToast("待屏蔽用户的 UID 格式不正确", "error", 5000);
				isClickAddButton.value = false;
				return;
			}

			const getUserInfoByUidRequest: GetUserInfoByUidRequestDto = {
				uid: inputPendingBlockUid.value,
			};
			const pendingBlockUserInfoResult = await api.user.getUserInfo(getUserInfoByUidRequest);
			if (pendingBlockUserInfoResult.success) {
				pendingBlockUserInfo.value = pendingBlockUserInfoResult.result;
				isShowAddBlockUserAlert.value = true;
				isShowAlert.value = true;
			} else {
				console.error("ERROR", "获取待屏蔽用户信息失败");
				// TODO: 使用多语言
				useToast("获取待屏蔽用户信息失败", "error", 5000);
			}
		} catch (error) {
			console.error("ERROR", "获取待屏蔽用户信息时出错", error);
			// TODO: 使用多语言
			useToast("获取待屏蔽用户信息时出错", "error", 5000);
		}
		isClickAddButton.value = false;
	}

	/**
	 * 屏蔽一个用户
	 */
	async function blockUser() {
		isBlockingUser.value = true;
		try {
			if (inputPendingBlockUid.value === Infinity) {
				isBlockingUser.value = false;
				return;
			}
			if (inputPendingBlockUid.value === undefined || inputPendingBlockUid.value === null || inputPendingBlockUid.value < 1) {
				console.error("ERROR", "屏蔽用户的 UID 格式不正确，不能为空或小于零");
				// TODO: 使用多语言
				useToast("屏蔽用户的 UID 格式不正确", "error", 5000);
				isBlockingUser.value = false;
				return;
			}

			const blockUserByUidRequest: BlockUserByUidRequestDto = {
				blockUid: inputPendingBlockUid.value,
			};
			const blockUserResult = await api.block.blockUserController(blockUserByUidRequest);
			if (blockUserResult.success) {
				const blockUserListResult = await getBlockList("block", blockUserListPage.value, blockUserListPageSize.value);
				if (blockUserListResult && blockUserListResult.success) blockUserList.value = blockUserListResult.result;
				// TODO: 使用多语言
				useToast("屏蔽用户成功", "success");
				closeBlockUserAlert();
				inputPendingBlockUid.value = Infinity;
				pendingBlockUserInfo.value = undefined;
			} else {
				console.error("ERROR", "屏蔽用户失败");
				// TODO: 使用多语言
				useToast("屏蔽用户失败", "error", 5000);
			}
		} catch (error) {
			console.error("ERROR", "屏蔽用户时出错", error);
			// TODO: 使用多语言
			useToast("屏蔽用户时出错", "error", 5000);
		}
		isBlockingUser.value = false;
	}

	/**
	 * 关闭待屏蔽用户信息对话框
	 */
	function closeBlockUserAlert() {
		isShowAlert.value = false;
		isShowAddBlockUserAlert.value = false;
	}

	/**
	 * 解除屏蔽用户
	 * @param blockUserUid 被屏蔽的用户 UID
	 */
	async function unblockUser(blockUserUid: number) {
		try {
			if (blockUserUid === undefined || blockUserUid === null || blockUserUid < 1) {
				console.error("ERROR", "解除屏蔽用户的 UID 格式不正确，不能为空或小于零");
				// TODO: 使用多语言
				useToast("解除屏蔽用户的 UID 格式不正确", "error", 5000);
				return;
			}

			const unblockUserByUidRequest: UnblockUserByUidRequestDto = {
				blockUid: blockUserUid,
			};
			const unblockUserResult = await api.block.unblockUserController(unblockUserByUidRequest);
			if (unblockUserResult.success) {
				const blockUserListResult = await getBlockList("block", blockUserListPage.value, blockUserListPageSize.value);
				if (blockUserListResult && blockUserListResult.success) blockUserList.value = blockUserListResult.result;
				// TODO: 使用多语言
				useToast("解除屏蔽用户成功", "success");
			} else {
				console.error("ERROR", "解除屏蔽用户失败");
				// TODO: 使用多语言
				useToast("解除屏蔽用户失败", "error", 5000);
			}
		} catch (error) {
			console.error("ERROR", "解除屏蔽用户时出错", error);
			// TODO: 使用多语言
			useToast("解除屏蔽用户时出错", "error", 5000);
		}
	}

	/**
	 * 获取待隐藏用户的信息
	 */
	async function getPendingHideUserInfo() {
		isClickAddButton.value = true;
		try {
			if (inputPendingHideUid.value === Infinity) {
				isClickAddButton.value = false;
				return;
			}

			if (inputPendingHideUid.value === undefined || inputPendingHideUid.value === null || inputPendingHideUid.value < 1) {
				console.error("ERROR", "待隐藏用户的 UID 格式不正确，不能为空或小于零");
				// TODO: 使用多语言
				useToast("待隐藏用户的 UID 格式不正确", "error", 5000);
				isClickAddButton.value = false;
				return;
			}

			const getUserInfoByUidRequest: GetUserInfoByUidRequestDto = {
				uid: inputPendingHideUid.value,
			};
			const pendingHideUserInfoResult = await api.user.getUserInfo(getUserInfoByUidRequest);
			if (pendingHideUserInfoResult.success) {
				pendingHideUserInfo.value = pendingHideUserInfoResult.result;
				isShowAddHideUserAlert.value = true;
				isShowAlert.value = true;
			} else {
				console.error("ERROR", "获取待隐藏用户信息失败");
				// TODO: 使用多语言
				useToast("获取待隐藏用户信息失败", "error", 5000);
			}
		} catch (error) {
			console.error("ERROR", "获取待隐藏用户信息时出错", error);
			// TODO: 使用多语言
			useToast("获取待隐藏用户信息时出错", "error", 5000);
		}
		isClickAddButton.value = false;
	}

	/**
	 * 隐藏一个用户
	 */
	async function hideUser() {
		isHidingUser.value = true;
		try {
			if (inputPendingHideUid.value === Infinity) {
				isHidingUser.value = false;
				return;
			}
			if (inputPendingHideUid.value === undefined || inputPendingHideUid.value === null || inputPendingHideUid.value < 1) {
				console.error("ERROR", "隐藏用户的 UID 格式不正确，不能为空或小于零");
				// TODO: 使用多语言
				useToast("隐藏用户的 UID 格式不正确", "error", 5000);
				isHidingUser.value = false;
				return;
			}

			const hideUserByUidRequest: HideUserByUidRequestDto = {
				hideUid: inputPendingHideUid.value,
			};
			const hideUserResult = await api.block.hideUserController(hideUserByUidRequest);
			if (hideUserResult.success) {
				const hideUserListResult = await getBlockList("hide", hideUserListPage.value, hideUserListPageSize.value);
				if (hideUserListResult && hideUserListResult.success) hideUserList.value = hideUserListResult.result;
				// TODO: 使用多语言
				useToast("隐藏用户成功", "success");
				closeHideUserAlert();
				inputPendingHideUid.value = Infinity;
				pendingHideUserInfo.value = undefined;
			} else {
				console.error("ERROR", "隐藏用户失败");
				// TODO: 使用多语言
				useToast("隐藏用户失败", "error", 5000);
			}
		} catch (error) {
			console.error("ERROR", "隐藏用户时出错", error);
			// TODO: 使用多语言
			useToast("隐藏用户时出错", "error", 5000);
		}
		isHidingUser.value = false;
	}

	/**
	 * 关闭待隐藏用户信息对话框
	 */
	function closeHideUserAlert() {
		isShowAlert.value = false;
		isShowAddHideUserAlert.value = false;
	}

	/**
	 * 恢复显示用户
	 * @param hideUserUid 被屏蔽的用户 UID
	 */
	async function showUser(hideUserUid: number) {
		try {
			if (hideUserUid === undefined || hideUserUid === null || hideUserUid < 1) {
				console.error("ERROR", "恢复显示用户的 UID 格式不正确，不能为空或小于零");
				// TODO: 使用多语言
				useToast("恢复显示用户的 UID 格式不正确", "error", 5000);
				return;
			}

			const showUserByUidRequest: ShowUserByUidRequestDto = {
				hideUid: hideUserUid,
			};
			const showUserResult = await api.block.showUserController(showUserByUidRequest);
			if (showUserResult.success) {
				const hideUserListResult = await getBlockList("hide", hideUserListPage.value, hideUserListPageSize.value);
				if (hideUserListResult && hideUserListResult.success) hideUserList.value = hideUserListResult.result;
				// TODO: 使用多语言
				useToast("恢复显示用户成功", "success");
			} else {
				console.error("ERROR", "解除屏蔽用户失败");
				// TODO: 使用多语言
				useToast("恢复显示用户失败", "error", 5000);
			}
		} catch (error) {
			console.error("ERROR", "解除屏蔽用户时出错", error);
			// TODO: 使用多语言
			useToast("恢复显示用户时出错", "error", 5000);
		}
	}

	/**
	 * 显示标签的上下文工具栏。
	 * @param key - 标签键名。
	 * @param tag - 标签内容。
	 * @param e - 鼠标事件。
	 */
	function showContextualToolbar(key: number, tag: string, e: MouseEvent) {
		if (!tag) return;
		if ((e.currentTarget as HTMLSpanElement).querySelector(".text-box:focus")) return;
		reshowContextualToolbar();
		if (hoveredTagContent.value?.[0] === key && hoveredTagContent.value?.[1] === tag) return;
		hoveredTagContent.value = [key, tag];
		hideExceptMe.value = true;
		useEvent("component:hideAllContextualToolbar");
		hideExceptMe.value = false;
		contextualToolbar.value = [e, "top", 0];
	}

	/**
	 * 隐藏标签的上下文工具栏。
	 */
	function hideContextualToolbar() {
		hideTimeoutId.value = setTimeout(() => {
			contextualToolbar.value = undefined;
			hoveredTagContent.value = undefined;
		}, 100);
	}

	async function removeTag(tagId: number) {
		try {
			if (tagId === undefined || tagId === null) return;

			const unblockTagRequest: UnblockTagRequestDto = {
				tagId,
			};

			const unblockTagResult = await api.block.unblockTagController(unblockTagRequest);

			if (unblockTagResult.success) {
				blockTagList.value.delete(tagId);
				// TODO: 使用多语言
				useToast("解除屏蔽 TAG 成功", "success");
			} else {
				console.error(`解除屏蔽 TAG 失败，请求失败，tagId: '${tagId}', error message: ${unblockTagResult.message}`);
				// TODO: 使用多语言
				useToast("解除屏蔽 TAG 失败，请求失败", "error", 5000);
			}
		} catch (error) {
			console.error("解除屏蔽 TAG 失败", error);
			// TODO: 使用多语言
			useToast("解除屏蔽 TAG 失败", "error", 5000);
		}
	}

	/**
	 * 屏蔽一个 TAG
	 * @param tag 标签
	 */
	async function handleAddNewBlockTag(tag: VideoTag) {
		try {
			if (!tag || !("tagId" in tag) || tag.tagId === undefined || tag.tagId === null) return;

			const blockTagRequest: BlockTagRequestDto = {
				tagId: tag.tagId,
			};

			const blockTagResult = await api.block.blockTagController(blockTagRequest);

			if (blockTagResult.success) {
				blockTagList.value.set(tag.tagId, tag);
				// TODO: 使用多语言
				useToast("屏蔽 TAG 成功", "success");
			} else {
				console.error("屏蔽 TAG 失败，请求失败", blockTagResult.message);
				// TODO: 使用多语言
				useToast("屏蔽 TAG 失败，请求失败", "error", 5000);
			}
		} catch (error) {
			console.error("屏蔽 TAG 失败", error);
			// TODO: 使用多语言
			useToast("屏蔽 TAG 失败", "error", 5000);
		}
	}

	/**
	 * 鼠标移入区域，取消自动隐藏。
	 */
	function reshowContextualToolbar() {
		clearTimeout(hideTimeoutId.value);
	}

	/**
	 * 获取屏蔽数据
	 * @param blockListType 屏蔽的类型
	 * @param page 页号
	 * @param pageSize 每页数量
	 */
	async function getBlockList(blockListType: string, page: number, pageSize: number): Promise<GetBlockListResponseDto> {
		const getBlockListRequest: GetBlockListRequestDto = {
			type: blockListType,
			pagination: {
				page,
				pageSize,
			},
		};
		const blockListResult = await api.block.getBlockListController(getBlockListRequest);
		if (blockListResult.success)
			return blockListResult;
		else {
			console.error("ERROR", `获取 ${blockListType} 类型的黑名单失败`);
			return { success: false, message: `获取 ${blockListType} 类型的黑名单失败` };
		}
	}

	/**
	 * 获取每一项屏蔽数据
	 */
	async function getAllBlockList() {
		try {
			const blockUserListResultPromise = getBlockList("block", blockUserListPage.value, blockUserListPageSize.value);
			const hideUserListResultPromise = getBlockList("hide", hideUserListPage.value, hideUserListPageSize.value);
			const blockTagListResultPromise = getBlockList("tag", blockTagListPage.value, blockTagListPageSize.value);
			const blockKeywordListResultPromise = getBlockList("keyword", blockKeywordListPage.value, blockKeywordListPageSize.value);
			const blockRegexListResultPromise = getBlockList("regex", blockRegexListPage.value, blockRegexListPageSize.value);

			const [
				// eslint-disable-next-line @stylistic/no-multi-spaces
				blockUserListResult,        hideUserListResult,        blockTagListResult,        blockKeywordListResult,        blockRegexListResult,
			] = await Promise.all([
				blockUserListResultPromise, hideUserListResultPromise, blockTagListResultPromise, blockKeywordListResultPromise, blockRegexListResultPromise,
			]);

			if (blockUserListResult && blockUserListResult.success) blockUserList.value = blockUserListResult.result;
			if (hideUserListResult && hideUserListResult.success) hideUserList.value = hideUserListResult.result;
			// if (blockTagListResult && blockTagListResult.success) blockTagList.value = blockTagListResult.result?.map(blockTag => getDisplayVideoTagWithCurrentLanguage(currentLanguage.value, blockTag.tag)) ?? [];
			if (blockTagListResult && blockTagListResult.success) blockTagList.value = new Map(blockTagListResult.result?.map(blockTag => [parseInt(blockTag.value, 10), blockTag.tag ?? { tagId: -1, tagNameList: [] }]));
			if (blockKeywordListResult && blockKeywordListResult.success) blockKeywordList.value = blockKeywordListResult.result;
			if (blockRegexListResult && blockRegexListResult.success) blockRegexList.value = blockRegexListResult.result;
		} catch (error) {
			console.error("ERROR", "获取黑名单失败", error);
			// TODO: 使用多语言
			useToast("获取黑名单失败", "error", 5000);
		}
	}

	onMounted(getAllBlockList);
</script>

<template>
	<div>
		<InfoBar type="warning" title="警告">
			该页面中的某些功能正在开发中，无法按预期工作。
			<!-- TODO: 使用多语言 -->
		</InfoBar>

		<Subheader icon="block">{{ t.blocklist.ban }}</Subheader>
		<span>{{ t.blocklist.ban.description }}</span>
		<section>
			<SettingsChipItem
				v-for="blockUser in blockUserList"
				:key="blockUser.uid"
				:image="blockUser.avatar"
				icon="placeholder"
				:details="t.addition_date + t.colon + formatLocalizationSemanticDateTime(blockUser.createDateTime, 2)"
				trailingIcon="delete"
				@trailingIconClick="unblockUser(blockUser.uid ?? -1)"
			>{{ blockUser.username }}</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="inputPendingBlockUid" type="number" icon="person" />
			<Button icon="add" @click="getPendingBlockUserInfo" :disabled="isAddButtonUnclickalbe" :loading="isFetchPendingBlockUserInfo">{{ t.step.add }}</Button>
		</div>

		<Subheader icon="visibility_off">{{ t.blocklist.hide }}</Subheader>
		<span>{{ t.blocklist.hide.description }}</span>
		<section>
			<SettingsChipItem
				v-for="hideUser in hideUserList"
				:key="hideUser.uid"
				:image="hideUser.avatar"
				icon="placeholder"
				:details="t.addition_date + t.colon + formatLocalizationSemanticDateTime(hideUser.createDateTime, 2)"
				trailingIcon="delete"
				@trailingIconClick="showUser(hideUser.uid ?? -1)"
			>{{ hideUser.username }}</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="inputPendingHideUid" type="number" icon="person" />
			<Button icon="add" @click="getPendingHideUserInfo" :disabled="isAddButtonUnclickalbe" :loading="isFetchPendingHideUserInfo">{{ t.step.add }}</Button>
		</div>

		<hr />

		<Subheader icon="tag">{{ t(2).tag }}</Subheader>
		<span>{{ t.blocklist.tag.description }}</span>
		
		<div class="tags">
			<Tag
				v-for="tag in displayBlockTagList"
				:key="tag.tagId"
				:query="{ q: tag.tagId }"
				@mouseenter="e => showContextualToolbar(tag.tagId, tag.mainTagName, e)"
				@mouseleave="hideContextualToolbar"
			>
				<div v-if="tag.tagId >= 0" class="display-tag">
					<div v-if="tag.mainTagName">{{ tag.mainTagName }}</div>
					<div v-if="tag.originTagName" class="original-tag-name">{{ tag.originTagName }}</div>
				</div>
			</Tag>
			<Tag v-if="!isAddButtonUnclickalbe" key="add-block-tag-button" class="add-tag" :checkable="false" @click="e => flyoutTag = [e, 'y']">
				<Icon name="add" />
			</Tag>
		</div>
		<FlyoutTag v-model="flyoutTag" v-model:tags="blockTagList" @addNewTag="handleAddNewBlockTag" />
		<Flyout
			v-if="!isAddButtonUnclickalbe"
			v-model="contextualToolbar"
			noPadding
			class="contextual-toolbar"
			@mouseenter="reshowContextualToolbar"
			@mouseleave="hideContextualToolbar"
		>
			<Button icon="close" @click="removeTag(hoveredTagContent![0])">{{ t.delete }}</Button>
		</Flyout>

		<Subheader icon="key">{{ t(2).keyword }}</Subheader>
		<span>{{ t.blocklist.keyword.description }}</span>
		<section>
			<SettingsChipItem v-for="(blockKeyword, index) in blockKeywordList" :key="index + '-' + blockKeyword.value" :details="t.addition_date + t.colon + formatLocalizationSemanticDateTime(blockKeyword.createDateTime, 2)" trailingIcon="delete" @trailingIconClick="remove">{{ blockKeyword.value }}</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="add" icon="key" />
			<Button icon="add" :disabled="isAddButtonUnclickalbe">{{ t.step.add }}</Button>
		</div>

		<Subheader icon="regexp">{{ t.regexp }}</Subheader>
		<span>{{ t.blocklist.regexp.description }}</span>
		<section>
			<SettingsChipItem v-for="(blockRegex, index) in blockRegexList" :key="index + '-' + blockRegex.value" :details="t.addition_date + t.colon + formatLocalizationSemanticDateTime(blockRegex.createDateTime, 2)" trailingIcon="delete" @trailingIconClick="remove">{{ blockRegex.value }}</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="add" icon="regexp" />
			<Button icon="add" :disabled="isAddButtonUnclickalbe">{{ t.step.add }}</Button>
		</div>
	</div>

	<Alert v-model="isShowAddBlockUserAlert" static>
		<!-- TODO: 使用多语言 -->
		<h4>确定要屏蔽这个用户吗？</h4>
		<div class="user-info-alert-display">
			<div class="user">
				<UserAvatar :avatar="pendingBlockUserInfo?.avatar" />
				<div class="texts">
					<div class="names">
						<span class="username">{{ pendingBlockUserInfo?.username }}</span> <span v-if="pendingBlockUserInfo?.userNickname">/{{ pendingBlockUserInfo?.userNickname }}</span>
						<!-- <span v-if="memoParen" class="memo" :class="[memoParen]">{{ user?.bio }}</span> -->
						<span class="icons">
							<Icon v-if="pendingBlockUserInfo?.gender === 'male'" name="male" class="male" />
							<Icon v-else-if="pendingBlockUserInfo?.gender === 'female'" name="female" class="female" />
							<span v-else class="other-gender">{{ pendingBlockUserInfo?.gender }}</span>
						</span>
					</div>
					<div class="bio">{{ pendingBlockUserInfo?.signature }}</div>
				</div>
			</div>
		</div>
		<template #footer-left>
			<Button @click="blockUser" :loading="isBlockingUser" :disabled="isBlockingUser">确认屏蔽</Button>
		</template>
		<template #footer-right>
			<Button @click="closeBlockUserAlert" class="secondary">取消</Button>
		</template>
	</Alert>

	<Alert v-model="isShowAddHideUserAlert" static>
		<!-- TODO: 使用多语言 -->
		<h4>确定要隐藏这个用户吗？</h4>
		<div class="user-info-alert-display">
			<div class="user">
				<UserAvatar :avatar="pendingHideUserInfo?.avatar" />
				<div class="texts">
					<div class="names">
						<span class="username">{{ pendingHideUserInfo?.username }}</span> <span v-if="pendingHideUserInfo?.userNickname">/{{ pendingHideUserInfo?.userNickname }}</span>
						<!-- <span v-if="memoParen" class="memo" :class="[memoParen]">{{ user?.bio }}</span> -->
						<span class="icons">
							<Icon v-if="pendingHideUserInfo?.gender === 'male'" name="male" class="male" />
							<Icon v-else-if="pendingHideUserInfo?.gender === 'female'" name="female" class="female" />
							<span v-else class="other-gender">{{ pendingHideUserInfo?.gender }}</span>
						</span>
					</div>
					<div class="bio">{{ pendingHideUserInfo?.signature }}</div>
				</div>
			</div>
		</div>
		<template #footer-left>
			<Button @click="hideUser" :loading="isHidingUser" :disabled="isHidingUser">确认隐藏</Button>
		</template>
		<template #footer-right>
			<Button @click="closeHideUserAlert" class="secondary">取消</Button>
		</template>
	</Alert>
</template>

<style scoped lang="scss">
	span {
		color: c(icon-color);
	}

	.subheader {
		margin-top: 1rem;

		&:first-child {
			margin-top: 0;
		}
	}

	.add {
		display: flex;
		gap: 8px;

		.text-box {
			width: 100%;
		}

		button {
			flex-shrink: 0;
		}
	}

	hr {
		margin-top: 1rem;
	}
	
	.user-info-alert-display {
		height: 60px;

		.user {
			display: flex;
			gap: 16px;
			align-items: center;
			margin-top: 20px;

			.names {
				display: flex;
				font-size: 24px;

				> * {
					flex-shrink: 0;
					user-select: text;
				}

				.username {
					color: c(text-color);
					font-weight: bold;

					+ .icons {
						margin-left: 10px;
					}
				}

				.memo {
					color: c(icon-color);

					&.fullwidth {
						&::before {
							content: "（";
						}

						&::after {
							content: "）";
						}
					}

					&.halfwidth {
						&::before {
							content: "\a0(";
						}

						&::after {
							content: ")\a0";
						}
					}
				}

				.icons {
					@include flex-center;

					.male {
						color: c(blue);
					}

					.female {
						color: c(pink);
					}

					.other-gender {
						background: linear-gradient(to right, #58c8f2, #eda4b2);
						background-clip: text;
						-webkit-text-fill-color: transparent;
					}
				}
			}

			.bio {
				margin-top: 6px;
				color: c(icon-color);
				user-select: text;
			}
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;

		.add-tag {
			aspect-ratio: 1 / 1;
			padding: 6px;
			color: c(icon-color);
			font-size: 18px;
		}
	}

	.display-tag {
		display: flex;
		flex-direction: row;

		.original-tag-name {
			padding-left: 0.5em;
			color: c(text-color, 50%);
		}
	}
</style>
