import { useEffect, useState } from 'react'
import { Factory } from './factory'
import { CardanoWallet } from './index'

const CardanoSerializationLib = new Factory()

const useCardanoWallet = () : CardanoWallet | undefined => {
    const [cardanoWallet, setCardano] = useState<CardanoWallet | undefined>(undefined)

    useEffect(() => {
        let isMounted = true

        CardanoSerializationLib.load().then((instance: CardanoWallet | undefined) => {
            isMounted && setCardano(instance)
        })

        return () => {
            isMounted = false
        }
    }, [])

    return cardanoWallet
}
export default useCardanoWallet
