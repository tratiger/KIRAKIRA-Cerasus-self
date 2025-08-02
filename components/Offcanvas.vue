<docs>
	# 缩放式侧滑导航菜单（类旧版手机 QQ）
</docs>

<script setup lang="ts">
	const shown = defineModel<boolean>({ default: false });

	const drawerItems: { name: string; icon: DeclaredIcons; route?: string }[] = [
		{ name: t.history, icon: "history", route: "/history" },
		{ name: t(2).collection, icon: "star", route: "/collections" },
		{ name: t.upload, icon: "upload", route: "/upload" },
	];

	/**
	 * 前往路由。
	 * @param route - 路由。
	 */
	function to(route?: string) {
		if (route === undefined) return;
		shown.value = false;
		navigate(route);
	}

	const selfUserInfoStore = useSelfUserInfoStore();

	/**
	 * 点击用户头像事件。未登录时提示登录，已登录时导航到个人主页。
	 */
	function onClickUser() {
		shown.value = false;
		if (!selfUserInfoStore.isLogined) useEvent("app:requestLogin");
		else to("/user");
	}
</script>

<template>
	<Comp>
		<div class="top">
			<div class="logo">
				<LogoText />
				<div class="stripes"></div>
			</div>
			<div class="user" @click="onClickUser">
				<UserAvatar
					v-tooltip="selfUserInfoStore.isLogined ? selfUserInfoStore.userInfo.userNickname : t.login"
					:avatar="selfUserInfoStore.isLogined ? selfUserInfoStore.userInfo.avatar : undefined"
				/>
				<div class="user-info">
					<p class="nickname">{{ selfUserInfoStore.isLogined ? selfUserInfoStore.userInfo.userNickname : t.pleaseLogin }}</p>
					<p v-if="selfUserInfoStore.isLogined" class="username">@{{ selfUserInfoStore.userInfo.username }}</p>
					<p v-if="selfUserInfoStore.isLogined && selfUserInfoStore.userInfo.signature" class="bio">{{ selfUserInfoStore.userInfo.signature }}</p>
				</div>
				<Icon name="chevron_right" />
			</div>
		</div>
		<div class="grid">
			<div v-for="item in drawerItems" :key="item.icon" v-ripple class="drawer-item" @click="to(item.route)">
				<Icon :name="item.icon" />
				<label>{{ item.name }}</label>
			</div>
		</div>
		<div class="tab-bar vertical"><!-- 假装是 TabBar -->
			<TabItem id="settings" v-ripple icon="settings" _internalIsVertical @click="to('/settings')">{{ t.settings }}</TabItem>
		</div>
	</Comp>
</template>

<style scoped lang="scss">
	:comp {
		display: flex;
		flex-direction: column;
		justify-content: start;
		width: 70dvw;
		padding-inline: 24px;
	}

	.user {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 12px 8px;
		background-color: c(accent, 20%);
		cursor: pointer;

		.user-info {
			width: 100%;
		}

		.nickname {
			font-size: 16px;
			font-weight: bold;
		}

		.username {
			margin-top: 4px;
			color: c(icon-color);
			font-size: 12px;
		}

		.bio {
			font-size: 12px;
		}

		.icon {
			color: c(icon-color);
			font-size: 20px;
		}

		&:any-hover:not(:active) {
			--hover: true;
			background-color: c(accent, 40%);
		}
	}

	.tab-bar {
		margin: 0 -14px -12px;
	}

	.grid {
		@include round-extra-large;
		@include system-card;
		@include mini-card-shadow;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		align-items: start;
		height: 100%;
		margin-block: 48px 4px;
		padding: 14px;
		background-color: c(accent, 40%);

		.drawer-item {
			@include round-large;
			@include card-in-card-shadow;
			display: flex;
			flex-direction: column;
			gap: 4px;
			align-items: center;
			padding-block: 12px;
			color: c(icon-color);
			font-size: 13px;
			background-color: c(main-bg, 50%);
			cursor: pointer;

			.icon {
				font-size: 32px;
			}

			&:any-hover {
				@include chip-shadow;
			}

			&:active {
				@include button-scale-pressed;
			}

			&:nth-child(3n + 1) {
				border-top-left-radius: 12px;
				border-bottom-left-radius: 12px;
			}

			&:nth-child(3n + 3) {
				border-top-right-radius: 12px;
				border-bottom-right-radius: 12px;
			}
		}
	}

	.top {
		@include round-extra-large;
		@include system-card;
		@include mini-card-shadow;
		flex-shrink: 0;
		overflow: hidden;

		.logo {
			--fill-color: #{c(accent-10)};
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 50px;
			padding-inline: 16px 32px;
			background-color: c(accent, 80%);

			html.dark & {
				--fill-color: #{c(accent-90)};
			}

			.logo-text {
				--form: half;
				color: c(fill-color);
			}

			.stripes {
				width: 39px;
				height: 100%;
				border-inline: 11px solid c(fill-color);
				transform: skewX(33deg);
			}
		}
	}
</style>
