import { NDKNip07Signer } from '@nostr-dev-kit/ndk'
import { ndk } from '$lib/stores/ndk'
import { addAccount } from '$lib/stores/session'

export async function fetchActiveUserData() {
	if (!ndk.signer) return
	const user = await ndk.signer.user()
	await user.fetchProfile()
	console.log('Fetched user', user)
}

export async function loginWithExtension(): Promise<boolean> {
	try {
		const signer = new NDKNip07Signer()
		console.log('Waiting for NIP-07 signer')
		await signer.blockUntilReady()
		const user = await signer.user()
		ndk.signer = signer
		await fetchActiveUserData()
		await addAccount({
			hexPubKey: user.pubkey,
			lastLogged: +new Date(),
			relays: user.relayUrls,
			type: 'NIP07',
		})
		localStorage.setItem('last_account', user.pubkey)
		localStorage.setItem('auto_login', 'true')
		return true
	} catch (error) {
		console.error(error)
		return false
	}
}
