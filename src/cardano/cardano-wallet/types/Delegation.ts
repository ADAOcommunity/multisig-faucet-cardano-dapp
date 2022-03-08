export default interface Delegation {
    stakeKeyHash: Uint8Array
    poolHex: string
    delegation: {
        active: boolean
        rewards: string
        stakepoolId: string
    }
}