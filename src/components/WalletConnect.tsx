import React, { useState, useContext } from 'react'
import { Menu, Transition } from '@headlessui/react'
import WalletContext from "../utils/WalletContext"
import loader from '../cardano/cardano-wallet/loader'
import { Buffer } from 'buffer'

const _Buffer = Buffer

export default function WalletConnect() {
    let [address, setAddress] = useState('')
    let [connected, setConnected] = useState(false)
    const walletCtx: any = useContext(WalletContext)

    const setAddressBech32 = async (walletApi: any) => {
        if(walletApi) {
            await loader.load()
            const loaded = typeof loader !== 'undefined'
            console.log("loader")
            console.log(loaded)
            if(loaded) {
                const loadedLoader : any = loader
                const address = (await walletApi.getUsedAddresses())[0]
                const addReadable = loadedLoader.Cardano.Address.from_bytes(_Buffer.from(address, 'hex')).to_bech32()
                console.log(addReadable)
                setAddress(addReadable)
            }
        }
    }

    const enableCardano = async (wallet: string = 'nami') => {
        const win: any = window

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
            walletCtx.update({walletApi: fullWalletApi})
            await setAddressBech32(fullWalletApi)
            setConnected(true)
        }
    }

    return (
        <>
            <WalletDropdown enableWallet={enableCardano} address={address}/>
        </>
    )
}


function WalletDropdown({enableWallet, address} : {enableWallet: Function, address: string}) {
    return (
      <Menu>
        <Menu.Button>{address === '' ? 'Connect' : address}</Menu.Button>
        <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
        >
            <Menu.Items>
                <Menu.Item>
                    {({ active }) => (
                    <div className={`${active && 'bg-blue-500'}`} onClick={() => enableWallet('nami')}>Nami</div>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                    <div className={`${active && 'bg-blue-500'}`} onClick={() => enableWallet('ccvault')}>ccvault</div>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                    <div className={`${active && 'bg-blue-500'}`} onClick={() => enableWallet('flint')}>Flint</div>
                    )}
                </Menu.Item>
            </Menu.Items>
        </Transition>
      </Menu>
    )
}