import * as _browsingHistory from "api/BrowsingHistory/BrowsingHistoryControllerDto";
import * as _videoComment from "api/Comment/VideoCommentControllerDto";
import * as _danmaku from "api/Danmaku/DanmakuControllerDto";
import * as _user from "api/User/UserControllerDto";
import * as _video from "api/Video/VideoControllerDto";
import * as _videoTag from "api/VideoTag/VideoTagControllerDto";
import * as _feed from "api/Feed/FeedControllerDto";
import * as _block from "api/BlockList/BlockControllerDto";

/*
 * 此处声明与后端 API 相关的全局类型。
 */
declare global {
	// BrowsingHistoryControllerDto
	export type { AdminDeleteVideoCommentRequestDto, DeleteSelfVideoCommentRequestDto, GetUserBrowsingHistoryWithFilterRequestDto, GetUserBrowsingHistoryWithFilterResponseDto } from "api/BrowsingHistory/BrowsingHistoryControllerDto";
	// VideoCommentControllerDto
	export type { CancelVideoCommentDownvoteRequestDto, CancelVideoCommentUpvoteRequestDto, EmitVideoCommentDownvoteRequestDto, EmitVideoCommentRequestDto, EmitVideoCommentUpvoteRequestDto, GetVideoCommentByKvidRequestDto, GetVideoCommentByKvidResponseDto, VideoCommentResult } from "api/Comment/VideoCommentControllerDto";
	// DanmakuControllerDto
	export type { EmitDanmakuRequestDto, GetDanmakuByKvidRequestDto } from "api/Danmaku/DanmakuControllerDto";
	// UserControllerDto
	export type { GetSelfUserInfoByUuidResponseDto, UserLinkedAccountsVisibilitiesSettingDto, UserPrivaryVisibilitiesSettingDto, CheckUserHave2FARequestDto, SendUserDeleteEmailAuthenticatorVerificationCodeRequestDto, DeleteUserEmailAuthenticatorRequestDto, SendUserEmailAuthenticatorVerificationCodeRequestDto, DeleteTotpAuthenticatorByTotpVerificationCodeRequestDto, ConfirmUserTotpAuthenticatorRequestDto, CheckUserHave2FAResponseDto, AdminClearUserInfoRequestDto, ApproveUserInfoRequestDto, AdminGetUserInfoResponseDto, ReactivateUserByUIDRequestDto, GetBlockedUserResponseDto, BlockUserByUIDRequestDto, CheckUsernameRequestDto, UpdateUserPasswordRequestDto, RequestSendChangePasswordVerificationCodeRequestDto, UpdateUserEmailRequestDto, RequestSendChangeEmailVerificationCodeRequestDto, GetMyInvitationCodeResponseDto, CheckInvitationCodeRequestDto, RequestSendVerificationCodeRequestDto, GetSelfUserInfoRequestDto, GetUserInfoByUidRequestDto, GetUserInfoByUidResponseDto, GetUserSettingsRequestDto, GetUserSettingsResponseDto, UpdateOrCreateUserInfoRequestDto, UpdateOrCreateUserSettingsRequestDto, UserEmailExistsCheckRequestDto, UserLabelSchema, UserLoginRequestDto, UserRegistrationRequestDto } from "api/User/UserControllerDto";
	// VideoControllerDto
	export type { CheckVideoExistRequestDto, ApprovePendingReviewVideoRequestDto, PendingReviewVideoResponseDto, DeleteVideoRequestDto, GetVideoByKvidRequestDto, GetVideoByKvidResponseDto, GetVideoByUidRequestDto, GetVideoByUidResponseDto, SearchVideoByKeywordRequestDto, SearchVideoByKeywordResponseDto, SearchVideoByVideoTagIdRequestDto, ThumbVideoResponseDto, UploadVideoRequestDto } from "api/Video/VideoControllerDto";
	// VideoTagControllerDto
	export type { CreateVideoTagRequestDto, GetVideoTagByTagIdRequestDto, VideoTag } from "api/VideoTag/VideoTagControllerDto";
	// FeedControllerDto
	export type { UnfollowingUploaderRequestDto, FollowingUploaderRequestDto } from "api/Feed/FeedControllerDto";
	// BlockListDto
	export type { RemoveRegexRequestDto, AddRegexRequestDto, UnblockKeywordRequestDto, BlockKeywordRequestDto, BlockTagRequestDto, UnblockTagRequestDto, ShowUserByUidRequestDto, HideUserByUidRequestDto, GetBlockListResponseDto, GetBlockListRequestDto, BlockUserByUidRequestDto, UnblockUserByUidRequestDto } from "api/BlockList/BlockControllerDto";
}
