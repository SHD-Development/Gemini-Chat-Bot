const fs = require("fs");
module.exports = {
	apikeys: [
		"",
	],
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
