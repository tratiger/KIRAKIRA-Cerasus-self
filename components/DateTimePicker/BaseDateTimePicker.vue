<docs>
	# 日期/时间/时间码选择器的基础选择器
</docs>

<script setup lang="ts">
	const props = defineProps<{
		/** 基础日期时间选择器字段。 */
		fields: BaseDateTimePickerField[];
	}>();

	const model = defineModel<Record<string, Readable>>({ required: true });
	const showMenu = ref(false);
</script>

<template>
	<Comp role="application" v-ripple :aria-expanded="showMenu" tabindex="0">
		<template v-for="({ name, sep, getDisplayValue }, index) in props.fields" :key="name">
			<p class="value">{{ getDisplayValue?.(model[name]) ?? model[name] }}</p>
			<p v-if="sep && index < props.fields.length - 1" class="sep">{{ sep }}</p>
		</template>
	</Comp>
</template>

<style scoped lang="scss">
	:comp {
		@include chip-shadow;
		@include round-large;
		display: flex;
		gap: 9px;
		justify-content: space-evenly;
		align-items: stretch;
		width: fit-content;
		height: 36px;
		padding-inline: 16px;

		&:active {
			background-color: c(main-bg);
			box-shadow: none !important;
		}

		&:focus {
			@include button-shadow-unchecked-focus;
		}

		&:any-hover {
			@include button-shadow-unchecked-hover;
			background-color: c(gray-5);
		}

		&:any-hover:focus {
			@include button-shadow-unchecked-hover-focus;
		}

		p {
			align-content: center;
			color: c(icon-color);
			font-weight: 500;
			font-variant-numeric: tabular-nums;
		}

		.sep {
			opacity: 0.5;
		}
	}
</style>
