import Head from 'next/head';
import Image from 'next/image';
import WalletContext from "../utils/WalletContext"

import styles from '@/styles/Home.module.css';

import { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';


export default function Home() {
  const walletCtx: any = useContext(WalletContext)
  let [connected, setConnected] = useState(false)

  const WalletConnect = dynamic(() => import('../components/WalletConnect'), {ssr: false});

  // useEffect(() => {
  //   const connctd = walletCtx.walletApi !== null
  //   console.log("connctd")
  //   console.log(connctd)
  //   setConnected(connctd);
  //   return () => setConnected(false)
  // }, [])

  return (
    <div className={`${styles.container}  text-white transition-all duration-500 bg-gradient-to-tl from-blue-400 via-blue-800 to-black bg-size-200 bg-pos-0 hover:bg-pos-100`}>
      <Head>
        <title>Faucet for Cardano native assets</title>
        <meta name="description" content="Faucet for Cardano native assets - by ADAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {connected ? 
          <></> 
          :
          <>
            <h1 className={styles.title}>
              Welcome to Cardano native assets faucet
            </h1>

          </>
        }

        <div className={styles.grid}>
          <WalletConnect/>
        </div>
      </main>
      <footer className={styles.footer}>
        Powered by{``}
        <span >
          <a href="https://cardano.org" target="_blank" rel="noopener noreferrer">
            <Image
              src="/cardano-logo.svg"
              alt="Cardano Logo"
              width={24}
              height={24}
            />
          </a>
        </span>
        <span >
          <a href="https://theadadao.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/adao-full-logo.svg"
              alt="Cardano Logo"
              width={24}
              height={24}
            />
          </a>
        </span>
      </footer>
    </div>
  );
}
