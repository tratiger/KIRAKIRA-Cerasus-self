<script lang="ts">
	export const tabs = [
		{ id: "", icon: "home" }, // 首页，Markdown自我介绍放在顶部（类似GitHub），下方为显示用户发布的所有内容，类似于「关注（/feed/following）」页面
		{ id: "videos", name: "video", icon: "movie" }, // 视频
		// { id: "series", icon: "video_library" }, // 系列
		// { id: "posts", name: "post", icon: "post" }, // 帖子
		// { id: "audios", icon: "music" }, // 音频
		// { id: "albums", icon: "photo_library" }, // 相簿或者相册，类似QQ空间相册，所有帖子配图默认也会放在这里，相簿名称可以直接叫「帖子」。
		{ id: "collections", name: "collection", icon: "star" },
	];
</script>

<script setup lang="ts">
	definePageMeta({
		pageTransition: {
			name: "page-jump",
			mode: "out-in",
		},
		async middleware(to, from) {
			const { tabs } = await import("./user.vue");
			if (to.meta.pageTransition && typeof to.meta.pageTransition !== "boolean") {
				const [path, prevPath] = [removeI18nPrefix(to.path), removeI18nPrefix(from.path)];
				if (path.startsWith("/user/") && prevPath.startsWith("/user/")) {
					const [tab, prevTab] = [path.split("/")[3], prevPath.split("/")[3]];
					const [index, prevIndex] = [tabs.findIndex(i => i.id === tab), tabs.findIndex(i => i.id === prevTab)];
					if (index !== prevIndex)
						to.meta.pageTransition.name = index > prevIndex ? "right" : index < prevIndex ? "left" : "";
				} else
					to.meta.pageTransition.name = "page-jump";
			}
		},
	});

	const userSelfInfoStore = useSelfUserInfoStore();

	const isSelf = ref(false);
	const isFollowed = ref(false); // TODO
	const actionMenu = ref<FlyoutModel>();
	const userInfo = ref<GetUserInfoByUidResponseDto["result"]>();

	const urlUid = ref();
	// SSR
	urlUid.value = currentUserUid();
	// CSR
	const nuxtApp = useNuxtApp();
	nuxtApp.hook("page:finish", () => {
		urlUid.value = currentUserUid();
	});

	watch(urlUid, fetchUserData, { deep: false });

	const selfUid = computed(() => userSelfInfoStore.uid);
	watch(selfUid, fetchUserData, { deep: false });

	const currentTab = computed(() => currentUserTab());

	/** fetch the user profile data */
	async function fetchUserData() {
		if (userSelfInfoStore.isLogined && urlUid.value === userSelfInfoStore.uid) {
			isSelf.value = true;
			await api.user.getSelfUserInfo(); // 获取当前登录用户的用户信息
		} else {
			isSelf.value = false;
			const getUserInfoByUidRequest: GetUserInfoByUidRequestDto = {
				uid: urlUid.value,
			};
			const userInfoResult = await api.user.getUserInfo(getUserInfoByUidRequest); // 获取当前 URL 指向的用户的信息
			if (userInfoResult.success)
				userInfo.value = userInfoResult.result;
		}
	}

	fetchUserData();

	const titleAffixString = t.user_page.title_affix; // HACK: Bypass "A composable that requires access to the Nuxt instance was called outside of a plugin."

	const titleUserNickname = computed(() => isSelf.value ? userSelfInfoStore.userNickname ? titleAffixString(userSelfInfoStore.userNickname) : "" : userInfo.value?.userNickname ? titleAffixString(userInfo.value?.userNickname) : "");

	// const titleUserName = computed(() => isSelf.value ? "aaa" : "bbb");

	useHead({ title: titleUserNickname });
</script>

<template>
	<div>
		<header>
			<div>
				<div class="content">
					<UserContent
						v-tooltip="isSelf ? t.profile.edit : undefined"
						:avatar="isSelf ? userSelfInfoStore.userAvatar : userInfo?.avatar"
						:username="isSelf ? userSelfInfoStore.username : userInfo?.username"
						:nickname="isSelf ? userSelfInfoStore.userNickname : userInfo?.userNickname"
						:gender="isSelf ? userSelfInfoStore.gender : userInfo?.gender"
						:to="isSelf ? `/settings/profile` : undefined"
						size="huge"
						center
					>
						<template #description>
							{{ isSelf ? userSelfInfoStore.signature : userInfo?.signature }}
						</template>
					</UserContent>
					<div class="actions">
						<!-- <SoftButton v-tooltip:top="'私信'" icon="email" /> -->
						<SoftButton v-if="!isSelf" v-tooltip:top="t.more" icon="more_vert" @click="e => actionMenu = [e, 'y']" />
						<Menu v-if="!isSelf" v-model="actionMenu">
							<MenuItem icon="badge">{{ t.modify_memo }}</MenuItem>
							<MenuItem icon="groups">{{ t.add_to_group }}</MenuItem>
							<hr />
							<MenuItem v-tooltip:x="'老铁们，给我举报他！'" icon="flag">{{ t.report }}</MenuItem>
							<MenuItem icon="block">{{ t.block_user }}</MenuItem>
						</Menu>
						<div v-if="!isSelf" class="follow-button">
							<Button v-if="!isFollowed" icon="add" @click="isFollowed = true">{{ t.follow_verb }}</Button>
							<!-- TODO: !user.isFollowed -->
							<Button v-else icon="check" @click="isFollowed = false">{{ t.following }}</Button>
						</div>
						<Button v-if="isSelf">{{ t.manage_content }}</Button>
					</div>
				</div>
				<TabBar v-model="currentTab">
					<TabItem v-for="tab in tabs" :id="tab.id" :key="tab.id" :icon="tab.icon" :to="`/user/${urlUid}/${tab.id}`">{{ t(2)[tab.name || "home"] }}</TabItem>
				</TabBar>
			</div>
		</header>
		<div class="slot">
			<NuxtPage />
		</div>
	</div>
</template>

<style scoped lang="scss">
	$header-height: 134px;
	$main-margin-top: 32px;

	header {
		@include card-shadow;
		position: sticky;
		top: 0;
		z-index: 4;
		padding: 0 $page-padding-x;
		background-color: c(surface-color);

		@include tablet {
			padding: 0 $page-padding-x-tablet;
		}

		@include mobile {
			padding: 0 $page-padding-x-mobile;
		}
	}

	.content {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: space-between;
		align-items: center;
		padding: 24px 0;

		.actions {
			display: flex;
			gap: 16px;
			justify-content: flex-end;
			align-items: center;
			margin-left: auto;

			.soft-button {
				--ripple-size: var(--wrapper-size);
			}
		}
	}

	.tab-bar {
		--clipped: true;
		--loose: true;
		--size: big;
		margin: 0 (-$page-padding-x);

		&:deep(.items) {
			padding: 0 $page-padding-x;
		}
	}

	.slot:deep(.container) {
		display: flex;
		gap: 20px;
		align-items: flex-start;
		padding: $main-margin-top $page-padding-x;

		@include tablet {
			flex-direction: column-reverse;
			padding: $page-padding-x-tablet;

			.toolbox-card {
				width: 100%;
			}
		}

		@include mobile {
			padding: $page-padding-x-mobile;
		}

		> .left,
		> .right {
			flex-shrink: 0;

			@include computer {
				position: sticky;
				top: $header-height + $main-margin-top;
			}
		}

		> .center {
			width: 100%;
		}

		&:has(> .center):has(> .left):has(> .right) {
			@media (width < 1280px) {
				flex-direction: column;

				.toolbox-card {
					width: 100%;
				}

				> .left,
				> .right {
					position: static;
				}

				> .right {
					order: 1;
				}

				> .center {
					order: 2;
				}
			}
		}

		.sort {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	header,
	main {
		@include tablet {
			padding: 0 $page-padding-x-tablet;

			.tab-bar {
				margin: 0 (-$page-padding-x-tablet);

				&:deep(.items) {
					padding: 0 $page-padding-x-tablet;
				}
			}
		}

		@include mobile {
			padding: 0 $page-padding-x-mobile;

			.tab-bar {
				margin: 0 (-$page-padding-x-mobile);

				&:deep(.items) {
					padding: 0 calc($page-padding-x-mobile / 2);
				}
			}
		}
	}
</style>
