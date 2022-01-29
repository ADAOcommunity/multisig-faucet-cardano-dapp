import type { NextApiRequest, NextApiResponse } from 'next';

import { CardanoWalletBackend } from '../../../cardano/cardano-wallet-backend';
const blockfrostApiKey = {
  0: `testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA`, // testnet
  1: `mainnetGHf1olOJblaj5LD8rcRudajSJGKRU6IL`, // mainnet
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
//   console.log(`address`);
//   console.log(address);

  if (!address) res.status(400).json(`address not provided`);

  const searchAddress = address.toString();
  const wallet = new CardanoWalletBackend(blockfrostApiKey);
  
  console.log("set privateKey")
  
  const beUtxos = await wallet.getAddressUtxos(searchAddress)
//   console.log('beUtxos')
//   console.log(beUtxos)

  res.status(200).json(beUtxos);
}
