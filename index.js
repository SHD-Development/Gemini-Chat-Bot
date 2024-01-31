const {
	Client,
	GatewayIntentBits,
	PermissionFlagsBits,
} = require("discord.js");
const {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("fs");
const config = require("./config.js");
const MODEL_NAME = "gemini-pro";

const noisy = [
	"哇嗚！這裡要爆炸啦！",
	"讓我休息一下！",
];

const safetySettings = [
	{
		category: HarmCategory.HARM_CATEGORY_HARASSMENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_NONE,
	},
];

const generationConfig = {
	temperature: 1,
	topK: 1,
	topP: 1,
	maxOutputTokens: 1000,
};

let used = 0;

config.bots.map((bot) => {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
		],
	});
	const history = [];

	client.on("messageCreate", async (message) => {
        if(
            config.owners.includes(message.author.id) &&
            message.content.startsWith(`${bot.prefix}reset`)
        ) {
			fs.rmSync(`./chats/${bot.name}/${message.channel.id}.json`, {
				force: true,
			});
			history[message.channel.id] = [];
			return message.reply("已重置");
        }
		// if (message.author.bot) return;
		if (
			message.author.id === client.user.id ||
			(!bot.channels.includes(message.channel.id) &&
				((!message.mentions.users.has(client.user.id) &&
					Math.random() > 0.05) ||
					!message.channel
						.permissionsFor(message.guild.members.me)
						.has(PermissionFlagsBits.SendMessages)))
		)
			return;

		message.channel.sendTyping();
		if (!history[message.channel.id]) history[message.channel.id] = [];

		const genAI = new GoogleGenerativeAI(
			config.apikeys[used % config.apikeys.length]
		);
		used++;
		const model = genAI.getGenerativeModel({
			model: MODEL_NAME,
		});
		const chat = model.startChat({
			generationConfig,
			safetySettings,
			history: [bot.prompt, ...history[message.channel.id]][0],
		});

		const result = await chat
			.sendMessage(`[${message.author.username}]: ${message.content}`)
			.catch(() => {
				return message.reply(noisy[Math.floor(Math.random() * noisy.length)]);
			});
		if (!result) return;

		history[message.channel.id].push(
			{
				role: "user",
				parts: [
					{
						text: `[${message.author.username}]: ${message.content}`,
					},
				],
			},
			{
				role: "model",
				parts: [
					{
						text: result.response.text(),
					},
				],
			}
		);

		if (!(history[message.channel.id].length % 10))
			fs.writeFileSync(
				`./chats/${bot.name}/${message.channel.id}.json`,
				JSON.stringify(history[message.channel.id])
			);

		new Promise((resolve) => setTimeout(resolve, 1000));
		return message.reply(result.response.text());
	});

	client.login(bot.token);
});

console.log("Bots are online.");

process.on("unhandledRejection", async (error) => {
	console.error(error.stack || error);
});

process.on("uncaughtException", async (error) => {
	console.error(error.stack);
});

process.on("uncaughtExceptionMonitor", async (error) => {
	console.error(error.stack);
});
