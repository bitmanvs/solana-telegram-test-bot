const fs = require("fs")
const axios = require("axios")
const path = require("path")

const getImageFileExtension = (url) => {
  const lastDotPosition = url.lastIndexOf(".")
  if (lastDotPosition === -1) return null

  return url.substring(lastDotPosition + 1)
}

const downloadImageWithPath = async (url, savePath) => {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })

  const writer = fs.createWriteStream(savePath)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve)
    writer.on("error", reject)
  })
}

const downloadTokenLogo = async (bot, msg, userId, symbol) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "Uploading the token logo and metadata to IPFS...")
  if (msg.photo) {
    const photo = msg.photo[msg.photo.length - 1]
    const fileToken = photo.file_id

    const link = await bot.getFileLink(fileToken)
    const fileExt = getImageFileExtension(link)
    const lowerSymbol = String(symbol).toLowerCase()
    var fileId = 0

    if (!fileExt) return null

    var savePath = path.resolve(
      __dirname,
      "..",
      "asset",
      `${userId}`,
      `${lowerSymbol}.${fileExt}`
    )

    if (fs.existsSync(savePath)) {
      console.log("file exists")
      while (1) {
        fileId = Math.floor(Math.random() * 90000) + 10000
        savePath = path.resolve(
          __dirname,
          "..",
          "asset",
          `${userId}`,
          `${lowerSymbol}-${fileId}.${fileExt}`
        )
        if (!fs.existsSync(savePath)) break
      }
    }
    console.log(`Image URL: ${link}\nfile ext: ${fileExt}`)

    await downloadImageWithPath(link, savePath)

    return { savePath, fileId }
  } else return null
}

module.exports = {
  downloadTokenLogo,
}
