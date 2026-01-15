declare global {
	var viverse: {
		client: typeof ViverseClient;
		storage: typeof ViverseStorage;
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

export {};
