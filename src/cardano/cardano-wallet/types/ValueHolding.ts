import { AssetHolding } from './index';

export default interface ValueHolding {
    lovelace: string;
    assets: AssetHolding[];
};
