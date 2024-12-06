const web3 = require('@solana/web3.js')
const { mplTokenMetadata } = require('@metaplex-foundation/mpl-token-metadata')
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults')
const { keypairIdentity } = require('@metaplex-foundation/umi')
const {
  MAINNET_PROGRAM_ID,
  DEVNET_PROGRAM_ID,
  LOOKUP_TABLE_CACHE,
  TxVersion,
} = require('@raydium-io/raydium-sdk')
const bs58 = require('bs58')
const { PublicKey } = require('@solana/web3.js/lib/index.cjs')

require('dotenv').config()

//Telegram Bot
const botToken = process.env.TELEGRAM_BOT_API_TOKEN

//Allowed Users List to access to this bot.
const allowedUsers = ['raymanoos', 'lekheydeter', 'Visionary235', 'javanmatt']
const commands = [
  '/start',
  '/deploytoken',
  '/createmarket',
  '/createpoolsnipe',
  '/test',
]

// DeploySessions, marketSessions, poolSessions, testSessions object.
const deploySessions = {}
const marketSessions = {}
const poolSessions = {}
const testSessions = {
  step: null,
}

//Network Selection => 0(mainnet), 1(devnet), 2(testnet)
const currentIndex = process.env.CURRENT_INDEX

//Addresses
const wsolName = 'Wrapped SOL'
const wsolSymbol = 'WSOL'
const wsolDecimals = 9
const wsolAddress = 'So11111111111111111111111111111111111111112'

//Decimals
const DEFAULT_DECIMALS = 6

//RPC
const SOLANA_RPC_URL = [
  'https://api.mainnet-beta.solana.com',
  'https://api.devnet.solana.com',
  'https://api.testnet.solana.com',
]


//Solana RPC URLs
const CURRENT_RPC_URL = SOLANA_RPC_URL[currentIndex]

//KEYS
const ownerKey = bs58.decode(process.env.OWNER_KEY)
const traderKey = bs58.decode(process.env.TRADER_KEY)

//Web3 Signers
const ownerSigner = web3.Keypair.fromSecretKey(new Uint8Array(ownerKey))
const traderSigner = web3.Keypair.fromSecretKey(new Uint8Array(traderKey))

//Public Keys
const ownerPublicKey = new web3.PublicKey(ownerSigner.publicKey)
const traderPublicKey = new web3.PublicKey(traderSigner.publicKey)

//Web3 Connection
const connection = new web3.Connection('https://api.devnet.solana.com')

//Umi
const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata())
const umiOwnerSigner = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(ownerKey)
)
umi.use(keypairIdentity(umiOwnerSigner))

//Pinata Cloud Configuration
const pinataJWTKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5NGQwODhlZC0xZTIyLTRkYTUtOWJjNy00ZmFkMmNkMDBlNTQiLCJlbWFpbCI6ImNyb3duY29kZW1hbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjM2ZGNmMDQ1ZmFkOTAwMmZmZmIiLCJzY29wZWRLZXlTZWNyZXQiOiJiYmVkZGQ0MDZmNmVjZjRhNjliYzYwNGRiMzEzODRmNTY2NWU0YzI0M2Q5NjkzZDU3ODVjY2U3NjI0YmExNjc4IiwiaWF0IjoxNzExNTY1MzkzfQ.ViwWw4K3gwOldfc15i5qmq3r0vzx-Rcta2LgIo_UrNE'
const pinataGateway = 'https://white-eldest-mouse-482.mypinata.cloud/ipfs/'

//Raydium
const PROGRAMIDS = [MAINNET_PROGRAM_ID, DEVNET_PROGRAM_ID]
const CURRENT_PROGRAMID = PROGRAMIDS[currentIndex]
const addLookupTableInfo = LOOKUP_TABLE_CACHE //only mainnet. other = undefined
const makeTxVersion = TxVersion.V0

//Mainnet and Devnet Pool IDs
const mainnetPoolFeeId = new web3.PublicKey(
  '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'
)
const devnetPoolFeeId = new web3.PublicKey(
  '3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR'
)

//Other Pool FEE IDs
const POOL_FEE_IDS = [
  mainnetPoolFeeId, //mainnet
  devnetPoolFeeId, //devnet
]

//CurrentPoolFeeIDs
const currentPoolFeeId = POOL_FEE_IDS[currentIndex]


const new_deploySessions = {}
const new_marketSessions = {}
const new_poolSessions = {}
const new_testSessions = {}

const newYear = {}
const newMonth = {}
const newDay = {}
const newHour = {}
const newMinute = {}
const newSecond = {}

// const s_newYear = {}
// const s_newMonth = {}
// const s_newDay = {}
// const s_newHour = {}
// const s_newMinute = {}
// const s_newSecond = {}

//Exports Token List.
//Export list.
module.exports = {
  botToken,
  allowedUsers,
  commands,
  deploySessions,
  marketSessions,
  poolSessions,
  testSessions,
  currentIndex,
  wsolName,
  wsolSymbol,
  wsolDecimals,
  wsolAddress,
  DEFAULT_DECIMALS,
  SOLANA_RPC_URL,
  CURRENT_RPC_URL,
  ownerSigner,
  traderSigner,
  ownerPublicKey,
  traderPublicKey,
  connection,
  umi,
  umiOwnerSigner,
  pinataJWTKey,
  pinataGateway,
  PROGRAMIDS,
  CURRENT_PROGRAMID,
  addLookupTableInfo,
  makeTxVersion,
  POOL_FEE_IDS,
  currentPoolFeeId,
}
