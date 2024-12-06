const { createSPLToken } = require("../utils/solana")
const { downloadTokenLogo } = require("../utils/file")
const { createMetadata } = require("../utils/pinata")
const { deploySessions } = require("../config")

const deployHandler = async (bot, msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id
  switch (deploySessions[chatId].step) {
    case "awaiting_name":
      deploySessions[chatId].data.name = msg.text
      deploySessions[chatId].step = "awaiting_symbol"
      bot.sendMessage(chatId, "Enter the token symbol (example: SOL)")
      break
    case "awaiting_symbol":
      deploySessions[chatId].data.symbol = msg.text
      deploySessions[chatId].step = "awaiting_description"
      bot.sendMessage(
        chatId,
        "Enter the token description\n\n(example: SOL token is used for network operations, governance, and staking on the Solana ecosystem)"
      )
      break
    case "awaiting_description":
      deploySessions[chatId].data.description = msg.text
      deploySessions[chatId].step = "awaiting_initialSupply"
      bot.sendMessage(
        chatId,
        "Enter the initial supply of your token (example: 999999). \n\nIt will be minted to the owner wallet directly when creating the token."
      )

      break
    case "awaiting_initialSupply":
      deploySessions[chatId].data.initialSupply = msg.text
      deploySessions[chatId].step = "awaiting_logo"
      bot.sendMessage(
        chatId,
        "Upload the image for your token logo.\n\nRequirements:\n1. The image should be high-quality in .jpg, .png, .svg.\n2.The image size should be greater than 500px x 500px. width and height should be same.(c x c)"
      )

      break
    case "awaiting_logo":
      const result = await downloadTokenLogo(
        bot,
        msg,
        userId,
        deploySessions[chatId].data.symbol
      )
      console.log(`Save Path: ${result}`)
      if (!result) {
        deploySessions[chatId].step = "awaiting_logo"
        bot.sendMessage(
          chatId,
          "Something went wrong. please upload the image now, but do not enter the text or others."
        )
      } else {
        deploySessions[chatId].data
        const { savePath, fileId } = result
        console.log(`File Path: ${savePath}`)
        const uriLink = await createMetadata(
          bot,
          chatId,
          deploySessions[chatId].data,
          savePath,
          fileId
        )
        deploySessions[chatId].data.uri = uriLink
        deploySessions[chatId].step = "awaiting_deploy_confirm"
        bot.sendMessage(
          chatId,
          "Are you sure to deploy a new token on Solana blokchain with data you entered above?\n\nplease reply only with (yes/no)."
        )
      }
      break

    case "awaiting_deploy_confirm":
      const answer = msg.text
      console.log(`Answer: ${answer}`)
      console.log()
      if (answer == "yes") {
        try {
          const { name, symbol, initialSupply, uri } =
            deploySessions[chatId].data
          bot.sendMessage(
            chatId,
            `I'm deploying  ${symbol} token on Solana network...`
          )
          console.log(
            `Name: ${name}\nSymbol:${symbol}\ninitialSupply: ${initialSupply}\n`
          )
          const result = await createSPLToken(name, symbol, initialSupply, uri)
          bot.sendMessage(
            chatId,
            `Deployed successfully!\n\n${symbol} address:\n${result.mintPublicKey}\n\nSolana Explorer Link:\nhttps://explorer.solana.com/address/${result.mintPublicKey}?cluster=devnet`
          )
          delete deploySessions[chatId]
        } catch (error) {
          bot.sendMessage(
            "Something went wrong! please check your balances and try it again with /deploy command."
          )
          delete deploySessions[chatId]
        }
      } else if (answer == "no") {
        bot.sendMessage(
          chatId,
          "Please restart the token deployment with /deploytoken."
        )
        delete deploySessions[chatId]
      } else {
        bot.sendMessage(
          chatId,
          "Wrong answer! please reply only with (yes/no)."
        )
      }
      break
  }
}

module.exports = { deployHandler }
