<docs>
	# 日期/时间/时间码选择器的基础选择器
</docs>

<script setup lang="ts">
	const props = withDefaults(defineProps<{
		/** 基础日期时间选择器字段。 */
		fields: BaseDateTimePickerField[];
		/** 缺省分隔符。默认为间隔号。 */
		defaultSep?: string;
	}>(), {
		defaultSep: "·",
	});

	const { menuItemCount } = useScssVariables().numbers;
	const model = defineModel<Record<string, Readable>>({ required: true });
	const showMenu = ref<DOMRect>();
	const menu = ref<HTMLElement>();
	const hide = () => showMenu.value = undefined;
	const previousValue = ref<Record<string, Readable>>();

	const backupValue = () => previousValue.value = model.value;
	const restoreValue = () => previousValue.value && (model.value = previousValue.value);

	useEventListener("window", "pointerdown", e => {
		if (!menu.value || !showMenu.value) return;
		const clickOutside = !isInPath(e, menu);
		if (clickOutside) {
			restoreValue(); // 去掉该行，则点击屏幕外缘将会保存设置而不是恢复设置。
			hide();
		}
	});

	const visibleValues = computed(() => {
		return arrayMapObject(props.fields, ({ name, values, loopable }) => {
			const currentValue = model.value[name];
			let currentIndex = values.indexOf(currentValue);
			if (currentIndex === -1) currentIndex = 0;
			const result: Readable[] = [];
			for (let i = currentIndex - (menuItemCount - 1); i <= currentIndex + (menuItemCount - 1); i++) {
				const index = loopable ? floorMod(i, values.length) : i;
				const value = values[index];
				result.push(value);
			}
			return [name, result];
		});
	});

	function setField(name: string, value: Readable) {
		model.value = { ...model.value, [name]: value };
	}

	function onWheel(e: WheelEvent, fieldName: string) {
		const isNext = e.deltaY > 0;
		const nextValue = visibleValues.value[fieldName][menuItemCount - 1 + (isNext ? 1 : -1)];
		if (nextValue !== undefined) setField(fieldName, nextValue);
	}

	// TODO: 滚动项目时没有动画。
</script>

<template>
	<Comp role="application" v-ripple :aria-expanded="showMenu" tabindex="0" @click="e => { backupValue(); showMenu = e.currentTarget.getBoundingClientRect(); }">
		<template v-for="({ name, sep, getDisplayValue }, index) in fields" :key="name">
			<p class="value">{{ getDisplayValue?.(model[name]) ?? model[name] }}</p>
			<p v-if="(sep || defaultSep) && index < fields.length - 1" class="sep">{{ sep || defaultSep }}</p>
		</template>
		<ClientOnlyTeleport to="#popovers">
			<Transition :duration="{ enter: 250, leave: 125 }">
				<div
					v-if="showMenu"
					ref="menu"
					class="menu"
					:style="{
						'--left': showMenu.left + 'px',
						'--top': showMenu.top + 'px',
						'--width': showMenu.width + 'px',
					}"
				>
					<div class="base"></div>
					<div class="content">
						<div class="highlight"></div>
						<div class="items">
							<template v-for="({ name, sep, getDisplayValue }, index) in fields" :key="name">
								<div class="values" @wheel="e => onWheel(e, name)">
									<template v-for="(value, i) in visibleValues[name]" :key="i">
										<!-- 虽说不推荐将数组索引值作为 key，但是假如元素太少（例如12小时制），则会出现一轮包含多个相同的 key，从而导致出现异常。 -->
										<p v-if="value !== undefined" class="item" @click="setField(name, value)">{{ getDisplayValue?.(value) ?? value }}</p>
										<p v-else class="item nothing"></p>
									</template>
								</div>
								<p v-if="(sep || defaultSep) && index < fields.length - 1" class="sep">{{ sep || defaultSep }}</p>
							</template>
						</div>
						<div class="buttons">
							<button v-ripple @click="hide(); restoreValue();"><Icon name="close" /></button>
							<button v-ripple @click="hide()"><Icon name="check" /></button>
						</div>
					</div>
				</div>
			</Transition>
		</ClientOnlyTeleport>
	</Comp>
</template>

<style scoped lang="scss">
	$item-height: 36px;
	$menu-item-count: 9;
	$menu-bottom-buttons-height: 42px;
	$menu-padding-inline: 4px;
	$item-padding-inline: 16px;

	:comp {
		@include chip-shadow;
		@include round-large;
		display: flex;
		gap: 9px;
		justify-content: space-evenly;
		align-items: stretch;
		width: fit-content;
		height: $item-height;
		padding-inline: $item-padding-inline;
		background-color: c(main-bg);

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
			@extend %item-value;
		}
	}

	* {
		font-weight: 500;
		font-feature-settings: "case" on; // 使冒号和负号等与数字和大写字母等高（不需要比号）。
		font-variant-numeric: tabular-nums;
	}

	.sep {
		align-content: center;
		align-self: center;
		opacity: 0.5;
	}

	%item-value {
		align-content: center;
		color: c(icon-color);
		text-align: center;
	}

	.menu {
		$width: calc(var(--width) + $menu-padding-inline * 2);
		$height: $item-height * $menu-item-count + $menu-bottom-buttons-height;
		$half-items-height: $item-height * math.floor(calc($menu-item-count / 2));
		--top-value: clamp(0px, calc(var(--top) - #{$half-items-height}), calc(100dvh - #{$height}));
		--left-value: clamp(0px, calc(var(--left) - #{$menu-padding-inline}), calc(100dvw - #{$width}));
		top: var(--top-value);
		left: var(--left-value);
		width: $width;
		height: $height;

		// 使用绝对定位而不是和 ComboBox 一样的相对定位是因为，我想到一个用例是视频跳时间。要是用相对定位的话，如果视频全屏显示，那么必然会有半边菜单显示在屏幕之外。
		> * {
			position: fixed;
			top: var(--top-value);
			left: var(--left-value);
			width: $width;
			height: $height;
		}

		.base {
			@include dropdown-flyouts;
			@include round-large;
			background-color: c(main-bg);
		}

		.content {
			@include round-large;
			overflow: hidden;
			clip-path: inset(0);
		}

		.items {
			display: flex;
			gap: 9px;
			justify-content: space-evenly;
			align-items: stretch;
			height: $item-height * $menu-item-count;
			padding-inline: $item-padding-inline + $menu-padding-inline;
			overflow-y: clip;
			mask: linear-gradient(to bottom,
			transparent 0%,
			black calc(100% / $menu-item-count),
			black calc(100% - 100% / $menu-item-count),
			transparent 100%,
		);

			.item {
				@extend %item-value;
				position: relative;
				height: $item-height;
				white-space: nowrap;
				cursor: pointer;

				&::after {
					@include round-small;
					content: "";
					position: absolute;
					inset: 0;
					inset-inline: -9px;
					display: block;
				}

				&:any-hover::after {
					background-color: c(hover-overlay);
				}

				&:active::after {
					background-color: c(ripple);
				}

				&.nothing {
					pointer-events: none;
				}

				&:nth-child(#{$menu-item-count}) {
					color: c(main-bg);
				}
			}

			.values {
				height: $item-height * ($menu-item-count * 2 - 1);
				margin-top: -$half-items-height;
			}

			.sep {
				color: c(main-bg);
			}
		}

		.buttons {
			@include card-shadow;
			z-index: 1;
			display: flex;
			align-items: stretch;
			height: $menu-bottom-buttons-height;
			background-color: c(main-bg);

			button {
				@include grid-center;
				width: 100%;
				color: c(icon-color);
				font-size: 24px;

				&:any-hover {
					background-color: c(hover-overlay);
				}
			}
		}

		.highlight {
			@include button-shadow;
			@include round-small;
			position: absolute;
			top: $half-items-height;
			left: $menu-padding-inline;
			width: var(--width);
			height: $item-height;
			background-color: c(accent);
		}

		&.v-enter-from,
		&.v-leave-to {
			.base {
				top: var(--top);
				height: $item-height;
			}

			.highlight {
				opacity: 0;
			}

			.item,
			.sep {
				color: c(icon-color) !important;
			}

			* {
				pointer-events: none;
			}

			.content {
				translate: 0 calc((var(--top) - #{$half-items-height}) - var(--top-value));
				clip-path: inset($half-items-height 0 ($half-items-height + $menu-bottom-buttons-height));
			}
		}
	}
</style>
