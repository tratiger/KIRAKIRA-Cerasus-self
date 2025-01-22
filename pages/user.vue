<script lang="ts">
	export const tabs = [
		{ id: "", icon: "home" },
		// { id: "series", icon: "video_library" },
		{ id: "video", icon: "movie" },
		// { id: "audio", icon: "music" },
		// { id: "photo", icon: "photo_library" },
		{ id: "favorites", icon: "star" },
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

	const isSelf = ref(false); // 当前页面是否是自己
	const isFollowing = ref(false); // 当前页面中的用户是否已经关注
	const isFollowingUser = ref(false); // 是否正在发送关注用户的请求
	const userInfo = ref<GetUserInfoByUidResponseDto["result"]>(); // 用户信息（并非自己的用户信息）
	const actionMenu = ref<FlyoutModel>();
	const currentTab = computed(() => currentUserTab());

	const urlUid = ref(); // URL 中的 UID
	urlUid.value = currentUserUid(); // SSR
	const nuxtApp = useNuxtApp();
	nuxtApp.hook("page:finish", () => {
		urlUid.value = currentUserUid(); // CSR
	});
	
	const selfUid = computed(() => userSelfInfoStore.userInfo.uid); // 自己的 UID（如果已经登陆）

	/**
	 * 关注当前 URL 所对应的用户。
	 */
	async function followingUser() {
		isFollowingUser.value = true;
		try {
			const followingUploaderRequest: FollowingUploaderRequestDto = {
				followingUid: urlUid.value ?? -1,
			};
			const { data } = await api.feed.followingUploader(followingUploaderRequest);
			if (data.value?.success) {
				isFollowing.value = true;
				// TODO: 使用多语言
				useToast("关注成功", "success");
			} else
				// TODO: 使用多语言
				useToast("关注失败，请刷新页面后重试", "error", 5000);
		} catch (error) {
			// TODO: 使用多语言
			useToast("关注用户时出错，请刷新页面后重试", "error", 5000);
			console.error("ERROR", "关注用户时出错：", error);
		}
		isFollowingUser.value = false;
	}

	/**
	 * fetch user profile data
	*/
	async function fetchUserData() {
		if (urlUid.value === userSelfInfoStore.userInfo.uid)
			isSelf.value = true;
		else {
			isSelf.value = false;
			const getUserInfoByUidRequest: GetUserInfoByUidRequestDto = {
				uid: urlUid.value,
			};
			const headerCookie = useRequestHeaders(["cookie"]);
			const userInfoResult = await api.user.getUserInfo(getUserInfoByUidRequest, headerCookie);
			if (userInfoResult.success) {
				isFollowing.value = !!userInfoResult.result?.isFollowing;
				userInfo.value = userInfoResult.result;
			}
		}
	}

	await fetchUserData();
	watch(() => [urlUid.value, selfUid.value], fetchUserData);

	const titleAffixString = t.user_page.title_affix; // HACK: Bypass "A composable that requires access to the Nuxt instance was called outside of a plugin."
	const titleUserNickname = computed(() => isSelf.value ? userSelfInfoStore.userInfo.userNickname ? titleAffixString(userSelfInfoStore.userInfo.userNickname) : "" : userInfo.value?.userNickname ? titleAffixString(userInfo.value?.userNickname) : "");
	useHead({ title: titleUserNickname });
</script>

<template>
	<div>
		<header>
			<div>
				<div class="content">
					<UserContent
						v-tooltip="isSelf ? t.profile.edit : undefined"
						:avatar="isSelf ? userSelfInfoStore.userInfo.avatar : userInfo?.avatar"
						:username="isSelf ? userSelfInfoStore.userInfo.username : userInfo?.username"
						:nickname="isSelf ? userSelfInfoStore.userInfo.userNickname : userInfo?.userNickname"
						:gender="isSelf ? userSelfInfoStore.userInfo.gender : userInfo?.gender"
						:to="isSelf ? `/settings/profile` : undefined"
						size="huge"
						center
					>
						<template #description>
							{{ isSelf ? userSelfInfoStore.userInfo.signature : userInfo?.signature }}
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
							<MenuItem icon="block">{{ t.add_to_blocklist }}</MenuItem>
						</Menu>
						<div v-if="!isSelf" class="follow-button">
							<Button v-if="!isFollowing" icon="add" :disabled="isFollowingUser" :loading="isFollowingUser" @click="followingUser">{{ t.follow_verb }}</Button>
							<!-- TODO: !user.isFollowing -->
							<Button v-else icon="check" disabled>{{ t.following }}</Button>
						</div>
						<Button v-if="isSelf">{{ t.manage_content }}</Button>
					</div>
				</div>
				<TabBar v-model="currentTab">
					<TabItem v-for="tab in tabs" :id="tab.id" :key="tab.id" :icon="tab.icon" :to="`/user/${urlUid}/${tab.id}`">{{ t[tab.id || "home"] }}</TabItem>
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
