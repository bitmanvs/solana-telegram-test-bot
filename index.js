const chalk = require("chalk")
const { Bot } = require("./src/bot")

console.log(chalk.blueBright("Bot is listening..."))
new Bot().listen()
