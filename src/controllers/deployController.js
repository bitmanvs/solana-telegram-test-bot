const chalk = require("chalk")
const fs = require("fs")
const path = require("path")
const { verifyUser, resetDeploySession } = require("../utils/botFeature")

/**
 * Controller for handling the deployment command.
 * @param {TelegramBot} bot - The Telegram bot instance.
 */

const deployController = (bot) => async (msg) => {
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

  const folderPath = path.join(__dirname, "..", "asset", String(userId))

  try {
    await fs.mkdirSync(folderPath, { recursive: true })
    console.log("folder created!")
  } catch (error) {
    console.error(error)
  }
  resetDeploySession(chatId)
  bot.sendMessage(chatId, "Enter the token name (example: Solana)")
}

module.exports = deployController
