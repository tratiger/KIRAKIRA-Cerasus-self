<script setup lang="ts">
	const selfUserInfoStore = useSelfUserInfoStore();
	const userBirthdayDisplay = computed(() => selfUserInfoStore.userInfo.birthday ? formatDateWithLocale(new Date(selfUserInfoStore.userInfo.birthday)) : "Unknown"); // TODO: 生日功能
	const registerDateDisplay = computed(() => selfUserInfoStore.userInfo.userCreateDateTime ? formatDateWithLocale(new Date(selfUserInfoStore.userInfo.userCreateDateTime)) : "Unknown");
</script>

<template>
	<div>
		<div class="user-profile">
			<UserContent
				v-tooltip="t.profile.edit"
				:avatar="selfUserInfoStore.userInfo.avatar"
				:username="selfUserInfoStore.userInfo.username"
				:nickname="selfUserInfoStore.userInfo.userNickname"
				:gender="selfUserInfoStore.userInfo.gender"
				:to="'/settings/profile'"
				size="huge"
				center
			>
				<template #description>
					{{ selfUserInfoStore.userInfo.signature }}
				</template>
			</UserContent>
		</div>

		<div class="user-counts chip">
			<div>
				<span class="value">233</span>
				<p>{{ t.following }}</p>
			</div>
			<div>
				<span class="value">233</span>
				<p>{{ t(0).follower }}</p>
			</div>
			<div>
				<span class="value">233</span>
				<p>{{ t.watched }}</p>
			</div>
			<div>
				<span class="value">233</span>
				<p>{{ t.rating }}</p>
			</div>
		</div>

		<div class="user-info chip">
			<SettingsChipItem icon="birthday" :details="userBirthdayDisplay">{{ t.user.birthday }}</SettingsChipItem>
			<SettingsChipItem icon="history" :details="registerDateDisplay">{{ t.user.join_time }}</SettingsChipItem>
			<SettingsChipItem icon="fingerprint" :details="selfUserInfoStore.isLogined ? selfUserInfoStore.uid : undefined">UID</SettingsChipItem>
			<SettingsChipItem icon="gift" :details="`TODO`">使用邀请码</SettingsChipItem>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.user-profile {
		display: flex;
		width: fit-content;
		cursor: pointer;
	}

	.user-counts {
		display: flex;
		justify-content: space-around;
		padding: 14px 0;

		> div {
			@include flex-center;
			flex-direction: column;
			width: 25%;

			span {
				font-size: 24px;
				font-weight: bold;
			}

			p {
				color: c(icon-color);
			}
		}
	}
</style>
