const web3 = require('@solana/web3.js')
const splToken = require('@solana/spl-token')

const { generateSigner, lamports } = require('@metaplex-foundation/umi')
const { createFungible } = require('@metaplex-foundation/mpl-token-metadata')

const {
  connection,
  umi,
  ownerSigner,
  ownerPublicKey,
  MEMO_PROGRAM_ID,
} = require('../config')
const chalk = require('chalk')

const convertSOLToWSOL = async (amountSOL) => {
  const lamports = Number(amountSOL) * web3.LAMPORTS_PER_SOL
  const wSOLMintAddress = new web3.PublicKey(
    'So11111111111111111111111111111111111111112'
  )
  let wSOLAccounts = await connection.getTokenAccountsByOwner(ownerPublicKey, {
    mint: wSOLMintAddress,
  })

  let wSOLAccount

  if (wSOLAccounts.value.length > 0) {
    wSOLAccount = wSOLAccounts.value[0].pubkey
    console.log('WSOLAccount: ', wSOLAccount)

    // let depositTx = await web3.SystemProgram.transfer({
    //   fromPubkey: ownerPublicKey,
    //   toPubkey: wSOLAccount,
    //   lamports: lamports,
    // })
    // const transaction = new web3.Transaction().add(depositTx)
    // let signature = await web3.sendAndConfirmTransaction(
    //   connection,
    //   transaction,
    //   [ownerSigner]
    // )
  } else {
    console.log('Amount of SOL: ', amountSOL)
    const lamports = Number(amountSOL) * web3.LAMPORTS_PER_SOL
    await splToken.create(connection, ownerSigner, ownerPublicKey, lamports)
  }
  // const wSolAccount = new web3.Keypair()
  // const lamports = Number(amountSOL) * web3.LAMPORTS_PER_SOL

  // let transaction = new web3.Transaction()

  // transaction.add(
  //   web3.SystemProgram.createAccount({
  //     fromPubkey: ownerPublicKey,
  //     newAccountPubkey: wSolAccount.publicKey,
  //     lamports: lamports,
  //     space: splToken.AccountLayout.span,
  //     programId: splToken.TOKEN_PROGRAM_ID,
  //   })
  // )

  // transaction.add(
  //   splToken.createInitializeAccountInstruction(
  //     splToken.TOKEN_PROGRAM_ID,
  //     splToken.NATIVE_MINT,
  //     wSolAccount.publicKey,
  //     ownerPublicKey
  //   )
  // )

  // let signature = await web3.sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [ownerSigner, wSolAccount]
  // )
}

const createSPLToken = async (name, symbol, initialSupply, uri) => {
  try {
    const umiMintSigner = generateSigner(umi)
    await createFungible(umi, {
      name: name,
      symbol: symbol,
      decimals: 6,
      uri: uri,
      sellerFeeBasisPoints: 0,
      mint: umiMintSigner,
    }).sendAndConfirm(umi)
    console.log(chalk.green(`Mint Address: ${umiMintSigner.publicKey}`))

    const mintPublicKey = new web3.PublicKey(umiMintSigner.publicKey)
    const ataAddress = await splToken.createAssociatedTokenAccount(
      connection,
      ownerSigner,
      mintPublicKey,
      ownerPublicKey
    )
    const ataOwnerKey = new web3.PublicKey(ataAddress)
    const amountToMint = BigInt(initialSupply) * BigInt(10) ** BigInt(6)
    await splToken.mintTo(
      connection,
      ownerSigner,
      mintPublicKey,
      ataOwnerKey,
      ownerSigner,
      amountToMint
    )

    console.log(chalk.green(`Mint: ${mintPublicKey}`))
    console.log(chalk.green(`Ata: ${ataOwnerKey}`))
    return { mintPublicKey, ataOwnerKey }
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = {
  createSPLToken,
  convertSOLToWSOL,
}
