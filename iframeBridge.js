import { parseArgs } from "node:util";

export default async function (ctx) {
	const { values } = parseArgs({
		options: {
			appId: {
				type: "string",
				short: "a",
			},
		},
		strict: false,
	});

	let appId = values.appId || "";
	while (!appId) {
		appId = await input({
			message: "What is the Viverse app id?\n",
		});
	}
	ctx.setPluginOptions(`{appId: "${appId}"}`);
}
