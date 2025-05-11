<docs>
	关注。

	显示比如关注的用户发了新东西、关注的收藏夹有了更新等。
	当前只支持显示视频。
</docs>

<script setup lang="ts">
	const loadingMore = ref(true);
</script>

<template>
	<div class="container">
		<!-- TODO: 切换视图 -->
		<div class="feed">
			<UserContent
				v-for="i in 10"
				:key="i"
				:uid="1"
				nickname="占位符"
				username="占位符"
			>
				<template #description>
					<DateTime :dateTime="new Date()" showTime />
				</template>
				<ThumbGrid view="list">
					<ThumbVideo
						:videoId="1"
					>
						占位符
					</ThumbVideo>
				</ThumbGrid>
			</UserContent>
			<div class="bottom">
				<ProgressRing v-if="loadingMore" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.feed {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.user-content {
		@include card-shadow;
		@include round-large;
		padding: 16px;
	}

	.bottom {
		@include flex-center;
		width: 100%;
	}
</style>
