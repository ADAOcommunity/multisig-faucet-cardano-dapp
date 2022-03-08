import React, { useState, useContext, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import CardanoWallet from "../cardano/cardano-wallet"
import { Buffer } from 'buffer'
import { ChevronDownIcon } from '@heroicons/react/solid'
import useCardanoWallet from '@/cardano/cardano-wallet/useCardanoWallet'
import { Address } from '@emurgo/cardano-serialization-lib-browser'
import { useProtocolParametersQuery } from '@/cardano/cardano-wallet/query-api'
import { ConfigContext } from '@/cardano/cardano-wallet/config'
import { Recipient } from '@/cardano/cardano-wallet/types'
// import WalletContext from '../utils/WalletContext'

let wallet
const _Buffer = Buffer

export default function WalletConnect() {
    let [address, setAddress] = useState('')
    let [connected, setConnected] = useState(false)
    const [config, _] = useContext(ConfigContext)
    let pParams = useProtocolParametersQuery(config);
    let cardanoWallet = useCardanoWallet()

    const setAddressBech32 = async () => {
        console.log('setAddressBech32')
        if(cardanoWallet && cardanoWallet.wallet) {
            console.log(cardanoWallet)
            const address = (await cardanoWallet.wallet.getUsedAddresses())[0]
            if(address) {
                const addReadable = Address.from_bytes(_Buffer.from(address.toString(), 'hex')).to_bech32()
                console.log(addReadable)
                setAddress(addReadable)
            }
        }
    }

    const makeTx = async () => {
        if(!cardanoWallet) return
        if(pParams.type !== 'ok') return
        
        let utxos = await cardanoWallet.wallet?.getUtxos();
        const myAddress = await cardanoWallet.getAddress();
        const myAddressHex = await cardanoWallet.getAddressHexString();
        let netId = await cardanoWallet.getNetworkId();
        console.log({myAddress, netId})
        const date = new Date()
        const policy = await cardanoWallet.createLockingPolicyScript(myAddressHex, new Date(date.getTime() + 100*60000), pParams.data)
        if(!policy) return
        let recipients: Recipient[] = [
            {address: "addr1qx8p9zjyk2us3jcq4a5cn0xf8c2ydrz2cxc5280j977yvc0gtg8vh0c9sp7ce579jhpmynlk758lxhvf52sfs9mrprws3mseux", amount: "1"}, // Seller Wallet, NFT price 10ADA
            {address: `${myAddress}`,  amount: "0", mintedAssets: [{
                assetName: 'TestDZ', policyId: policy.id, policyScript: policy.script, quantity: '1'
            }]}
        ]
        let dummyMetadata = {
            "721": {
            "edf578cc1edc64c799812c541cef7343a5cb58cf85e109b1da91b836": {
                    "TestADAONFT": {
                    "name":"TestADAONFT",
                    "description":"This is a test TestADAONFT",
                    "image":"ipfs://QmXLFXBRwRSodmxmGiEQ8d5u9jqMZxhUD5Umx5mdM3mNZp"
                    }
                }
            }
        }
        const t = await cardanoWallet.transaction({
            ProtocolParameters: pParams.data,
            PaymentAddress: myAddress,
            utxosRaw: utxos,
            recipients: recipients,
            addMetadata: false,
            multiSig: false,
            networkId: netId.id,
            ttl: 36000,
            metadata: dummyMetadata,
            delegation: null,
            metadataHash: 'cc694bce660a0d85db75a3100bfcd18f45f4d5e2991ba5b62466b328a8c6b1af'
        })
        console.table(t)
        try {
            if(t){
                console.log('t')
                console.log(t)
                const signature = await cardanoWallet.signTx(Buffer.from(t.to_bytes()).toString('hex'), false)
                if(signature) {
                    cardanoWallet.wallet?.submitTx(signature)
                }
            }
        }
        catch(err){
            console.log(err)
        }
        
    }

    const enableCardano = async (wallet = 'nami') => {
        if(!(window as any).cardano) return
        console.log('enableCardano')
      
        if(await cardanoWallet?.enable(wallet)) {
            setConnected(true)
            setAddressBech32()
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


function WalletDropdown({enableWallet, address} : {enableWallet: any, address: string}) {
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