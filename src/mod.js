/**
 * @param {Object} options
 * @param {string} options.appId
 * @param {string | undefined} [options.domain]
 * @param {string | undefined} [options.cookieDomain]
 */
export function viversePlugin({
	appId,
	domain = "account.htcvive.com",
	cookieDomain = undefined,
}) {
	let initializeCalled = false;

	if (!appId) {
		throw new Error("No app id was provided");
	}

	const props = /** @type {const} */ ({
		viverse: "viverse",
		client: "client",
		clientId: "clientId",
		domain: "domain",
		cookieDomain: "cookieDomain",
		checkAuth: "checkAuth",
		loginWithWorlds: "loginWithWorlds",
		storage: "storage",
		newCloudSaveClient: "newCloudSaveClient",
		setPlayerData: "setPlayerData",
		getPlayerData: "getPlayerData",
	});

	// @ts-ignore We want to make sure that `props` remains an object.
	// Normally, terser would turn every property into a separate variable.
	// This would be fine for the first pass of minification, but if a user
	// were to bundle and minify this libarry with their own code, they will minify a second time
	// causing all these props to lose their quotes.
	// This can be an issue if the new bundle has property mangling enabled.
	// This if statement will never run, but rollup and terser will both think it
	// might and so the `props` opbject will remain an object.
	if (props > 0) console.log(props);

	/** @type {import("./types.d.ts").ViverseClient} */
	let client;
	/** @type {import("./types.d.ts").CloudSaveClient} */
	let cloudSaveClient;
	/** @type {string?} */
	let accessToken = null;

	/** @type {Map<string, string>} */
	const sessionStorage = new Map();

	// We add a prefix to localStorage keys to prevent clashes with manual calls to localStorage.setItem();
	const localStoragePrefix = "adlad_viverse_";

	const plugin = /** @type {const} @satisfies {import("$adlad").AdLadPlugin} */ ({
		name: "viverse",
		async initialize(ctx) {
			if (initializeCalled) {
				throw new Error("Viverse plugin is being initialized more than once");
			}
			initializeCalled = true;

			await ctx.loadScriptTag("https://www.viverse.com/static-assets/viverse-sdk/index.umd.cjs");

			client = new globalThis[props.viverse][props.client]({
				[props.clientId]: appId,
				[props.domain]: domain,
				[props.cookieDomain]: cookieDomain,
			});

			// If we're not running in an iframe, the client.checkAuth() promise stays pending forever.
			// But since it is pretty common to run games in local development without an iframe, we'll also make this check here and throw an error.
			// That way at least some of the api calls stay working.
			if (window.parent == window) {
				throw new Error("The Viverse SDK is not supported unless the game is embedded on the viverse.com.");
			}

			const authResult = await client[props.checkAuth]();
			accessToken = authResult?.access_token || null;

			const storageClient = new globalThis[props.viverse][props.storage]();
			cloudSaveClient = await storageClient[props.newCloudSaveClient](appId);
		},
		customRequests: {
			/**
			 * @param {string} key
			 * @param {unknown} value
			 */
			async setStorageItem(key, value) {
				// The Viverse SDK doesn't allow passing raw values such as `true` or `42`,
				// but since this is quite common, we'll add support for this by stringifying the provided value.
				// This does mean the SDK will probably stringify it a second time, but oh well.
				const stringifiedValue = JSON.stringify(value);
				if (accessToken) {
					await cloudSaveClient[props.setPlayerData](key, stringifiedValue, accessToken);
				} else {
					try {
						localStorage.setItem(localStoragePrefix + key, stringifiedValue);
					} catch {
						// The user is probably using private browsing, we'll fallback to session storage
						sessionStorage.set(key, stringifiedValue);
					}
				}
			},
			/**
			 * @param {string} key
			 * @returns {Promise<unknown>}
			 */
			async getStorageItem(key) {
				let stringifiedValue;
				if (accessToken) {
					stringifiedValue = await cloudSaveClient[props.getPlayerData](key, accessToken);
				} else {
					try {
						stringifiedValue = localStorage.getItem(localStoragePrefix + key);
					} catch {
						stringifiedValue = sessionStorage.get(key);
					}
				}
				if (!stringifiedValue || typeof stringifiedValue != "string") return null;
				return JSON.parse(stringifiedValue);
			},
			showAuthPrompt() {
				client[props.loginWithWorlds]();
			},
		},
	});

	return plugin;
}
