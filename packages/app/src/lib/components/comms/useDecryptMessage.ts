import type { NDKEvent } from '@nostr-dev-kit/ndk'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

export function useDecryptedMessage(message: NDKEvent, selectedPubkey: string) {
	return createQuery({
		queryKey: ['decryptedMessage', message.id, selectedPubkey],
		queryFn: async () => {
			const ndk = get(ndkStore)
			const recipient = ndk.getUser({ pubkey: selectedPubkey })

			try {
				const decryptedContent = await ndk.signer?.decrypt(recipient, message.content)
				return decryptedContent || 'Decryption failed'
			} catch (error) {
				console.error(`Failed to decrypt message ${message.id}:`, error)
				return 'Decryption failed'
			}
		},
		staleTime: 1000 * 60 * 5, // 10 minutes
		enabled: !!message && !!get(ndkStore).signer,
	})
}
