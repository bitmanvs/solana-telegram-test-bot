const { verifyUser, resetPoolSession } = require("../utils/botFeature")

const poolSnipeController = (bot) => async (msg) => {
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

  bot.sendMessage(
    chatId,
    "I will create a new pool with your token as the base token and SOL as the quote token and snipe your token at the same time.\n\nEnter your token name."
  )

  resetPoolSession(chatId)
}

module.exports = poolSnipeController
