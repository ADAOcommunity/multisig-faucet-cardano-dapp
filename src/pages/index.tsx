import Head from 'next/head';
import Image from 'next/image';

import styles from '@/styles/Home.module.css';

import WalletConnect from '@/components/WalletConnect';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Faucet for Cardano native assets</title>
        <meta name="description" content="Faucet for Cardano native assets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Cardano native assets faucet
        </h1>

        <p className={styles.description}>
          Get started by connecting your wallet
        </p>

        <div className={styles.grid}>
          <WalletConnect/>

          {/* <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>
          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=typescript-nextjs-starter"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a> */}
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
