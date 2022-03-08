import { Asset, MintedAsset } from './index';

export default interface Recipient {
    address: string;
    amount: string;
    assets?: Asset[];
    mintedAssets?: MintedAsset[];
};
