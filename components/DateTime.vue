<script setup lang="ts">
	const props = defineProps<{
		/** 日期时间对象。 */
		dateTime: Date | null;
		/** 是否同时显示时间？ */
		showTime?: boolean;
	}>();

	const isValidDate = computed(() => props.dateTime instanceof Date && !Number.isNaN(props.dateTime.valueOf()));
</script>

<template>
	<time :datetime="isValidDate ? dateTime?.toISOString() : undefined"><slot>{{ formatDateWithLocale(isValidDate ? dateTime : null, { time: showTime }) }}</slot></time>
</template>
