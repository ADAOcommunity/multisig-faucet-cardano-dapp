import type { NextApiRequest, NextApiResponse } from 'next';

import { CardanoWalletBackend } from '../../../cardano/cardano-wallet-backend';
const blockfrostApiKey = {
  0: `testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA`, // testnet
  1: `mainnetGHf1olOJblaj5LD8rcRudajSJGKRU6IL`, // mainnet
};

export default async function (req: NextApiRequest, res: NextApiResponse) {

  console.log(`default address`);
  // console.log('addr1vxpaycxf8q39q63ra82zswrdnfkpt2v555ecjztgqv4rw6ss3qyje');
  // const body = req.body

  const searchAddress = 'addr1vxpaycxf8q39q63ra82zswrdnfkpt2v555ecjztgqv4rw6ss3qyje'
  const wallet = new CardanoWalletBackend(blockfrostApiKey);
  
  console.log("set privateKey")
  
  const beUtxos = await wallet.getAddressUtxos(searchAddress)

  res.status(200).json(beUtxos);
}
