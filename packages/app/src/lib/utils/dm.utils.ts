import type { CheckoutFormData, OrderFilter } from '$lib/schema'
import type { DisplayOrder } from '$lib/server/orders.service'
import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import type { CartStall } from '$lib/stores/cart'
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import { createQuery } from '@tanstack/svelte-query'
import { dmKind04Sub } from '$lib/nostrSubs/subs'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type {
	InvoiceMessage,
	OrderMessage,
	OrderStatus,
	OrderStatusUpdateMessage,
	PaymentRequestMessage,
} from '@plebeian/database/constants'
import { ORDER_STATUS } from '@plebeian/database/constants'
import { createSlugId } from '@plebeian/database/utils'

import { publishEvent } from './nostr.utils'

export async function sendDM<T extends object>(content: T | string, recipientPubkey: string): Promise<boolean> {
	const ndk = get(ndkStore)
	const recipient = ndk.getUser({ pubkey: recipientPubkey })
	const dm = new NDKEvent(ndk)
	const dmContent = content instanceof Object ? JSON.stringify(content) : content
	dm.kind = 4
	dm.content = (await ndk.signer?.encrypt(recipient, dmContent)) ?? ''
	dm.tags = [['p', recipient.pubkey]]

	try {
		await publishEvent(dm)

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
		id: createSlugId(`order`),
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

export function createPaymentRequestMessage(
	invoice: InvoiceMessage,
	order: OrderFilter,
	selectedPaymentDetail: RichPaymentDetail,
): PaymentRequestMessage {
	return {
		id: order.id,
		payment_id: invoice.paymentId,
		type: 1,
		message: `Payment request for order ${order.id}, payment detail id: ${invoice.paymentId}`,
		payment_options: [
			{
				type: selectedPaymentDetail!.paymentMethod,
				link: invoice.paymentRequest,
				paymentRequest: invoice.paymentRequest,
			},
		],
	}
}

export function createOrderStatusUpdateMessage(order: DisplayOrder): OrderStatusUpdateMessage {
	const statusMessages: Record<OrderStatus, string> = {
		confirmed: 'Order confirmed',
		pending: 'Order is pending',
		shipped: 'Order shipped',
		completed: 'Order completed',
		cancelled: 'Order cancelled',
	}

	const message = statusMessages[order.status] ?? ''

	return {
		id: order.id,
		type: 2,
		message,
		status: order.status,
		paid: order.status === 'confirmed' || order.status === 'shipped' || order.status === 'completed',
		shipped: order.status === 'shipped',
	}
}

export function setupDMSubscription() {
	const $ndkStore = get(ndkStore)
	if (!$ndkStore.activeUser) return

	dmKind04Sub?.changeFilters([
		{ kinds: [NDKKind.EncryptedDirectMessage], limit: 50, '#p': [$ndkStore.activeUser.pubkey] },
		{ kinds: [NDKKind.EncryptedDirectMessage], limit: 50, authors: [$ndkStore.activeUser.pubkey] },
	])
	dmKind04Sub?.ref()
}
