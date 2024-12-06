const { testSessions } = require("../config")
const { convertSOLToWSOL } = require("../utils/solana")

const testController = (bot) => async (msg) => {
  const chatId = msg.chat.id

  testSessions[chatId] = { step: "awaiting_amount" }
  bot.sendMessage(chatId, "Please input the amount...")
}

module.exports = testController
