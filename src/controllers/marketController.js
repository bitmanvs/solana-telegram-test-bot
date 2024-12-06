const { verifyUser, resetMarketSession } = require("../utils/botFeature")
const marketController = (bot) => async (msg) => {
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
    "Note: I'll create a new market with your token as the basic token and SOL as the quote token.\n\nEnter your token name."
  )
  resetMarketSession(chatId)
}

module.exports = marketController
