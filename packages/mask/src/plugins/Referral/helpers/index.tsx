import { padStart } from 'lodash-unified'
import { BigNumber } from 'bignumber.js'
import { bytesToHex } from 'web3-utils'
import { createTypedMessageMetadataReader } from '@masknet/typed-message/dom'
import { formatUnits } from '@ethersproject/units'
import { isValidAddress } from '@masknet/web3-shared-evm'

import { META_KEY, supportedChainId } from '../constants.js'
import type {
    ReferralMetaData,
    ChainAddress,
    ChainAddressProps,
    EvmAddress,
    Bytes32,
    Bytes24,
    ChainId,
    BigNumberish,
} from '../types.js'
import schema from '../schema.json'
import { toBigInt, writeUInt32BE, hexToArrayBuffer } from './buffer.js'

function toChainAddress(chainId: BigNumber | bigint, address: Uint8Array): Uint8Array {
    if (isValidAddress(`0x${bytesToHex([...address])}`)) throw new Error('invalid address')
    const b = new Uint8Array(24)

    // Only numeric network id's are supported in the chain address, with max of uint32.
    // TODO throw on this if wrong
    writeUInt32BE(b, Number(toBigInt(chainId)), 0)

    b.set(address, 4)

    return b
}

export function toChainAddressEthers(chainId: number, address: string): string {
    return bytesToHex([...toChainAddress(new BigNumber(chainId), hexToArrayBuffer(address.slice(2)))])
}

export function parseChainAddress(chainAddress: ChainAddress): ChainAddressProps {
    const chainId = toChainId(chainAddress)
    const address = toEvmAddress(chainAddress)
    const isNative = chainId === Number.parseInt(address.slice(Math.max(0, 2 + 16 * 2)), 16)
    return {
        chainId,
        address,
        isNative,
    }
}

export function toNativeRewardTokenDefn(chainId: ChainId): string {
    const nativeTokenAddr = '0x' + padStart(Number(chainId).toString(16), 40, '0')
    return toChainAddressEthers(chainId, nativeTokenAddr)
}

export function expandEvmAddressToBytes32(addr: EvmAddress): Bytes32 {
    return `0x000000000000000000000000${addr.slice(2)}`.toLowerCase()
}
export function expandBytes24ToBytes32(b24: Bytes24): Bytes32 {
    return `0x${b24.slice(2)}0000000000000000`.toLowerCase()
}
export function toEvmAddress(addr: ChainAddress): EvmAddress {
    return `0x${addr.slice(Math.max(0, 2 + 4 * 2))}`
}
export function toChainId(addr: ChainAddress): number {
    return Number.parseInt(addr.slice(2, 2 + 4 * 2), 16)
}

export function roundValue(value: string | number, tokenDecimals?: number) {
    const valueStr = tokenDecimals === 0 ? Math.ceil(Number(value)).toString() : Number(value).toFixed(5)
    return Number.parseFloat(valueStr)
}

export function getRequiredChainId(currentChainId: ChainId) {
    return supportedChainId === currentChainId ? currentChainId : supportedChainId
}

export const referralMetadataReader = createTypedMessageMetadataReader<ReferralMetaData>(META_KEY, schema)

export function valueToNumber(value: BigNumberish) {
    return Number.parseInt(formatUnits(value, 0), 10)
}
