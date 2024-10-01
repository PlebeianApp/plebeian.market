import { HDKey } from '@scure/bip32'
import { address as baddress, networks, payments } from 'bitcoinjs-lib'
import * as bs58check from 'bs58check'

const XPUB_PREFIX = new Uint8Array([0x04, 0x88, 0xb2, 0x1e])
export function checkExtendedPublicKey(input: string): boolean {
	try {
		bs58check.default.decode(input)
		return true
	} catch (e) {
		return false
	}
}

export function checkAddress(address: string): boolean {
	try {
		const data = baddress.fromBech32(address)
		return !!data
	} catch (e) {
		e instanceof Error && console.log(e.message)
		return false
	}
}

export function zpubToXpub(zpub: string): string | undefined {
	const data: Uint8Array = bs58check.default.decode(zpub)
	if (!data) return
	const xpubData = new Uint8Array(XPUB_PREFIX.length + data.slice(4).length)
	xpubData.set(XPUB_PREFIX)
	xpubData.set(data.slice(4), XPUB_PREFIX.length)
	return bs58check.default.encode(xpubData)
}

export function deriveAddresses(extendedKey: string, numAddressesToGenerate: number = 10, fromIndex: number = 0): string[] | null {
	if (extendedKey.startsWith('zpub')) {
		const xpub = zpubToXpub(extendedKey)
		if (!xpub) return null
		extendedKey = xpub
	} else if (extendedKey.startsWith('xpub') && !checkExtendedPublicKey(extendedKey)) {
		return null
	} else if (!extendedKey.startsWith('xpub') && !extendedKey.startsWith('zpub')) {
		return null
	}
	const hdkey = HDKey.fromExtendedKey(extendedKey)
	const addresses: string[] = []
	for (let i = fromIndex; i <= numAddressesToGenerate; i++) {
		const child = hdkey.derive(`m/0/${i}`)
		const publicKey = child.publicKey!
		const address = payments.p2wpkh({ pubkey: publicKey, network: networks.bitcoin }).address!
		addresses.push(address)
	}
	return addresses
}
