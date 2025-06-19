<script setup lang="ts">
	const props = defineProps<{
		/** 头像网址。 */
		avatar?: string;
		/** 昵称。 */
		nickname: string;
		/** 用户名。 */
		username: string;
		/** 角色。 */
		roles?: string[];
		/** 粉丝数。 */
		followers: number;
		/** 是否已关注？ */
		isFollowing?: boolean;
		/** 是否是自己？ */
		isSelf?: boolean;
		/** 用户 UID。 */
		uid?: number;
	}>();

	const isFollowing = ref(props.isFollowing); // 是否正在关注
	const isFollowingUploader = ref(false); // 是否正在关注一个用户

	/**
	 * 跳转到个人主页
	 */
	function jumpToSelfPage() {
		navigate(`/user/${props.uid}`);
	}

	/**
	 * 关注上传者。
	 */
	async function followingUploader() {
		isFollowingUploader.value = true;
		try {
			const followingUploaderRequest: FollowingUploaderRequestDto = {
				followingUid: props.uid ?? -1,
			};
			const { data } = await api.feed.followingUploader(followingUploaderRequest);
			if (data.value?.success)
				isFollowing.value = true;
			else
				useToast(t.toast.something_went_wrong, "error", 5000);
		} catch (error) {
			useToast(t.toast.something_went_wrong, "error", 5000);
			console.error("ERROR", "关注用户时出错：", error);
		}
		isFollowingUploader.value = false;
	}
</script>

<template>
	<Comp>
		<UserContent :avatar="avatar" :nickname="nickname" :followers="followers" :uid="uid" center>
			<template #description>
				{{ followers }} {{ t(followers).follower }}
			</template>
		</UserContent>
		<!-- TODO: 使用多语言 -->
		<Button v-if="isSelf" @click="jumpToSelfPage">个人主页</Button>
		<Button v-else-if="!isFollowing" icon="add" :disabled="isFollowingUploader" :loading="isFollowingUploader" @click="followingUploader">{{ t.follow_verb }}</Button>
		<Button v-else disabled icon="check">{{ t.following }}</Button>
	</Comp>
</template>

<style scoped lang="scss">
	:comp {
		display: flex;
		gap: 12px;
		align-items: center;

		> :not(.user-content) {
			flex-shrink: 0;
		}

		.user-content {
			width: 100%;
		}
	}
</style>
