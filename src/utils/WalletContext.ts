import { createContext } from 'react';

const WalletContext = createContext({
  walletApi: null,
  update: (data: any) => {},
});

export default WalletContext;
