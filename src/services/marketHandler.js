const { marketSessions } = require("../config")
const { createMarket } = require("../utils/raydium")

const marketHandler = async (bot, msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id

  switch (marketSessions[chatId].step) {
    case "awaiting_name":
      marketSessions[chatId].data.name = msg.text
      marketSessions[chatId].step = "awaiting_symbol"
      bot.sendMessage(chatId, "Enter your token symbol.")
      break
    case "awaiting_symbol":
      marketSessions[chatId].data.symbol = msg.text
      marketSessions[chatId].step = "awaiting_mint"
      bot.sendMessage(chatId, "Enter your token mint address.")
      break
    case "awaiting_mint":
      marketSessions[chatId].data.mint = msg.text
      marketSessions[chatId].step = "awaiting_lotsize"
      bot.sendMessage(chatId, "Enter the market lot size that you want.")
      break
    case "awaiting_lotsize":
      marketSessions[chatId].data.lotSize = msg.text
      marketSessions[chatId].step = "awaiting_ticksize"
      bot.sendMessage(chatId, "Enter the market tick size that you want.")
      break
    case "awaiting_ticksize":
      marketSessions[chatId].data.tickSize = msg.text
      marketSessions[chatId].step = "awaiting_market_confirm"
      bot.sendMessage(
        chatId,
        "Are you sure to create a new market on OpenBook with data you entered above?\n\nplease reply only with (yes/no)."
      )
      break
    case "awaiting_market_confirm":
      const { name, symbol, mint, lotSize, tickSize } =
        marketSessions[chatId].data
      try {
        const { txids, addresses } = await createMarket(
          name,
          symbol,
          mint,
          lotSize,
          tickSize
        )
        console.log(addresses.marketId)
        bot.sendMessage(
          chatId,
          `A new market has been successfully created!\n\nYour OpenBook Market ID:\n${addresses.marketId}`
        )
      } catch (error) {
        console.error(error)
        bot.sendMessage(
          chatId,
          "Something went wrong, please check your details."
        )
      }
      delete marketSessions[chatId]
  }
}

module.exports = { marketHandler }
