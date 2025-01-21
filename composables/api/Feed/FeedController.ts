import type { FollowingUploaderRequestDto } from "./FeedControllerDto";

const BACK_END_URI = environment.backendUri;
const FEED_API_URI = `${BACK_END_URI}feed`;

/**
 * 根据视频 ID (KVID) 获取视频的数据
 * @param getVideoByKvidRequest 从视频 ID 获取视频的请求参数
 * @returns 视频页面需要的响应
 */
export const followingUploader = (followingUploaderRequest: FollowingUploaderRequestDto) => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return useFetch<GetVideoByKvidResponseDto>(
		`${FEED_API_URI}/following`,
		{
			method: "POST",
			body: { ...followingUploaderRequest },
			credentials: "include",
		},
	);
};
