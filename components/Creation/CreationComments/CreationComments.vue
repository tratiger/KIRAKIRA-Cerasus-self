<docs>
	### 稿件评论
</docs>

<script setup lang="ts">
	const props = defineProps<{ videoId: number }>();

	const pageSize = 20; // 每页评论数
	const comments = ref<GetVideoCommentByKvidResponseDto["videoCommentList"]>([]); // 评论数据
	const commentsCount = ref(0); // 评论数目。
	const currentPage = ref(1); // 当前页码
	const pinned = ref(false);
	const search = ref("");
	const pageCount = computed(() => Math.max(1, Math.ceil(commentsCount.value / pageSize)));
	const selfUserInfoStore = useSelfUserInfoStore();
	const sort = ref<SortModel>(["rating", "descending"]); // 排序方式

	/**
	 * 发送评论，将发送的评论添加到评论列表中
	 */
	useListen("videoComment:emitVideoComment", videoComment => {
		comments.value.push(videoComment);
	});

	/**
	 * 删除评论，根据被删除的评论路由来过滤评论列表
	 * // TODO: 性能改进
	 */
	useListen("videoComment:deleteVideoComment", commentRoute => {
		comments.value = comments.value.filter(comment => comment.commentRoute !== commentRoute);
	});

	/**
	 * 获取视频的评论数据
	 */
	async function fetchVideoCommentData() {
		const getVideoCommentByKvidRequest: GetVideoCommentByKvidRequestDto = {
			videoId: props.videoId,
			pagination: {
				page: currentPage.value,
				pageSize,
			},
		};
		const videoCommentsResponse = await api.videoComment.getVideoCommentByKvid(getVideoCommentByKvidRequest);
		if (videoCommentsResponse.success) {
			comments.value = videoCommentsResponse.videoCommentList ?? [];
			commentsCount.value = videoCommentsResponse.videoCommentCount ?? 0;
		}
	}

	if (environment.client)
		await fetchVideoCommentData();

	watch(currentPage, fetchVideoCommentData);
</script>

<template>
	<Comp>
		<HeadingComments :count="commentsCount" />
		<div class="send">
			<UserAvatar :avatar="selfUserInfoStore.userAvatar" />
			<TextEditorRtf :videoId />
		</div>
		<div class="toolbar">
			<div class="left">
				<Sort v-model="sort">
					<SortItem id="rating">{{ t.rating }}</SortItem>
					<SortItem id="date">{{ t.send_date }}</SortItem>
				</Sort>
			</div>
			<div class="right">
				<TextBox v-model="search" :placeholder="t.search" icon="search" />
				<Pagination v-model="currentPage" :pages="pageCount" :displayPageCount="7" />
				<SoftButton icon="deletion_history" />
			</div>
		</div>
		<div class="items">
			<CreationCommentsItem
				v-for="comment in comments"
				:key="comment._id"
				v-model:upvote="comment.upvoteCount"
				v-model:downvote="comment.downvoteCount"
				v-model:isUpvoted="comment.isUpvote"
				v-model:isDownvoted="comment.isDownvote"
				v-model:pinned="pinned"
				:commentId="comment._id"
				:videoId
				:uid="comment.uid"
				:index="comment.commentIndex"
				:commentRoute="comment.commentRoute"
				:nickname="comment.userInfo?.userNickname"
				:username="comment.userInfo?.username"
				:avatar="comment.userInfo?.avatar"
				:date="new Date(comment.editDateTime)"
				:upvote_score="comment.upvoteCount"
			>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<!-- <div v-html="comment.text"></div> -->
				<!-- TODO: 评论支持富文本。 -->
				<div>{{ comment.text }}</div>
			</CreationCommentsItem>
		</div>
	</Comp>
</template>

<style scoped lang="scss">
	:comp {
		header {
			margin-bottom: 16px;
		}
	}

	.heading-comments {
		@include tablet {
			display: none;
		}
	}

	.send {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;

		.user-avatar {
			--size: 40px;
		}

		&:deep(.text-editor-rtf) {
			flex-grow: 1;
		}
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;

		> * {
			display: flex;
			flex-wrap: wrap;
			gap: 16px;
			justify-content: flex-end;
			align-items: center;
		}

		.sort {
			grid-auto-flow: column;
		}

		.soft-button {
			--wrapper-size: 36px;
			--ripple-size: 48px;
		}

		.text-box {
			width: 200px;
		}
	}
</style>
