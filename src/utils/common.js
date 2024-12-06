const web3 = require("@solana/web3.js")
const {
  buildSimpleTransaction,
  TOKEN_PROGRAM_ID,
  SPL_ACCOUNT_LAYOUT,
  LIQUIDITY_STATE_LAYOUT_V4,
  MARKET_STATE_LAYOUT_V3,
  SPL_MINT_LAYOUT,
  Liquidity,
  Market,
} = require("@raydium-io/raydium-sdk")
const {
  ownerSigner,
  ownerPublicKey,
  makeTxVersion,
  connection,
} = require("../config")

const isError = (value) => {
  return value instanceof Error
}

const sendTx = async (payer, txs) => {
  const txids = []
  console.log("Transaction Array: ", txs)
  for (const iTx of txs) {
    iTx.sign([payer])
    const rawTransaction = iTx.serialize()
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    })
    await connection.confirmTransaction(txid, "confirmed")
    txids.push(txid)
  }
  return txids
}

const sendTxDefault = async (payer, txs) => {
  const txids = []
  for (const iTx of txs) {
    if (iTx instanceof web3.VersionedTransaction) {
      iTx.sign([payer])
      txids.push(await connection.sendTransaction(iTx))
    } else {
      txids.push(await connection.sendTransaction(iTx, [payer]))
    }
  }
  return txids
}

const buildAndSendTx = async (InnerSimpleV0Transaction) => {
  console.log("arg:", ownerPublicKey, InnerSimpleV0Transaction)
  const willSendTx = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer: ownerPublicKey,
    innerTransactions: InnerSimpleV0Transaction,
    addLookupTableInfo: undefined,
  })
  console.log("passed1")
  return await sendTxDefault(ownerSigner, willSendTx)
}

const buildAndSendTxWithSigner = async (
  InnerSimpleV0Transaction,
  payerSigner
) => {
  const willSendTx = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer: payerSigner.publicKey,
    innerTransactions: InnerSimpleV0Transaction,
    addLookupTableInfo: undefined,
  })
  console.log("passed1")
  return await sendTxDefault(payerSigner, willSendTx)
}

const getWalletTokenAccount = async (wallet) => {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  })
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }))
}

const getWalletCustomTokenAccount = async (
  wallet,
  baseAddress,
  quoteAddress
) => {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  })

  const result = []
  walletTokenAccount.value.map((i) => {
    const address = String(SPL_ACCOUNT_LAYOUT.decode(i.account.data).mint)
    if (address == baseAddress || address == quoteAddress) {
      result.push({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
      })
    }
  })

  return result
}

const formatAmmKeysById = async (id) => {
  const account = await connection.getAccountInfo(new web3.PublicKey(id))
  if (account == null) throw Error("Get id info error")

  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data)

  const marketId = info.marketId
  const marketAccount = await connection.getAccountInfo(marketId)
  if (marketAccount == null) throw Error("Get market info error")

  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data)

  const lpMint = info.lpMint
  const lpMintAccount = await connection.getAccountInfo(lpMint)
  if (lpMintAccount == null) throw Error("Get lp mint info error")
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data)

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({
      programId: account.owner,
    }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({
      programId: info.marketProgramId,
      marketId: info.marketId,
    }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: web3.PublicKey.default.toString(),
  }
}

module.exports = {
  isError,
  sendTx,
  buildAndSendTx,
  getWalletTokenAccount,
  getWalletCustomTokenAccount,
  formatAmmKeysById,
  buildAndSendTxWithSigner,
}
