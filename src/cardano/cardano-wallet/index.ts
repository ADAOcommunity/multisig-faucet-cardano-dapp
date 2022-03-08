import { Buffer } from 'buffer';
import AssetFingerprint from '@emurgo/cip14-js';
import { TransactionBuilder, Transaction, TransactionOutputs, TransactionUnspentOutput, CoinSelectionStrategyCIP2, NativeScript, AssetName, Int, BigNum, BaseAddress } from '@emurgo/cardano-serialization-lib-browser'

import { ProtocolParameters, useProtocolParametersQuery } from './query-api'
import { Config, ConfigContext } from './config'
import { Value } from '@emurgo/cardano-serialization-lib-browser'
import { useContext } from 'react';
import {
    MintedAsset,
    Policy,
    UTXO,
    AssetHolding,
    ValueHolding,
    Recipient,
    WalletApi,
    Asset,
    Delegation
} from './types';
import { walletConfig } from './wallet-config';

const ERROR = {
    FAILED_PROTOCOL_PARAMETER:
        'Couldnt fetch protocol parameters from blockfrost',
    TX_TOO_BIG: 'Transaction too big',
};

export type CardanoWASM = typeof import('@emurgo/cardano-serialization-lib-browser');

export class CardanoWallet {
    private _wasm: CardanoWASM
    private _walletApi: WalletApi | undefined
    private _protocolParameter: ProtocolParameters | undefined

    public constructor(wasm: CardanoWASM) {
        this._wasm = wasm
    }

    public async enable(walletname: string){
        this._walletApi = await (walletConfig as any)[walletname.toLowerCase()].enable()
        if(this._walletApi) return true 
        else return false
        // localStorage.setItem('cardano-web3-wallet', walletname)
    }
   
    public setWallet(walletApi: WalletApi) {
        this._walletApi = walletApi
    }

    public get lib() {
        return this._wasm
    }

    public get wallet() {
        return this._walletApi
    }

    isEnabled() {
        if (this.wallet) return true
        return false
    }
    async getBaseAddress(): Promise<BaseAddress | null> {
        if (!this.wallet) return null
        try {
            return await this.wallet.getChangeAddress()
        }
        catch (ex) {
            console.log('wallet.getBaseAddress: error')
            console.table(ex)
            return null
        }
    }
    async getAddressHex(): Promise<Buffer | null> {
        if (!this.wallet) return null
        try {
            return Buffer.from(
                ((await this.wallet.getChangeAddress()).toString()),
                'hex'
            )
        }
        catch (ex) {
            console.log('wallet.getAddressHex: error')
            console.table(ex)
            return null
        }
    }

    async getAddress(): Promise<string> {
        const addressHex = await this.getAddressHex()
        console.log('getAddress')
        console.log(addressHex)
        if (!this.wallet || !addressHex) return ''

        const address = this.lib.BaseAddress.from_address(
            this.lib.Address.from_bytes(addressHex)
        )
            ?.to_address()
            ?.to_bech32()
        if (!address) return ''
        return address
    }

    async getAddressHexString(): Promise<string> {
        const addressHex = await this.getAddressHex()
        if (!addressHex) return ''
        return addressHex.toString('hex')
    }

    async getNetworkId(): Promise<{
        id: number;
        network: string;
    }> {
        if (!this.wallet) return {
            id: 2,
            network: 'unknown'
        }
        let networkId = await this.wallet.getNetworkId()
        return {
            id: networkId,
            network: networkId === 1 ? 'mainnet' : 'testnet'
        }
    }

    async getBalance(protocolParameters: ProtocolParameters): Promise<ValueHolding> {
        
        if (!this.wallet || !protocolParameters) return {
            lovelace: '0',
            assets: []
        }
        this._protocolParameter = protocolParameters
        const valueCBOR = await this.wallet.getBalance()
        const value = valueCBOR
        const utxos = await this.wallet.getUtxos()

        let countedValue = this.lib.Value.new(this.lib.BigNum.from_str('0'))
        utxos.forEach((element) => {
            countedValue = countedValue.checked_add(element.output().amount())
        })

        const minAda = this.lib.min_ada_required(
            countedValue,
            false,
            this.lib.BigNum.from_str(this._protocolParameter.coinsPerUtxoWord.toString())
        );

        const availableAda = countedValue.coin().checked_sub(minAda)
        const lovelace = availableAda.to_str()
        const assets: AssetHolding[] = [];
        const multiAssetVal = value?.multiasset()
        if (multiAssetVal) {
            const multiAssets = multiAssetVal.keys();
            for (let j = 0; j < multiAssets.len(); j++) {
                const policy = multiAssets.get(j);
                const policyAssets = multiAssetVal.get(policy);
                const assetNames = policyAssets?.keys();
                if (policyAssets && assetNames) {
                    for (let k = 0; k < assetNames.len(); k++) {
                        const policyAsset = assetNames.get(k);
                        if (policyAsset) {
                            const quantity = policyAssets.get(policyAsset);
                            if (quantity) {
                                const asset =
                                    Buffer.from(policy.to_bytes()).toString('hex') +
                                    Buffer.from(policyAsset.name()).toString('hex');
                                const _policy = asset.slice(0, 56);
                                const _name = asset.slice(56);
                                const fingerprint = AssetFingerprint.fromParts(
                                    Buffer.from(_policy, 'hex'),
                                    Buffer.from(_name, 'hex'),
                                ).fingerprint();
                                assets.push({
                                    unit: asset,
                                    quantity: quantity.to_str(),
                                    policy: _policy,
                                    name: HexToAscii(_name),
                                    fingerprint,
                                });
                            }
                        }
                    }
                }
            }
        }

        return { lovelace: lovelace, assets: assets };
    }

    async registerPolicy(policy: Policy) {
        fetch(`https://pool.pm/register/policy/${policy.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'all',
                scripts: [
                    {
                        keyHash: policy.paymentKeyHash,
                        type: 'sig',
                    },
                    { slot: policy.ttl, type: 'before' },
                ],
            }),
        })
            .then((res) => res.json())
            .then(console.log);
    }

    async getUtxos(utxosHex: string[]): Promise<UTXO[]> {
        let Utxos = utxosHex.map((u) =>
            this.lib.TransactionUnspentOutput.from_bytes(Buffer.from(u, 'hex')),
        );
        let UTXOS = [];
        for (let utxo of Utxos) {
            let assets = this._utxoToAssets(utxo);

            UTXOS.push({
                txHash: Buffer.from(
                    utxo.input().transaction_id().to_bytes()
                ).toString('hex'),
                txId: utxo.input().index(),
                amount: assets,
            });
        }
        return UTXOS;
    }

    async getWalletUtxosHex(): Promise<TransactionUnspentOutput[]> {
        if (!this.wallet) return []
        return await this.wallet.getUtxos();
    }

    createTxBuilder(protocolParameters: ProtocolParameters): TransactionBuilder {
        const { BigNum, TransactionBuilder, TransactionBuilderConfigBuilder, LinearFee } = this.lib
        const { minFeeA, minFeeB, poolDeposit, keyDeposit,
            coinsPerUtxoWord, maxTxSize, maxValSize } = protocolParameters
        const toBigNum = (value: number) => BigNum.from_str(value.toString())
        const config = TransactionBuilderConfigBuilder.new()
            .fee_algo(LinearFee.new(toBigNum(minFeeA), toBigNum(minFeeB)))
            .pool_deposit(toBigNum(poolDeposit))
            .key_deposit(toBigNum(keyDeposit))
            .coins_per_utxo_word(toBigNum(coinsPerUtxoWord))
            .max_tx_size(maxTxSize)
            .max_value_size(maxValSize)
            .build()
        return TransactionBuilder.new(config)
    }

    async transaction({
        ProtocolParameters,
        PaymentAddress = '',
        recipients = [],
        metadata = null,
        metadataHash = null,
        addMetadata = true,
        utxosRaw = [],
        networkId = 0,
        ttl = 3600,
        multiSig = false,
        delegation = null
    }
        : {
            ProtocolParameters: ProtocolParameters,
            PaymentAddress: string,
            recipients: Recipient[],
            metadata: object | null,
            metadataHash: string | null,
            addMetadata: boolean,
            utxosRaw: TransactionUnspentOutput[] | undefined,
            networkId: number,
            ttl: number,
            multiSig: boolean,
            delegation: Delegation | null
        }) {
       
        if (!ProtocolParameters) return null
        this._protocolParameter = ProtocolParameters
        let utxos = utxosRaw.map((u) =>
            u
        );
        let mintedAssetsArray: MintedAsset[] = []
        let outputs = this.lib.TransactionOutputs.new()

        let minting = 0
        let outputValues: any = {}
        let costValues: any = {}
        for (let recipient of recipients) {
            let lovelace = Math.floor((Number(recipient.amount) || 0) * 1000000).toString()
            let ReceiveAddress = recipient.address
            let multiAsset = this._makeMultiAsset(recipient?.assets || [])
            let mintedAssets = this._makeMintedAsset(recipient?.mintedAssets || [])

            let outputValue = this.lib.Value.new(this.lib.BigNum.from_str(lovelace))
            let minAdaMint = this.lib.BigNum.from_str('0')

            if ((recipient?.assets || []).length > 0) {
                outputValue.set_multiasset(multiAsset)
                let minAda = this.lib.min_ada_required(
                    outputValue,
                    false,
                    this.lib.BigNum.from_str(this._protocolParameter.coinsPerUtxoWord.toString())
                );

                if (this.lib.BigNum.from_str(lovelace).compare(minAda) < 0)
                    outputValue.set_coin(minAda)
            }
            (recipient?.mintedAssets || []).map((asset) => {
                minting += 1
                mintedAssetsArray.push({
                    ...asset,
                    address: recipient.address
                })
            })

            if (parseInt(outputValue.coin().to_str()) > 0) {
                outputValues[recipient.address] = outputValue;
            }
            if ((recipient.mintedAssets || []).length > 0) {
                minAdaMint = this.lib.min_ada_required(
                    mintedAssets,
                    false,
                    this.lib.BigNum.from_str(this._protocolParameter.coinsPerUtxoWord.toString())
                )

                let requiredMintAda = this.lib.Value.new(this.lib.BigNum.from_str('0'));
                requiredMintAda.set_coin(minAdaMint);
                if (outputValue.coin().to_str() === '0') {
                    outputValue = requiredMintAda;
                } else {
                    outputValue = outputValue.checked_add(requiredMintAda);
                }
            }
            if (ReceiveAddress != PaymentAddress)
                costValues[ReceiveAddress] = outputValue;
            outputValues[ReceiveAddress] = outputValue;
            const multiasst = outputValue.multiasset()
            if (parseInt(outputValue.coin().to_str()) > 0) {
                if(multiasst){
                    outputs.add(
                        this.lib.TransactionOutputBuilder.new()
                        .with_address(this.lib.Address.from_bech32(ReceiveAddress))
                        .next()
                        .with_coin_and_asset(outputValue.coin(), multiasst)
                        .build() 
                    )
                } else {
                    outputs.add(
                        this.lib.TransactionOutputBuilder.new()
                        .with_address(this.lib.Address.from_bech32(ReceiveAddress))
                        .next()
                        .with_coin(outputValue.coin())
                        .build() 
                    )
                }
            } else if(multiasst) {
                outputs.add(
                    this.lib.TransactionOutputBuilder.new()
                    .with_address(this.lib.Address.from_bech32(ReceiveAddress))
                    .next()
                    .with_asset_and_min_required_coin(multiasst, this.lib.BigNum.from_str(ProtocolParameters.coinsPerUtxoWord.toString()))
                    .build() 
                )
            }
        }
        let RawTransaction = null
        if (minting > 0) {
            outputValues[PaymentAddress] = this.lib.Value.new(
                this.lib.BigNum.from_str('0')
            )

            RawTransaction = await this._txBuilderMinting({
                PaymentAddress: PaymentAddress,
                Utxos: utxos,
                Outputs: outputs,
                mintedAssetsArray: mintedAssetsArray,
                outputValues: outputValues,
                ProtocolParameter: this._protocolParameter,
                metadata: metadata,
                metadataHash: metadataHash,
                addMetadata: addMetadata,
                multiSig: multiSig,
                ttl: ttl,
                costValues: costValues
            })
        } else if (delegation != null) {

        } else {
            RawTransaction = await this._txBuilder({
                PaymentAddress: PaymentAddress,
                Utxos: utxos,
                Outputs: outputs,
                ProtocolParameter: this._protocolParameter,
                multiSig: multiSig,
                metadata: metadata,
                nativescript: null
            })
        }
        if (!RawTransaction) return null
        return RawTransaction
    }

    async createLockingPolicyScript(address: string, expirationTime: Date, protocolParameters: ProtocolParameters) {
        var now = new Date();
        if(!protocolParameters) return null
        this._protocolParameter = protocolParameters;

        const slot = this._protocolParameter.slot
        const duration = expirationTime.getTime() - now.getTime();

        const ttl = slot + duration;

        const paymentKeyHash = this.lib.BaseAddress.from_address(
            this.lib.Address.from_bytes(Buffer.from(address, 'hex'))
        )
            ?.payment_cred()
            ?.to_keyhash();
        if (!paymentKeyHash) return null

        const nativeScripts = this.lib.NativeScripts.new();
        const script = this.lib.ScriptPubkey.new(paymentKeyHash);
        const nativeScript = this.lib.NativeScript.new_script_pubkey(script);
        const lockScript = this.lib.NativeScript.new_timelock_expiry(
            this.lib.TimelockExpiry.new(ttl)
        );
        nativeScripts.add(nativeScript);
        nativeScripts.add(lockScript);
        const finalScript = this.lib.NativeScript.new_script_all(
            this.lib.ScriptAll.new(nativeScripts)
        );
        const policyId = Buffer.from(
            this.lib.ScriptHash.from_bytes(finalScript.hash(0).to_bytes()).to_bytes()
        ).toString('hex');
        return {
            id: policyId,
            script: Buffer.from(finalScript.to_bytes()).toString('hex'),
            paymentKeyHash: Buffer.from(paymentKeyHash.to_bytes()).toString(
                'hex',
            ),
            ttl
        };
    }

    async signTx(transaction: string | Transaction, partialSign: boolean = false) {
        if (!this.wallet) return null
        return await this.wallet.signTx(transaction, partialSign)
    }

    async signData(data: string) {
        let address = await this.getBaseAddress()
        if (!address || !this.wallet) return null
        let coseSign1Hex = await this.wallet.signData(
            address,
            Buffer.from(data, 'ascii').toString('hex')
        );
        return coseSign1Hex
    }

    hashMetadata(metadata: object) {
        let aux = this.lib.AuxiliaryData.new()

        const generalMetadata = this.lib.GeneralTransactionMetadata.new()
        Object.entries(metadata).map(([MetadataLabel, Metadata]) => {
            generalMetadata.insert(
                this.lib.BigNum.from_str(MetadataLabel),
                this.lib.encode_json_str_to_metadatum(JSON.stringify(Metadata), 0)
            );
        });
        aux.set_metadata(generalMetadata)

        const metadataHash = this.lib.hash_auxiliary_data(aux)
        return Buffer.from(metadataHash.to_bytes()).toString('hex')
    }

    _makeMintedAsset(mintedAssets: MintedAsset[]): Value {
        let AssetsMap: any = {}

        for (let asset of mintedAssets) {
            let assetName = asset.assetName;
            let quantity = asset.quantity;
            if (!Array.isArray(AssetsMap[asset.policyId])) {
                AssetsMap[asset.policyId] = []
            }
            AssetsMap[asset.policyId].push({
                unit: Buffer.from(assetName, 'ascii').toString('hex'),
                quantity: quantity,
            });
        }
        let multiAsset = this.lib.MultiAsset.new()

        for (const policy in AssetsMap) {
            const ScriptHash = this.lib.ScriptHash.from_bytes(
                Buffer.from(policy, 'hex')
            );
            const Assets = this.lib.Assets.new()

            const _assets = AssetsMap[policy]

            for (const asset of _assets) {
                const AssetName = this.lib.AssetName.new(Buffer.from(asset.unit, 'hex'))
                const BigNum = this.lib.BigNum.from_str(asset.quantity)
                Assets.insert(AssetName, BigNum)
            }
            multiAsset.insert(ScriptHash, Assets)
        }
        const value = this.lib.Value.new(this.lib.BigNum.from_str('0'))
        value.set_multiasset(multiAsset)
        return value
    }

    _makeMultiAsset(assets: Asset[]) {
        let AssetsMap: any = {}
        for (let asset of assets) {
            let [policy, assetName] = asset.unit.split('.')
            let quantity = asset.quantity
            if (!Array.isArray(AssetsMap[policy])) {
                AssetsMap[policy] = []
            }
            AssetsMap[policy].push({
                unit: Buffer.from(assetName, 'ascii').toString('hex'),
                quantity: quantity
            });
        }
        let multiAsset = this.lib.MultiAsset.new()

        for (const policy in AssetsMap) {
            const ScriptHash = this.lib.ScriptHash.from_bytes(
                Buffer.from(policy, 'hex')
            )
            const Assets = this.lib.Assets.new()

            const _assets = AssetsMap[policy]

            for (const asset of _assets) {
                const AssetName = this.lib.AssetName.new(Buffer.from(asset.unit, 'hex'))
                const BigNum = this.lib.BigNum.from_str(asset.quantity.toString())
                Assets.insert(AssetName, BigNum)
            }
            multiAsset.insert(ScriptHash, Assets)
        }
        return multiAsset
    }

    _utxoToAssets(utxo: TransactionUnspentOutput) {
        let value = utxo.output().amount()
        const assets = [];
        assets.push({
            unit: 'lovelace',
            quantity: value.coin().to_str(),
        });
        const multiasset = value?.multiasset()
        if (multiasset) {
            const multiAssets = multiasset.keys();
            for (let j = 0; j < multiAssets.len(); j++) {
                const policy = multiAssets.get(j);
                const policyAssets = multiasset.get(policy);
                if (policyAssets) {
                    const assetNames = policyAssets.keys();
                    for (let k = 0; k < assetNames.len(); k++) {
                        const policyAsset = assetNames.get(k);
                        const quantity = policyAssets.get(policyAsset);
                        const asset =
                            Buffer.from(policy.to_bytes()).toString('hex') +
                            '.' +
                            Buffer.from(policyAsset.name()).toString('ascii');
                        if (quantity) {
                            assets.push({
                                unit: asset,
                                quantity: quantity.to_str(),
                            });
                        }
                    }
                }
            }
        }
        return assets;
    }

   
    async _txBuilderMinting({
        PaymentAddress,
        Utxos,
        Outputs,
        ProtocolParameter,
        mintedAssetsArray = [],
        outputValues = {},
        metadata = null,
        metadataHash = null,
        addMetadata = true,
        ttl = 3600,
        multiSig = false,
        costValues = {}
    }: {
        PaymentAddress: string,
        Utxos: TransactionUnspentOutput[],
        Outputs: TransactionOutputs,
        ProtocolParameter: ProtocolParameters,
        mintedAssetsArray: MintedAsset[],
        outputValues: any,
        metadata: object | null,
        metadataHash: string | null,
        addMetadata: boolean,
        ttl: number,
        multiSig: boolean,
        costValues: any
    }): Promise<Transaction | null> {

        const nativeScripts = this.lib.NativeScripts.new();
        let mint = this.lib.Mint.new();
        const txbuilder = this.createTxBuilder(ProtocolParameter)

        mintedAssetsArray.forEach(a => {
            const policyScript = this.lib.NativeScript.from_bytes(
                Buffer.from(a.policyScript, 'hex'),
            );
            txbuilder.add_mint_asset(
                policyScript,
                AssetName.new(Buffer.from(a.assetName, 'ascii')),
                Int.new(BigNum.from_str(a.quantity.toString()))
            )
        })

        let aux = this.lib.AuxiliaryData.new();
        for (let i = 0; i < Outputs.len(); i++) {
            txbuilder.add_output(Outputs.get(i));
        }

        const utxos = this.lib.TransactionUnspentOutputs.new()
        for (let i = 0; i < Utxos.length; i++) {
            if (typeof Utxos[i] === 'string' || Utxos[i] instanceof String){
                utxos.add(
                    this.lib.TransactionUnspentOutput.from_bytes(
                        Buffer.from(Utxos[i].toString(), 'hex')
                    )
                )
            }
            else if(typeof Utxos[i] === 'object'){
                utxos.add(Utxos[i] as TransactionUnspentOutput)
            }
            
        }
        txbuilder.add_inputs_from(utxos, CoinSelectionStrategyCIP2.LargestFirstMultiAsset)
        txbuilder.add_change_if_needed(this.lib.Address.from_bech32(PaymentAddress));
        const txBody = txbuilder.build()


        if (metadata) {
            const generalMetadata = this.lib.GeneralTransactionMetadata.new();
            Object.entries(metadata).map(([MetadataLabel, Metadata]) => {
                generalMetadata.insert(
                    this.lib.BigNum.from_str(MetadataLabel),
                    this.lib.encode_json_str_to_metadatum(JSON.stringify(Metadata), 0),
                );
            });

            aux.set_metadata(generalMetadata);
        }
        if (metadataHash) {
            const auxDataHash = this.lib.AuxiliaryDataHash.from_bytes(
                Buffer.from(metadataHash, 'hex'),
            );
            console.log(auxDataHash);
            txBody.set_auxiliary_data_hash(auxDataHash);
        } else txBody.set_auxiliary_data_hash(this.lib.hash_auxiliary_data(aux));
        const witnesses = this.lib.TransactionWitnessSet.new();
        witnesses.set_native_scripts(nativeScripts);

        const dummyVkeyWitness =
            '8258208814c250f40bfc74d6c64f02fc75a54e68a9a8b3736e408d9820a6093d5e38b95840f04a036fa56b180af6537b2bba79cec75191dc47419e1fd8a4a892e7d84b7195348b3989c15f1e7b895c5ccee65a1931615b4bdb8bbbd01e6170db7a6831310c';

        const vkeys = this.lib.Vkeywitnesses.new();
        vkeys.add(
            this.lib.Vkeywitness.from_bytes(Buffer.from(dummyVkeyWitness, 'hex')),
        );

        if (multiSig) {
            vkeys.add(
                this.lib.Vkeywitness.from_bytes(Buffer.from(dummyVkeyWitness, 'hex')),
            );
        }
        witnesses.set_vkeys(vkeys);

        const txMultiassts = txBody.multiassets()
        const txAuxData = txBody.auxiliary_data_hash()
        if (!txMultiassts || !txAuxData) {
            return null
        }
        const transaction = this.lib.Transaction.new(
            txBody,
            witnesses,
            aux
        );

        const size = transaction.to_bytes().length * 2;
        if (size > ProtocolParameter.maxTxSize) throw ERROR.TX_TOO_BIG;

        return transaction;
    }


    async _txBuilder({
        PaymentAddress,
        Utxos,
        Outputs,
        ProtocolParameter,
        multiSig = false,
        metadata = null,
        nativescript = null,
    }: {
        PaymentAddress: string,
        Utxos: TransactionUnspentOutput[] | string [],
        Outputs: TransactionOutputs,
        ProtocolParameter: ProtocolParameters,
        multiSig: boolean,
        metadata: object | null,
        nativescript: NativeScript | null,
    }) : Promise <Transaction|null> {
        const txBuilder = this.createTxBuilder(ProtocolParameter)

        let AUXILIARY_DATA = this.lib.AuxiliaryData.new()
        if (metadata) {
            const generalMetadata = this.lib.GeneralTransactionMetadata.new()
            Object.entries(metadata).map(([MetadataLabel, Metadata]) => {
                generalMetadata.insert(
                    this.lib.BigNum.from_str(MetadataLabel),
                    this.lib.encode_json_str_to_metadatum(JSON.stringify(Metadata), 0)
                )
            })

            AUXILIARY_DATA.set_metadata(generalMetadata)
        }
        txBuilder.set_auxiliary_data(AUXILIARY_DATA)

        console.log('Outputs')
        console.log(Outputs.len())
        for (let i = 0; i < Outputs.len(); i++) {
            console.log('Output')
            console.log(Outputs.get(i))
            txBuilder.add_output(Outputs.get(i))
        }

        const utxos = this.lib.TransactionUnspentOutputs.new()
        for (let i = 0; i < Utxos.length; i++) {
            if (typeof Utxos[i] === 'string' || Utxos[i] instanceof String){
                utxos.add(
                    this.lib.TransactionUnspentOutput.from_bytes(
                        Buffer.from(Utxos[i].toString(), 'hex')
                    )
                )
            }
            else if(typeof Utxos[i] === 'object'){
                utxos.add(Utxos[i] as TransactionUnspentOutput)
            }
            
        }
        // totalWitnesses.set_vkeys(totalVkeys);
        txBuilder.add_inputs_from(utxos, CoinSelectionStrategyCIP2.RandomImproveMultiAsset)
        txBuilder.add_change_if_needed(this.lib.Address.from_bech32(PaymentAddress))

        const transaction = this.lib.Transaction.new(
            txBuilder.build(),
            this.lib.TransactionWitnessSet.new(),
            AUXILIARY_DATA
        );
        console.log(
            Buffer.from(transaction.to_bytes()).toString('hex')
        )
        const size = transaction.to_bytes().length * 2;
        if (size > ProtocolParameter.maxTxSize) throw ERROR.TX_TOO_BIG;

        return transaction;
    }

    async submitTx({
        transactionRaw,
        witnesses,
        metadata
    }
        : {
            transactionRaw: string,
            witnesses: string[],
            metadata?: object
            // scripts: any,
        }) {
        let transaction = this.lib.Transaction.from_bytes(
            Buffer.from(transactionRaw, 'hex'),
        );

        const txWitnesses = transaction.witness_set();
        const txVkeys = txWitnesses.vkeys();
        const txScripts = txWitnesses.native_scripts();
        const totalVkeys = this.lib.Vkeywitnesses.new();
        const totalScripts = this.lib.NativeScripts.new();
        for (var witness in witnesses) {
            const addWitnesses = this.lib.TransactionWitnessSet.from_bytes(
                Buffer.from(witness, 'hex'),
            );
            const addVkeys = addWitnesses.vkeys();
            const addScripts = addWitnesses.native_scripts();
            if (addVkeys) {
                for (let i = 0; i < addVkeys.len(); i++) {
                    totalVkeys.add(addVkeys.get(i));
                }
            }
            if (addScripts) {
                for (let i = 0; i < addScripts.len(); i++) {
                    totalScripts.add(addScripts.get(i));
                }
            }
        }

        if (txVkeys) {
            for (let i = 0; i < txVkeys.len(); i++) {
                totalVkeys.add(txVkeys.get(i));
            }
        }

        if (txScripts) {
            for (let i = 0; i < txScripts.len(); i++) {
                totalScripts.add(txScripts.get(i));
            }
        }

        const totalWitnesses = this.lib.TransactionWitnessSet.new();
        totalWitnesses.set_vkeys(totalVkeys);
        totalWitnesses.set_native_scripts(totalScripts);

        let aux;
        if (metadata) {
            aux = this.lib.AuxiliaryData.new();
            const generalMetadata = this.lib.GeneralTransactionMetadata.new();
            Object.entries(metadata).map(([MetadataLabel, Metadata]) => {
                generalMetadata.insert(
                    this.lib.BigNum.from_str(MetadataLabel),
                    this.lib.encode_json_str_to_metadatum(JSON.stringify(Metadata), 0),
                );
            });

            aux.set_metadata(generalMetadata);
        } else {
            aux = transaction.auxiliary_data();
        }
        const signedTx = this.lib.Transaction.new(
            transaction.body(),
            totalWitnesses,
            aux
        );
        return await this.wallet?.submitTx(signedTx);
    }

}

function AsciiToBuffer(string: string) {
    return Buffer.from(string, 'ascii');
}

function HexToBuffer(string: string) {
    return Buffer.from(string, 'hex');
}

function AsciiToHex(string: string) {
    return AsciiToBuffer(string).toString('hex');
}

function HexToAscii(string: string) {
    return HexToBuffer(string).toString('ascii');
}

function BufferToAscii(buffer: Buffer) {
    return buffer.toString('ascii');
}

function BufferToHex(buffer: Buffer) {
    return buffer.toString('hex');
}

export default CardanoWallet;
