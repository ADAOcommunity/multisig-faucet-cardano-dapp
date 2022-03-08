import { TransactionUnspentOutput, BaseAddress, RewardAddress, Transaction, Value } from '@emurgo/cardano-serialization-lib-browser';

interface AppVersion { major: number; minor: number; patch: number; };
interface Experimental { appVersion: () => AppVersion | undefined; getCollateral: () =>  Promise<TransactionUnspentOutput>; };
interface Paginate { page: number; limit: number; };

export default interface WalletApi {
    experimental: Experimental;
    getBalance: () => Promise<Value>;
    getChangeAddress: () => Promise<BaseAddress>;
    getCollateral?: () => Promise<TransactionUnspentOutput>;
    getNetworkId: () => Promise<number>;
    getRewardAddresses: () => Promise<RewardAddress>;
    getUnusedAddresses: () => Promise<Array<BaseAddress>>
    getUsedAddresses: (paginate?: Paginate) => Promise<Array<BaseAddress>>
    getUtxos: (amount?: number, paginate?: Paginate | undefined) => Promise<Array<TransactionUnspentOutput>>;
    signData: (address : BaseAddress | RewardAddress, payload : string) => Promise<any>
    signTx: (tx: Transaction | string, partialSign: boolean, createDebugTx?: boolean) => Promise<string>
    submitTx: (tx: Transaction | string) => Promise<string>;
};
