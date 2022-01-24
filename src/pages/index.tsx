import Head from 'next/head';
import Image from 'next/image';
import WalletContext from "../utils/WalletContext"

import styles from '@/styles/Home.module.css';

import WalletConnect from '@/components/WalletConnect';
import { useContext, useEffect, useState } from 'react';

export default function Home() {
  const walletCtx: any = useContext(WalletContext)
  const [connected, setConnected] = useState(false)

  // useEffect(() => {
  //   setConnected(walletCtx.walletApi !== null);
  // }, [walletCtx])

  return (
    <div className={`${styles.container}  text-white transition-all duration-500 bg-gradient-to-tl from-purple-800 via-purple-600 to-purple-400 bg-size-200 bg-pos-0 hover:bg-pos-100`}>
      <Head>
        <title>Faucet for Cardano native assets</title>
        <meta name="description" content="Faucet for Cardano native assets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {walletCtx.walletApi !== null ? 
          <button className="m-2 p-10 text-white rounded-xl transition-all duration-500 bg-gradient-to-br to-purple-900 via-black from-purple-400 bg-size-200 bg-pos-0 hover:bg-pos-100">
            <h1 className={styles.title}>
             Claim
            </h1>
          </button> 
          : 
          <>
            <h1 className={styles.title}>
              Welcome to Cardano native assets faucet
            </h1>

            <p className={styles.description}>
              Get started by connecting your wallet
            </p>
          </>
        }


        <div className={styles.grid}>
          <WalletConnect/>

        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://cardano.org" target="_blank" rel="noopener noreferrer">
          Powered by{` `}
          <span className={styles.logo}>
            <Image
              src="/cardano-logo.svg"
              alt="Cardano Logo"
              width={24}
              height={24}
            />
          </span>
        </a>
      </footer>
    </div>
  );
}
