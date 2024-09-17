import type { CheckoutFormData } from '$lib/schema'
import type { CartStall } from '$lib/stores/cart'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { OrderMessage, OrderStatus } from '@plebeian/database/constants'
import { ORDER_STATUS } from '@plebeian/database/constants'
import { createId } from '@plebeian/database/utils'

export async function sendDM<T extends object>(content: T, recipientPubkey: string): Promise<boolean> {
	const store = get(ndkStore)
	const recipient = store.getUser({ pubkey: recipientPubkey })
	const dm = new NDKEvent(store)
	dm.kind = 4
	dm.content = (await store.signer?.encrypt(recipient, JSON.stringify(content))) ?? ''
	dm.tags = [['p', recipient.pubkey]]

	try {
		await dm.publish()
		return true
	} catch (error) {
		return false
	}
}

export function createDecryptedMessage(message: NDKEvent, selectedPubkey: string) {
	return createQuery({
		queryKey: ['decryptedMessage', message.id, selectedPubkey],
		queryFn: async () => {
			const ndk = get(ndkStore)
			const recipient = ndk.getUser({ pubkey: message.pubkey === selectedPubkey ? message.pubkey : selectedPubkey })

			try {
				const decryptedContent = await ndk.signer?.decrypt(recipient, message.content)
				return decryptedContent || 'Decryption failed'
			} catch (error) {
				console.error(`Failed to decrypt message ${message.id}:`, error)
				return 'Decryption failed'
			}
		},
		staleTime: 1000 * 60 * 10,
		enabled: !!message && !!get(ndkStore).signer,
	})
}

export function createOrderMessage(
	checkoutForm: CheckoutFormData,
	stall: CartStall,
	cart: { products: Record<string, { amount: number }> },
	buyerUserId: string,
	sellerUserId: string,
): OrderMessage {
	return {
		...checkoutForm,
		id: createId(),
		status: ORDER_STATUS.PENDING,
		type: 0,
		buyerUserId,
		sellerUserId,
		stallId: stall.id,
		shippingId: String(stall.shippingMethodId),
		items: stall.products.map((p) => ({
			product_id: p,
			quantity: cart.products[p]?.amount ?? 0,
		})),
	}
}
