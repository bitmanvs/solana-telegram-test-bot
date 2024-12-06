const TelegramBot = require("node-telegram-bot-api")
const startController = require("../controllers/startController")
const deployController = require("../controllers/deployController")
const messageController = require("../controllers/messageController")
const { botToken, allowedUsers } = require("../config")
const marketController = require("../controllers/marketController")
const poolSnipeController = require("../controllers/poolSnipeController")
const testController = require("../controllers/testController")

/**
 * @typedef {import("node-telegram-bot-api")} TelegramBot
 */

//Defines Bot class object to manage functions and states.
class Bot {
  constructor() {
    /** @type {TelegramBot} */
    this.bot = new TelegramBot(botToken, { polling: true })
    /** console statement */
    this.console = "console statement"
  }

  listen() {
    this.bot.onText(/\/start$/, startController(this.bot))
    this.bot.onText(/\/deploytoken$/, deployController(this.bot))
    this.bot.onText(/\/createmarket$/, marketController(this.bot))
    this.bot.onText(/\/createpoolsnipe$/, poolSnipeController(this.bot))
    this.bot.onText(/\/test$/, testController(this.bot))
    this.bot.on("message", messageController(this.bot))
    this.bot.on("polling_error", (err) => console.error(err))
  }
}

module.exports = { Bot }
