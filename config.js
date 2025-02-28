const fs = require("fs");
module.exports = {
	apikeys: [
		"",
	],
	model: "gemini-2.0-flash",
	temperature: 1,
	topK: 1,
	topP: 1,
	maxOutputTokens: 1000,
	owners: [""],
	bots: [
		{
			name: "bot1",
			prefix: "!",
			token:
				"",
			prompt: JSON.parse(fs.readFileSync("./prompts/bot1.json")),
			channels: [""],
		},
		{
			name: "bot2",
			prefix: "!",
			token:
				"",
			prompt: JSON.parse(fs.readFileSync("./prompts/bot2.json")),
			channels: [""],
		},
	],
};
