// message-parser.ts

import type { InvoiceMessage, OrderMessage, OrderStatusUpdateMessage, PaymentRequestMessage } from '@plebeian/database/constants'

export type MessageObject = OrderMessage | InvoiceMessage | PaymentRequestMessage | OrderStatusUpdateMessage

export type ParsedMessage = { type: 'text'; data: string } | { type: 'object'; data: MessageObject }

export function isJsonString(str: string): boolean {
	try {
		return str.trim().startsWith('{') && JSON.parse(str) !== null
	} catch {
		return false
	}
}

export function parseMessage(content: string): ParsedMessage {
	if (!isJsonString(content)) {
		return { type: 'text', data: content }
	}

	try {
		const parsed = JSON.parse(content) as MessageObject
		return { type: 'object', data: parsed }
	} catch {
		return { type: 'text', data: content }
	}
}
