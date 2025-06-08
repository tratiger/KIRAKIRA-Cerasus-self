// DELETE: 将由后端推送 profile 信息，本文件作废。

interface UserInfo {
	username: string;
	memo?: string;
	bio?: string;
	gender: "male" | "female" | (string & {});
	isFollowing: boolean;
	following: number;
	followers: number;
	views: number;
	rating: number;
	birthday: Date;
	joinTime: Date;
	uid: bigint;
}

const users = reactive<Record<string | number, UserInfo>>({
	2: {
		username: "艾了个拉",
		memo: "艾拉",
		bio: "Kind and Kawaii, Forever!~",
		gender: "female",
		isFollowing: true,
		following: 233,
		followers: 233,
		views: 233,
		rating: 233,
		birthday: new Date("2003-12-24"),
		joinTime: new Date(),
		uid: 2n,
	},
});

export default users;
