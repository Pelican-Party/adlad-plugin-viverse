declare global {
	var viverse: {
		client: typeof ViverseClient;
		storage: typeof ViverseStorage;
		avatar: typeof ViverseAvatarClient;
	};
}

interface ViverseClientOptions {
	clientId: string;
	domain?: string;
	cookieDomain?: string;
}

interface UserInfo {
	access_token: string;
	account_id: string;
	expires_in: number;
	state: string;
}

export class ViverseClient {
	constructor(options: ViverseClientOptions);

	checkAuth(): Promise<UserInfo | undefined>;
	loginWithWorlds(): void;
}

class ViverseStorage {
	newCloudSaveClient(appId: string): Promise<CloudSaveClient>;
}

export class CloudSaveClient {
	setPlayerData(key: string, value: unknown, accessToken: string): Promise<void>;
	getPlayerData(key: string, accessToken: string): Promise<unknown>;
}

interface ViverseAvatarClientOptions {
	baseURL: string;
	token: string;
}

export class ViverseAvatarClient {
	constructor(options: ViverseAvatarClientOptions);
	getProfile(): Promise<ViverseAvatar>;
}

type ViverseProfile = {
	name: string;
	activeAvatar: ViverseAvatar | null;
};

type ViverseAvatar = {
	id: string | number;
	isPrivate: boolean;
	vrmUrl: string;
	headIconUrl: string;
	snapshot: string;
	createTime: number;
	updateTime: number;
};

export {};
