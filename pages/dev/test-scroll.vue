<script setup lang="ts">

</script>

<template>
	<div class="content">
		<NuxtPicture src="/static/images/palettes/blue.png" />
		<div v-for="i in 100" :key="i" class="item">Item {{ i }}</div>
		<NuxtPicture src="/static/images/palettes/pink.png" />
	</div>
</template>

<style scoped lang="scss">
	picture,
	picture :deep(img) {
		width: 120%;
	}
</style>
