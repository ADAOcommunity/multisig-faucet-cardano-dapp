import React, { useState, useContext, useEffect } from 'react'
import WalletContext from "../utils/WalletContext"
import CardanoWallet, { Cardano } from "../cardano/cardano-wallet"
import { Buffer } from 'buffer'

const _Buffer = Buffer
// let wallet: any
const blockfrostApiKey = ''
let wallet
export default function ClaimButton({walletApi}: {walletApi:any}) {
    // const walletCtx: any = useContext(WalletContext)

    useEffect(() => {
        console.log("useEffect-walletApi")
        console.log(walletApi)
        // async function t() {

        //     const S = await Cardano();
        //     wallet = new CardanoWallet(
        //         S,
        //         walletCtx.walletApi,
        //         blockfrostApiKey
        //     )
        // }

        // t()
    }, [])

    const makeTx = async () => {
        const S = await Cardano();
        wallet = new CardanoWallet(
                        S,
                        walletApi,
                        'blockfrostApiKey'
                    )
        let utxos = await wallet.getUtxosHex();
        const myAddress = await wallet.getAddress();
        let netId = await wallet.getNetworkId();
        console.log(netId)
        const recipients = [{ "address": "addr1qx4suzvst55qy2ppyu5c4x2kct23kv6r26n6nhckqn3f22sjftnu9ft6l5qr2x49r5kg3wda6les343sa9cpcxjz40sqst8yae", "amount": "1" }]
        console.log(recipients)

        const t = await wallet.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            metadata: null,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
            multiSig: undefined
        })
        console.log(t)
    }


    return (
        <>
            <button onClick={() => makeTx()} className="m-2 p-10 text-white rounded-xl transition-all duration-500 bg-gradient-to-br to-blue-500 via-black from-blue-900 bg-size-200 bg-pos-0 hover:bg-pos-100">
                <h2>
                    Claim
                </h2>
            </button> 
        </>
    )
}

