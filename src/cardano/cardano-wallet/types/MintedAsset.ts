export default interface MintedAsset {
    assetName: string;
    quantity: string;
    policyId: string;
    policyScript: string;
    address?: string;
};
