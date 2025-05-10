<script setup lang="ts">

</script>

<template>
	<div class="container">
		<div class="feed">
			<UserContent
				v-for="i in 10"
				:key="i" uid="1"
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
		@include chip-shadow;
		@include round-large;
		padding: 16px;
	}
</style>
