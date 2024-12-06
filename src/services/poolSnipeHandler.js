const chalk = require("chalk")
const { poolSessions } = require("../config")
const { createPoolSnipeTokens } = require("../utils/raydium")

const poolSnipeHandler = async (bot, msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id

  switch (poolSessions[chatId].step) {
    case "awaiting_name":
      poolSessions[chatId].data.name = msg.text
      poolSessions[chatId].step = "awaiting_symbol"
      bot.sendMessage(chatId, "Enter your token symbol.")
      break
    case "awaiting_symbol":
      poolSessions[chatId].data.symbol = msg.text
      poolSessions[chatId].step = "awaiting_mint"
      bot.sendMessage(chatId, `Enter your token mint address.`)
      break
    case "awaiting_mint":
      poolSessions[chatId].data.mintAddress = msg.text
      poolSessions[chatId].step = "awaiting_marketId"
      bot.sendMessage(
        chatId,
        `Enter ${poolSessions[chatId].data.symbol}-SOL OpenBook Market ID.`
      )
      break
    case "awaiting_marketId":
      poolSessions[chatId].data.marketId = msg.text
      poolSessions[chatId].step = "awaiting_baseAmount"
      bot.sendMessage(
        chatId,
        `Enter ${poolSessions[chatId].data.symbol} amount for the initial liquidity.`
      )
      break
    case "awaiting_baseAmount":
      poolSessions[chatId].data.baseAmount = msg.text
      poolSessions[chatId].step = "awaiting_quoteAmount"
      bot.sendMessage(chatId, `Enter SOL amount for the initial liquidity.`)
      break
    case "awaiting_quoteAmount":
      poolSessions[chatId].data.quoteAmount = msg.text
      poolSessions[chatId].step = "awaiting_snipeRate"
      bot.sendMessage(chatId, "Enter the rate to snipe tokens(unit: %).")
      break
    case "awaiting_snipeRate":
      poolSessions[chatId].data.snipeRate = msg.text
      poolSessions[chatId].step = "awaiting_confirm"
      bot.sendMessage(
        chatId,
        "Are you sure to create a new pool on Raydium and snipe tokens with data you entered above?\n\nplease reply only with (yes/no)."
      )
      break
    case "awaiting_confirm":
      if (msg.text == "yes") {
        const {
          name,
          symbol,
          mintAddress,
          marketId,
          baseAmount,
          quoteAmount,
          snipeRate,
        } = poolSessions[chatId].data

        try {
          const { txids, addresses } = await createPoolSnipeTokens(
            name,
            symbol,
            mintAddress,
            marketId,
            baseAmount,
            quoteAmount,
            snipeRate
          )
          console.log("TxIDs: ", txids)
          console.log("Addresses: ", addresses)
          bot.sendMessage(chatId, "Created your pool successfully!")
        } catch (error) {
          console.error(error)
          bot.sendMessage(
            chatId,
            "Something went wrong!\n\nplease check your details and wallet balances, try it again."
          )
          delete poolSessions[chatId]
        }
        console.log(
          chalk.green(
            `name: ${name}\nsymbol: ${symbol}\nmarketId: ${marketId}\nbaseAmount: ${baseAmount}\nquoteAmount: ${quoteAmount}\nsnipeRate: ${snipeRate}`
          )
        )
      } else if (msg.text == "no") {
        bot.sendMessage(
          chatId,
          "Please restart the token deployment with /createpoolsnipe."
        )
        delete poolSessions[chatId]
      } else {
        bot.sendMessage(
          chatId,
          "Wrong answer! please reply only with (yes/no)."
        )
      }
      break
  }
}

module.exports = { poolSnipeHandler }
