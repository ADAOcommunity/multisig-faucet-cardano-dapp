import { AppProps } from 'next/app';
import '@/styles/global.css';
import { useState } from 'react';
import WalletContext from '@/utils/WalletContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [state, setState] = useState({
    walletApi: null,
    update
  })

  function update(data: any) {
    setState(Object.assign({}, state, data));
  }
  return <>
          <WalletContext.Provider value={state}>
            <Component {...pageProps} />
          </WalletContext.Provider>
        </>
}
