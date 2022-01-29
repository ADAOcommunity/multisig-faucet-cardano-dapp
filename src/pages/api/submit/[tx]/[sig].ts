// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { CardanoWalletBackend } from '../../../../cardano/cardano-wallet-backend';
const blockfrostApiKey = {
  0: `testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA`, // testnet
  1: `mainnetGHf1olOJblaj5LD8rcRudajSJGKRU6IL`, // mainnet
};

// type IPolicy = {
//   id: string;
//   script: string;
//   paymentKeyHash: string;
//   ttl: number;
// };

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { tx } = req.query;
  const { sig } = req.query;
  console.log(`tx`);
  console.log(tx);
  // const body = req.body
  if (!tx || !sig) res.status(400).json(`signed Tx not provided`);

  const transaction = tx.toString();
  const signature = sig.toString();
  // console.log("transaction")
  // console.log(transaction)
  const wallet = new CardanoWalletBackend(blockfrostApiKey);
  // let privateKey = wallet.createNewBech32PrivateKey()
  // console.log("privateKey")
  // console.log(privateKey)
  wallet.setPrivateKey(
    // privateKey
    `xprv1cq59h28ua72fhd3y8nu6uhnwlwfz4atp65p59weht5fqsg3jvfgcnldqvsgwxz05gnzus7mmujc0xgcwvevmk4k685me9a3yyftttru6yrnmxm83t8mfvrzu9d6qf3s5vyq2vul4ckch206p43vmcffkmua8yd7t`,
    'addr1vxpaycxf8q39q63ra82zswrdnfkpt2v555ecjztgqv4rw6ss3qyje'
  );
  console.log("set privateKey")
  
  let [txInputsFinal, recipientsFinal, metadata, fee] = await wallet.decodeTransaction(transaction, 1);
  // console.log("recipientsFinal");
  // console.log(recipientsFinal);
  // console.log("txInputsFinal");
  // console.log(txInputsFinal);
  const beSig = wallet.signTx(tx);
  console.log("beSig")
  console.log(beSig)
  const signatures = [signature, beSig];
  // let networkId = 1
  // const expirationTime = new Date();
  // expirationTime.setTime(expirationTime.getTime() + (365 * 24 * 60 * 60 * 1000))  // 365*24hrs in milliseconds
  // let policy: IPolicy = await wallet.createLockingPolicyScript(networkId, expirationTime)
  // console.log("policy")
  // console.log(policy)
  // let polId = policy.id
  // let polId = `edf578cc1edc64c799812c541cef7343a5cb58cf85e109b1da91b836`

  // const meta: any = {
  //   '721': {
  //     'edf578cc1edc64c799812c541cef7343a5cb58cf85e109b1da91b836': {
  //       TestADAONFT: {
  //         name: `TestADAONFT`,
  //         description: `This is a test TestADAONFT`,
  //         image: `ipfs://QmXLFXBRwRSodmxmGiEQ8d5u9jqMZxhUD5Umx5mdM3mNZp`,
  //       },
  //     },
  //   },
  // };
  // console.log("meta")
  // console.log(meta)
  // const metaDataHash = wallet.hashMetadata(meta); //cc694bce660a0d85db75a3100bfcd18f45f4d5e2991ba5b62466b328a8c6b1af
  // console.log(`metaDataHash`);
  // console.log(metaDataHash);

  // const txhash = await wallet.submitTx({transactionRaw: transaction, witnesses: [signature], scripts: null, networkId: 1})
  // console.log('Pre-txHash');
  // const beUtxos = await wallet.getAddressUtxos('addr1vxpaycxf8q39q63ra82zswrdnfkpt2v555ecjztgqv4rw6ss3qyje')
  // console.log('beUtxos')
  // console.log(beUtxos)
  const txHash = await wallet.submitTx({
    transactionRaw: transaction,
    witnesses: signatures,
    scripts: null,
    // metadata: meta,
    networkId: 1,
  });

  console.log('txHash');
  console.log(txHash);

  res.status(200).json({txHash: txHash});
}
