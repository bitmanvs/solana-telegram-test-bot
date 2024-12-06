const { BN } = require('bn.js')
const assert = require('assert')
const web3 = require('@solana/web3.js')
const {
  MarketV2,
  Token,
  TOKEN_PROGRAM_ID,
  Liquidity,
  TokenAmount,
  Percent,
  jsonInfo2PoolKeys,
  Currency,
  SOL,
  CurrencyAmount,
} = require('@raydium-io/raydium-sdk')
const {
  connection,
  DEFAULT_DECIMALS,
  CURRENT_PROGRAMID,
  ownerSigner,
  ownerPublicKey,
  addLookupTableInfo,
  wsolAddress,
  makeTxVersion,
  devnetFeeId,
  wsolDecimals,
  wsolSymbol,
  wsolName,
  user1Signer,
  user1PublicKey,
} = require('../config')

const {
  buildAndSendTx,
  getWalletTokenAccount,
  formatAmmKeysById,
  buildAndSendTxWithSigner,
} = require('./common')

const createMarket = async (name, symbol, mint, lotSize, tickSize) => {
  const baseMintPublicKey = new web3.PublicKey(mint)
  const quoteMintPublicKey = new web3.PublicKey(wsolAddress)

  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    baseMintPublicKey,
    DEFAULT_DECIMALS,
    symbol,
    name
  )

  const wsolPublicKey = new web3.PublicKey(wsolAddress)
  const quoteToken = new Token(
    TOKEN_PROGRAM_ID,
    wsolPublicKey,
    wsolDecimals,
    wsolSymbol,
    wsolName
  )

  const createMarketInstruction =
    await MarketV2.makeCreateMarketInstructionSimple({
      connection,
      wallet: ownerPublicKey,
      baseInfo: baseToken,
      quoteInfo: quoteToken,
      lotSize: Number(lotSize),
      tickSize: Number(tickSize),
      dexProgramId: CURRENT_PROGRAMID.OPENBOOK_MARKET,
      makeTxVersion,
    })

  const txids = await buildAndSendTx(createMarketInstruction.innerTransactions)
  const addresses = createMarketInstruction.address

  return {
    txids,
    addresses,
  }
}

const createPoolSnipeTokens = async (
  name,
  symbol,
  mintAddress,
  marketId,
  baseAmount,
  quoteAmount,
  snipeRate
) => {
  const baseMintPublicKey = new web3.PublicKey(mintAddress)
  const quoteMintPublicKey = new web3.PublicKey(wsolAddress)
  const targetMarketId = new web3.PublicKey(marketId)

  console.log('Snipe Base: ', Number(baseAmount))
  console.log('Snipe Quote: ', Number(quoteAmount))

  const bnBaseAmount = new BN(Number(baseAmount))
  const bnBaseDecimals = new BN(10 ** 6)

  const bnQuoteAmount = new BN(Number(quoteAmount))
  const bnQuoteDecimals = new BN(10 ** 9)

  const addBaseAmount = bnBaseAmount.mul(bnBaseDecimals)
  const addQuoteAmount = bnQuoteAmount.mul(bnQuoteDecimals)

  const baseToken = new Token(
    TOKEN_PROGRAM_ID,
    baseMintPublicKey,
    DEFAULT_DECIMALS,
    symbol,
    name
  )
  const quoteToken = new Token(
    TOKEN_PROGRAM_ID,
    quoteMintPublicKey,
    wsolDecimals,
    wsolSymbol,
    wsolName
  )

  const startTime = Math.floor(Date.now() / 1000) + 20
  const startPrice = baseAmount / quoteAmount
  const walletTokenAccounts = await getWalletTokenAccount(ownerPublicKey)

  // const walletCustomTokenAccounts = await getWalletCustomTokenAccount(
  //   connection,
  //   ownerPublicKey,
  //   baseMintPublicKey.toString(),
  //   quoteMintPublicKey.toString()
  // )
  // console.log("Wallets: ", walletTokenAccounts)
  // console.log("WalletTokenAccounts: ", walletCustomTokenAccounts)

  // console.log("BaseToken: ", baseToken)
  // console.log("Quote Token: ", quoteToken)
  // console.log("MarketID: ", targetMarketId)
  // console.log("BaseAmount: ", addBaseAmount)
  // console.log("QuoteAmount: ", addQuoteAmount)

  const initPoolInstructionResponse =
    await Liquidity.makeCreatePoolV4InstructionV2Simple({
      connection,
      programId: CURRENT_PROGRAMID.AmmV4,
      marketInfo: {
        marketId: targetMarketId,
        programId: CURRENT_PROGRAMID.OPENBOOK_MARKET,
      },
      baseMintInfo: baseToken,
      quoteMintInfo: quoteToken,
      baseAmount: addBaseAmount,
      quoteAmount: addQuoteAmount,
      startTime: new BN(Math.floor(startTime)),
      ownerInfo: {
        feePayer: ownerPublicKey,
        wallet: ownerPublicKey,
        tokenAccounts: walletTokenAccounts,
        useSOLBalance: true,
      },
      associatedOnly: false,
      checkCreateATAOwner: true,
      makeTxVersion,
      feeDestinationId: devnetFeeId,
    })

  console.log('passed to function')
  const txids = await buildAndSendTx(
    initPoolInstructionResponse.innerTransactions
  )
  const addresses = initPoolInstructionResponse.address

  return { txids, addresses }
}

const swapOnlyAMM = async () => {
  const quoteMintPublicKey = new web3.PublicKey(
    '5oUdzoB7y3QgKgGxLJqD8zR2M76KNrB59H6PaQhaq5ys'
  )

  const outputToken = new Token(
    TOKEN_PROGRAM_ID,
    quoteMintPublicKey,
    6,
    'DOM',
    'Dog Climb'
  )

  const targetPool = '4aobafUvr721QYXGcqf9qieCfxCdc1GC2zc7QVzEnJPP'
  const inputTokenAmount = new CurrencyAmount(SOL, '0.1', false)
  const slippage = new Percent(1, 100)
  const walletTokenAccounts = await getWalletTokenAccount(user1PublicKey)

  const targetPoolInfo = await formatAmmKeysById(targetPool)
  assert(targetPoolInfo, 'cannot find the target pool')

  console.log('Pool Data: ', targetPoolInfo)

  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo)

  const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
    poolKeys: poolKeys,
    poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
    amountIn: inputTokenAmount,
    currencyOut: outputToken,
    slippage: slippage,
  })

  // -------- step 2: create instructions by SDK function --------
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: walletTokenAccounts,
      owner: user1PublicKey,
    },
    amountIn: inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: 'in',
    makeTxVersion,
  })

  console.log(
    'amountOut:',
    amountOut.toFixed(),
    '  minAmountOut: ',
    minAmountOut.toFixed()
  )

  return {
    txids: await buildAndSendTxWithSigner(innerTransactions, user1Signer),
  }
}

module.exports = {
  createMarket,
  createPoolSnipeTokens,
  swapOnlyAMM,
}
