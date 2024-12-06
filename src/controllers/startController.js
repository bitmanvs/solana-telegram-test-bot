const chalk = require("chalk")
const { verifyUser } = require("../utils/botFeature")

const startController = (bot) => async (msg) => {
  const chatId = msg.chat.id
  const username = msg.from.username.toLowerCase()

  if (!verifyUser(username)) {
    bot.sendMessage(
      chatId,
      `Sorry @${username}, you're not authorized to use this bot. please contact the support team.`
    )
    return
  }

  bot.sendMessage(
    chatId,
    "Welcome to Solana Bundle Bot!\nI can help you deploy, create a market, snipe tokens.\n\nYou can control me by sending these commands:\n\n/start - start a bot\n/deploytoken - deploy a new token to the Solana network\n/createmarket - create a new OpenBook Market ID\n/createpoolsnipe - create a new pool on Raydium and snipe tokens"
  )
}

module.exports = startController
