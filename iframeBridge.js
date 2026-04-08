export default async function (ctx) {
	const appId = await ctx.prompt("What is the Viverse app id?");
	ctx.setPluginOptions(`{appId: "${appId}"}`);
}
