<script setup lang="ts">
	const add = ref("");
	const remove = useNoop;
	const currentLanguage = computed(getCurrentLocale); // 当前用户的语言
	const flyoutTag = ref<FlyoutModel>();

	const blockUserList = ref<GetBlockListResponseDto["result"]>();
	const blockUserListPage = ref(0);
	const blockUserListPageSize = ref(0);

	const hideUserList = ref<GetBlockListResponseDto["result"]>();
	const hideUserListPage = ref(0);
	const hideUserListPageSize = ref(0);

	// const blockTagList = ref<DisplayVideoTag[]>();
	const blockTagList = ref<Map<VideoTag["tagId"], VideoTag>>(new Map()); // 视频标签
	const displayBlockTagList = computed<DisplayVideoTag[]>(() => [...blockTagList.value.values()].map(tagName => getDisplayVideoTagWithCurrentLanguage(currentLanguage.value, tagName))); // 用于显示的 TAG，相较于上方的 tags 数据结构更简单。
	
	const blockTagListPage = ref(0);
	const blockTagListPageSize = ref(0);

	const blockKeywordList = ref<GetBlockListResponseDto["result"]>();
	const blockKeywordListPage = ref(0);
	const blockKeywordListPageSize = ref(0);

	const blockRegexList = ref<GetBlockListResponseDto["result"]>();
	const blockRegexListPage = ref(0);
	const blockRegexListPageSize = ref(0);

	const contextualToolbar = ref<FlyoutModel>(); // TAG 的工具烂浮窗
	const hoveredTagContent = ref<[number, string]>(); // 鼠标 hover 的 TAG
	const hideExceptMe = ref(false);
	const hideTimeoutId = ref<Timeout>();

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
		// TODO
	}

	async function handleAddNewBlockTag(tag: VideoTag) {
		
	}

	/**
	 * 鼠标移入区域，取消自动隐藏。
	 */
	function reshowContextualToolbar() {
		clearTimeout(hideTimeoutId.value);
	}

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
			return { success: false, message: "获取 ${blockListType} 类型的黑名单失败" };
		}
	}

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
			<SettingsChipItem v-for="blockUser in blockUserList" :key="blockUser.uid" icon="placeholder" :details="t.addition_date + t.colon + formatLocalizationSemanticDateTime(blockUser.createDateTime, 2)" trailingIcon="delete" @trailingIconClick="remove">{{ blockUser.username }}</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="add" icon="person" />
			<Button icon="add">{{ t.step.add }}</Button>
		</div>

		<Subheader icon="visibility_off">{{ t.blocklist.hide }}</Subheader>
		<span>{{ t.blocklist.hide.description }}</span>
		<section>
			<SettingsChipItem v-for="hideUser in hideUserList" :key="hideUser.uid" icon="placeholder" :details="t.addition_date + t.colon + formatLocalizationSemanticDateTime(hideUser.createDateTime, 2)" trailingIcon="delete" @trailingIconClick="remove">{{ hideUser.username }}</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="add" icon="person" />
			<Button icon="add">{{ t.step.add }}</Button>
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
			<Tag key="add-tag-button" class="add-tag" :checkable="false" @click="e => flyoutTag = [e, 'y']">
				<Icon name="add" />
			</Tag>
		</div>
		<FlyoutTag v-model="flyoutTag" v-model:tags="blockTagList" @addNewTag="handleAddNewBlockTag" />
		<Flyout
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
			<SettingsChipItem :details="t.addition_date + t.colon" trailingIcon="delete" @trailingIconClick="remove">keyword</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="add" icon="key" />
			<Button icon="add">{{ t.step.add }}</Button>
		</div>

		<Subheader icon="regexp">{{ t.regexp }}</Subheader>
		<span>{{ t.blocklist.regexp.description }}</span>
		<section>
			<SettingsChipItem :details="t.addition_date + t.colon" trailingIcon="delete" @trailingIconClick="remove">regexp</SettingsChipItem>
		</section>
		<div class="add">
			<TextBox v-model="add" icon="regexp" />
			<Button icon="add">{{ t.step.add }}</Button>
		</div>
	</div>
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
