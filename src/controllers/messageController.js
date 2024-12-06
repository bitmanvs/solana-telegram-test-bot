const { verifyUser } = require("../utils/botFeature")
const {
  commands,
  deploySessions,
  marketSessions,
  poolSessions,
  testSessions,
} = require("../config")

const { deployHandler } = require("../services/deployHandler")
const { marketHandler } = require("../services/marketHandler")
const { poolSnipeHandler } = require("../services/poolSnipeHandler")
const { testHandler } = require("../services/testHandler")
/**
 * Controller for handling the deployment command.
 * @param {TelegramBot} bot - The Telegram bot instance.
 */

const messageController = (bot) => async (msg) => {
  const chatId = msg.chat.id
  const username = msg.from.username.toLowerCase()
  const userId = msg.from.id

  if (!verifyUser(username)) {
    bot.sendMessage(
      chatId,
      `Sorry @${username}, you're not authorized to use this bot. please contact the support team.`
    )
    return
  }

  if (!msg.photo && msg.text.startsWith("/")) {
    const command = msg.text.split(" ")[0]
    if (commands.includes(command)) return
    else bot.sendMessage(chatId, "Please input the correct command.")
  }

  if (deploySessions[chatId]) {
    await deployHandler(bot, msg)
    return
  }

  if (marketSessions[chatId]) {
    await marketHandler(bot, msg)
    return
  }

  if (poolSessions[chatId]) {
    await poolSnipeHandler(bot, msg)
    return
  }

  if (testSessions[chatId]) {
    await testHandler(bot, msg)
    return
  }
}

module.exports = messageController
