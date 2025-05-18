import { DELETE, GET, POST } from "../Common";
import type { BlockUserByUidRequestDto, BlockUserByUidResponseDto, GetBlockListRequestDto, GetBlockListResponseDto, HideUserByUidRequestDto, HideUserByUidResponseDto, ShowUserByUidRequestDto, ShowUserByUidResponseDto, UnblockUserByUidRequestDto, UnblockUserByUidResponseDto } from "./BlockControllerDto";

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

/**
 * 屏蔽用户
 * @param blockUserByUidRequest 屏蔽用户的请求载荷
 * @returns 屏蔽用户的请求响应
 */
export const blockUserController = async (blockUserByUidRequest: BlockUserByUidRequestDto): Promise<BlockUserByUidResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${BLOCK_API_URI}/user`, blockUserByUidRequest, { credentials: "include" }) as BlockUserByUidResponseDto;
};

/**
 * 取消屏蔽用户
 * @param blockUserByUidRequest 取消屏蔽用户的请求载荷
 * @returns 取消屏蔽用户的请求响应
 */
export const unblockUserController = async (unblockUserByUidRequest: UnblockUserByUidRequestDto): Promise<UnblockUserByUidResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${BLOCK_API_URI}/delete/user`, unblockUserByUidRequest, { credentials: "include" }) as UnblockUserByUidResponseDto;
};

/**
 * 隐藏用户
 * @param hideUserByUidRequest 隐藏用户的请求载荷
 * @returns 隐藏用户的请求响应
 */
export const hideUserController = async (hideUserByUidRequest: HideUserByUidRequestDto): Promise<HideUserByUidResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await POST(`${BLOCK_API_URI}/hideuser`, hideUserByUidRequest, { credentials: "include" }) as HideUserByUidResponseDto;
};

/**
 * 取消隐藏用户
 * @param showUserByUidRequest 显示用户的请求载荷
 * @returns 显示用户的请求响应
 */
export const showUserController = async (showUserByUidRequest: ShowUserByUidRequestDto): Promise<ShowUserByUidResponseDto> => {
	// TODO: use { credentials: "include" } to allow save/read cookies from cross-origin domains. Maybe we should remove it before deployment to production env.
	return await DELETE(`${BLOCK_API_URI}/delete/hideuser`, showUserByUidRequest, { credentials: "include" }) as ShowUserByUidResponseDto;
};
