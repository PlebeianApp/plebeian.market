import type { NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { get } from 'svelte/store'

export type LoginResult = Promise<boolean>

export const unNullify = <T extends object>(obj: T): T => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)) as T

export const getAppSettings = async (): Promise<boolean> =>
	new Promise((resolve) => {
		const check = () => {
			const { allowRegister } = get(page).data.appSettings
			allowRegister !== undefined ? resolve(allowRegister) : setTimeout(check, 250)
		}
		check()
	})

export const setupNDKSigner = async (signer: NDKNip07Signer | NDKPrivateKeySigner | NDKNip46Signer) => {
	await signer.blockUntilReady()
	ndk.signer = signer
	ndkStore.set(ndk)
}
