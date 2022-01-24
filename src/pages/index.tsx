import Head from 'next/head';
import Image from 'next/image';
import WalletContext from "../utils/WalletContext"

import styles from '@/styles/Home.module.css';

import { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

let claimButton: any

export default function Home() {
  const walletCtx: any = useContext(WalletContext)
  let [connected, setConnected] = useState(false)

  const WalletConnect = dynamic(() => import('../components/WalletConnect'), {ssr: false});

  // useEffect(() => {
  //   const connctd = walletCtx.walletApi !== null
  //   setConnected(connctd);
  //   if(connected) claimButton = dynamic(() => import('../components/ClaimButton').then((a: any) => a), {ssr: false});
  // }, [walletCtx])

  return (
    <div className={`${styles.container}  text-white transition-all duration-500 bg-gradient-to-tl from-blue-400 via-blue-800 to-black bg-size-200 bg-pos-0 hover:bg-pos-100`}>
      <Head>
        <title>Faucet for Cardano native assets</title>
        <meta name="description" content="Faucet for Cardano native assets - by ADAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
          <>
            <h1 className={styles.title}>
              Welcome to Cardano native assets faucet
            </h1>

            <p className={styles.description}>
              Get started by connecting your wallet
            </p>
          </>

        <div className={styles.grid}>
          <WalletConnect/>

        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://cardano.org" target="_blank" rel="noopener noreferrer">
          Powered by{``}
          <span className={styles.logo}>
            <Image
              src="/cardano-logo.svg"
              alt="Cardano Logo"
              width={24}
              height={24}
            />
          </span>
          <br/>
          
          <span className={styles.logo}>
            <Image
              src="/adao-full-logo.svg"
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
