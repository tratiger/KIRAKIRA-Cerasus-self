import { GET } from "../Common";
import type { GetBlockListRequestDto, GetBlockListResponseDto } from "./BlockControllerDto";

const BACK_END_URI = environment.backendUri;
const BLOCK_API_URI = `${BACK_END_URI}block`;

/**
 * 获取用户的黑名单
 * @param getVideoCommentByKvidRequest 获取用户的黑名单的请求载荷
 * @returns 获取用户的黑名单的请求响应
 */
export const getBlockListController = async (getBlockListRequest: GetBlockListRequestDto): Promise<GetBlockListResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await GET(`${BLOCK_API_URI}/list?type=${getBlockListRequest.type}&page=${getBlockListRequest.pagination.page}&pageSize=${getBlockListRequest.pagination.pageSize}`, { credentials: "include" }) as GetVideoCommentByKvidResponseDto;
};
