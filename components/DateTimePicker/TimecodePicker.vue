<docs>
	# 时间码选择器
</docs>

<script setup lang="ts">
	const value = defineModel<Duration>({ required: true });
	const fields: BaseDateTimePickerField<number>[] = [
		{ name: "hour", sep: "∶", values: forMap(100, Number, 0), getDisplayValue: padTo2Digit },
		{ name: "minute", sep: "∶", values: forMap(60, Number, 0), getDisplayValue: padTo2Digit },
		{ name: "second", values: forMap(60, Number, 0), getDisplayValue: padTo2Digit },
	];
	const model = computed({
		get: () => ({ hour: value.value.h, minute: value.value.m, second: value.value.s }),
		set: ({ hour, minute, second }) => new Duration(hour, minute, second),
	});
</script>

<template>
	<BaseDateTimePicker :fields v-model="model" />
</template>
