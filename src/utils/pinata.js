const fs = require("fs")
const pinataSDK = require("@pinata/sdk")
const { pinataJWTKey, pinataGateway } = require("../config")
const pinata = new pinataSDK({ pinataJWTKey: pinataJWTKey })

const getJsonPath = (path) => {
  const lastDotPosition = String(path).lastIndexOf(".")
  const jsonPath = String(path).substring(0, lastDotPosition)
  return jsonPath
}

const uploadToPinata = async (path, fileName) => {
  const stream = fs.createReadStream(path)
  const options = {
    pinataMetadata: {
      name: fileName,
      keyvalues: {
        customKey: fileName,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  }
  const result = await pinata.pinFileToIPFS(stream, options)
  return result
}

const createMetadata = async (bot, chatId, tokenData, path, fileId) => {
  const { name, symbol, description } = tokenData
  const resultLogo = await uploadToPinata(path, String(symbol) + String(fileId))

  const imageLink = pinataGateway + resultLogo.IpfsHash

  const data = {
    name: name,
    symbol: symbol,
    description: description,
    image: imageLink,
  }

  const jsonData = JSON.stringify(data)
  const metadataPath = getJsonPath(path) + ".json"
  console.log(`Metadata Path: ${metadataPath}`)

  try {
    await fs.writeFileSync(metadataPath, jsonData, "utf-8")
  } catch (error) {
    console.error(error)
    throw error
  }

  const resultMetadata = await uploadToPinata(
    metadataPath,
    "meta-" + String(symbol) + String(fileId)
  )

  const uri = pinataGateway + resultMetadata.IpfsHash
  console.log(`Uri: ${uri}`)
  return uri
}

module.exports = {
  createMetadata,
}
