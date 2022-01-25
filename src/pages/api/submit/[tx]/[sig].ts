// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { CardanoWalletBackend } from '../../../../cardano/cardano-wallet-backend'
let blockfrostApiKey = {
  0: "testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA", // testnet
  1: "mainnetGHf1olOJblaj5LD8rcRudajSJGKRU6IL" // mainnet
}

type IPolicy = {
  id: string,
  script: string,
  paymentKeyHash: string,
  ttl: number
}

export default async function(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const { tx } = req.query
  const { sig } = req.query
  console.log("tx")
  console.log(tx)
  // const body = req.body
  if (!tx || !sig) res.status(400).json("signed Tx not provided")

  const transaction = tx.toString()
  const signature = sig.toString()
  // console.log("transaction")
  // console.log(transaction)
  var wallet =  new CardanoWalletBackend( blockfrostApiKey )             
  // let privateKey = wallet.createNewBech32PrivateKey()
  // console.log("witness")
  // console.log(privateKey)
  wallet.setPrivateKey("xprv1qrwqn6suuugz7g06y28xhf28anqhfsv4xlejqk0eruscfzv2p39t969q6sg29e32x3nvpl4wx7ww3dl90s9ak0p0pqfx3pkscppt2g3n2esguwyzv3320x5hautp0uskc8ryskr3vr0kx4f9qnyje7dlfyulcnul")
  let [txInputsFinal, recipientsFinal, metadata, fee] = await wallet.decodeTransaction(transaction, 1) 
  console.log("txInputsFinal, recipientsFinal, metadata, fee")
  console.log(recipientsFinal)
  const beSig = wallet.signTx(tx)
  // console.log("beSig")
  // console.log(beSig)
  const signatures = [signature, beSig]
  // let networkId = 1
  // const expirationTime = new Date();
  // expirationTime.setTime(expirationTime.getTime() + (24 * 60 * 60 * 1000))  // 24hrs in milliseconds
  // let policy: IPolicy = await wallet.createLockingPolicyScript(networkId, expirationTime)
  // console.log("policy")
  // console.log(policy)
  // let polId = policy.id
  let polId = "10205d334b043dc986643a45cf0554943da622f0c0f31519d482c8f8"
  
  let meta: any = 
  {
    "721": {
        "10205d334b043dc986643a45cf0554943da622f0c0f31519d482c8f8": {
          "TestADAONFT": {
            "name":"TestADAONFT",
            "description":"This is a test TestADAONFT",
            "image":"ipfs://QmXLFXBRwRSodmxmGiEQ8d5u9jqMZxhUD5Umx5mdM3mNZp"
          }
      }
    }
  }
  // console.log("meta")
  // console.log(meta)
  const metaDataHash = wallet.hashMetadata(meta) //d1dec0a6c05fe16a95faa907dd5f873b67074a823eaf6337bfe408a0df7e53fa
  console.log("metaDataHash")
  console.log(metaDataHash)
  
  // const txhash = await wallet.submitTx({transactionRaw: transaction, witnesses: [signature], scripts: null, networkId: 1})
  console.log("Pre-txHash")
  
  const txHash = await wallet.submitTx({
    transactionRaw: transaction,
    witnesses: signatures,
    scripts: null,
    metadata: meta,
    networkId: 1
  })
  console.log("txHash")
  console.log(txHash)

  res.status(200).json(txHash);
}
