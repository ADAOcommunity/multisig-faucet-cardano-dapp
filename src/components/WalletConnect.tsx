import React, { useState, useContext, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import WalletContext from "../utils/WalletContext"
import loader from '../cardano/cardano-wallet/loader'
import { Buffer } from 'buffer'
import { ChevronDownIcon } from '@heroicons/react/solid'

const _Buffer = Buffer

export default function WalletConnect() {
    let [address, setAddress] = useState('')
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
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
            <h2 style={{overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "60vw"}}>
                {address === '' ? 'Connect' : address}
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