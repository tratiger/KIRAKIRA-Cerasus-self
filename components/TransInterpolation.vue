<docs>
	# 允许你在 i18n 的字符串插值中插入其它组件。

	基于 Vue I18n 官方的 `<I18nT>` 组件对项目进行适配。
</docs>

<script setup lang="ts">
	const props = defineProps<{
		/** i18n 键。 */
		keypath: string;
	}>();
</script>

<template>
	<I18nT :keypath scope="global">
		<slot></slot>
	</I18nT>
</template>
