<script setup lang="ts">
	const props = defineProps<{
		/** 头像网址。 */
		avatar?: string;
		/** 昵称。 */
		nickname: string;
		/** 用户名。 */
		username: string;
		/** 粉丝数。 */
		followers: number;
		/** 是否已关注？ */
		isFollowing?: boolean;
		/** 用户 UID。 */
		uid?: number;
	}>();
</script>

<template>
	<Comp>
		<UserContent :avatar="avatar" :nickname="nickname" :followers="followers" :uid="uid" center>
			<template #description>
				{{ followers }} {{ t(followers).follower }}
			</template>
		</UserContent>
		<Button v-if="!isFollowing" icon="add">{{ t.follow_verb }}</Button>
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
