/** HTTP Error Code */
type KirakiraErrorCode = 233 | 301 | 403 | 404 | 500 | 502 | 503 | 601;

/**
 * Navigate To Error Page
 * @param errorCode
 */
export async function navigateToErrorPage(errorCode: KirakiraErrorCode) {
	console.log(`/error/${errorCode}`);
	return await navigate(`/error/${errorCode}`, { redirectCode: errorCode });
}
