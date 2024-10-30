import type { CheckoutFormData, OrderFilter } from '$lib/schema'
import type { DisplayOrder } from '$lib/server/orders.service'
import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import type { CartStall } from '$lib/stores/cart'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { InvoiceMessage, OrderMessage, OrderStatusUpdateMessage, PaymentRequestMessage } from '@plebeian/database/constants'
import { ORDER_STATUS } from '@plebeian/database/constants'
import { createSlugId } from '@plebeian/database/utils'

export async function sendDM<T extends object>(content: T, recipientPubkey: string): Promise<boolean> {
	const ndk = get(ndkStore)
	const recipient = ndk.getUser({ pubkey: recipientPubkey })
	const dm = new NDKEvent(ndk)
	dm.kind = 4
	dm.content = (await ndk.signer?.encrypt(recipient, JSON.stringify(content))) ?? ''
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
	const message =
		order.status === 'pending'
			? 'Order is pending'
			: order.status === 'shipped'
				? 'Order shipped'
				: order.status === 'completed'
					? 'Order completed'
					: 'Order cancelled'
	return {
		id: order.id,
		type: 2,
		message: message ?? '',
		status: order.status,
		paid: order.status === 'confirmed' ? true : false,
		shipped: order.status === 'shipped' ? true : false,
	}
}
