const {
  allowedUsers,
  deploySessions,
  marketSessions,
  poolSessions,
} = require("../config")

//verify user who is allowed to access this bot.
const verifyUser = (username) => {
  if (allowedUsers.includes(username)) return true
  else return false
}

//set up the chat state and text.
const resetDeploySession = (chatId) => {
  deploySessions[chatId] = {
    step: "awaiting_name",
    data: {},
  }
}

const resetMarketSession = (chatId) => {
  marketSessions[chatId] = {
    step: "awaiting_name",
    data: {},
  }
}

const resetPoolSession = (chatId) => {
  poolSessions[chatId] = {
    step: "awaiting_name",
    data: {},
  }
}

module.exports = {
  verifyUser,
  resetDeploySession,
  resetMarketSession,
  resetPoolSession,
}
