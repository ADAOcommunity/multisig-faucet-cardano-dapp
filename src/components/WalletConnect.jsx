import React, { useState, useContext, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import CardanoWallet, { Cardano } from "../cardano/cardano-wallet"
import loader from '../cardano/cardano-wallet/loader'
import { Buffer } from 'buffer'
import { ChevronDownIcon } from '@heroicons/react/solid'
// import WalletContext from '../utils/WalletContext'

let wallet
const _Buffer = Buffer

export default function WalletConnect() {
    let [address, setAddress] = useState('')
    let [connected, setConnected] = useState(false)
    let [walletState, setWalletState] = useState()
    // const walletCtx = useContext(WalletContext)

    const setAddressBech32 = async (walletApi) => {
        if(walletApi) {
            await loader.load()
            const loaded = typeof loader !== 'undefined'
            console.log("loader")
            console.log(loaded)
            if(loaded) {
                const loadedLoader = loader
                const address = (await walletApi.getUsedAddresses())[0]
                const addReadable = loadedLoader.Cardano.Address.from_bytes(_Buffer.from(address, 'hex')).to_bech32()
                console.log(addReadable)
                setAddress(addReadable)
            }
        }
    }

    const makeTx = async () => {
        let blockfrostApiKey = {
            0: "testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA", // testnet
            1: "mainnetGHf1olOJblaj5LD8rcRudajSJGKRU6IL" // mainnet
            }
        
        console.log("makeTx")
        const S = await Cardano();
        wallet = new CardanoWallet(
                        S,
                        walletState,
                        blockfrostApiKey
                    )
        let utxos = await wallet.getUtxosHex();
        const res = await fetch(`/api/utxos`).then(res => res.json())
        console.log("res")
        console.log(res)
        console.log("utxos")
        console.log(utxos)
        utxos = utxos.concat(res)
        console.log("utxos concat")
        console.log(utxos)
        const myAddress = await wallet.getAddress();
        let netId = await wallet.getNetworkId();
        // const recipients = [{ "address": "addr1qx4suzvst55qy2ppyu5c4x2kct23kv6r26n6nhckqn3f22sjftnu9ft6l5qr2x49r5kg3wda6les343sa9cpcxjz40sqst8yae", "amount": "1" }]
        let recipients = [
            {address: "addr1qx8p9zjyk2us3jcq4a5cn0xf8c2ydrz2cxc5280j977yvc0gtg8vh0c9sp7ce579jhpmynlk758lxhvf52sfs9mrprws3mseux", amount: "2"}, // Seller Wallet, NFT price 10ADA
            {address: `${myAddress}`,  amount: "0",
             assets:[{"unit":"10205d334b043dc986643a45cf0554943da622f0c0f31519d482c8f8.TestADAONFT","quantity":"1"}]} // NFTs to be sent
            ]

        const t = await wallet.transaction({
            PaymentAddress: myAddress,
            utxosRaw: utxos,
            recipients: recipients,
            addMetadata: false,
            multiSig: true,
            networkId: netId.id,
            ttl: 36000
        })
        try {
            const signature = await wallet.signTx(t, true)
            const res = await fetch(`/api/submit/${t}/${signature}`).then(res => res.json())
            // const res = 'res-temp'
            // const txhash = await wallet.submitTx({transactionRaw: t, witnesses: [signature], networkId: 1})
            console.log(`${res}`)
        }
        catch(err){
            console.log(err)
        }
        
    }

    const enableCardano = async (wallet = 'nami') => {
        const win = window

        if(!win.cardano) return
  
        let baseWalletApi, fullWalletApi
        switch(wallet){
          case 'nami':
            baseWalletApi = win.cardano.nami
            break
          case 'ccvault':
            baseWalletApi = win.cardano.ccvault
            break
          case 'flint':
            baseWalletApi = win.cardano.flint
            break
        default:
            break
        }
  
        switch(wallet){
          case 'nami':
            fullWalletApi = await baseWalletApi.enable()
            break
          case 'ccvault':
            fullWalletApi = await baseWalletApi.enable()
            break
          case 'flint':
            fullWalletApi = await baseWalletApi.enable()
            break
          default:
            break
        }

        if(!await baseWalletApi.isEnabled()) return
        else {
            console.log(fullWalletApi)
            wallet = fullWalletApi
            setWalletState(fullWalletApi)
            setConnected(true)
            setAddressBech32(fullWalletApi)
            // try{
                // walletCtx.update({walletApi: fullWalletApi})
            // } catch(err){ 
            //     console.log("walletCtx")
            //     console.log(walletCtx)
            // }
        }
    }

    return (
        <>  
            {connected ? 
                <button onClick={() => makeTx()} className="m-2 p-10 text-white rounded-xl transition-all duration-500 bg-gradient-to-br to-blue-500 via-black from-blue-900 bg-size-200 bg-pos-0 hover:bg-pos-100">
                <h2>
                    Claim
                </h2>
                </button> 
                :
                <></>
            }
            <WalletDropdown enableWallet={enableCardano} address={address}/>
        </>
    )
}


function WalletDropdown({enableWallet, address}) {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
            <h2 style={{overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "60vw"}}>
                {address === '' ? 'Get started by connecting your wallet' : address}
            </h2>
            <ChevronDownIcon
              className="w-5 h-5 ml-2 -mr-1 text-blue-200 hover:text-blue-100"
              aria-hidden="true"
            />
        </Menu.Button>
        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                    {({ active }) => (
                        <button className={`${
                            active ? 'bg-blue-500 text-white' : 'text-gray-900'
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`} 
                            onClick={() => enableWallet('nami')}
                        >
                            Nami
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                    <button className={`${
                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`} 
                        onClick={() => enableWallet('ccvault')}
                    >
                        ccvault
                    </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                    <button className={`${
                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`} 
                        onClick={() => enableWallet('flint')}
                    >
                        Flint
                    </button>
                    )}
                </Menu.Item>
            </Menu.Items>
        </Transition>
      </Menu>
    )
}