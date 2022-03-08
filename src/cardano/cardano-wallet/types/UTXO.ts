export default interface UTXO {
    txHash: string;
    txId: number;
    amount: {
        unit: string;
        quantity: any;
    }[];
};
