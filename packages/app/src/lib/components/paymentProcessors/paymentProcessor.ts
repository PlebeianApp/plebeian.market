// paymentProcessors.ts
import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import type { ComponentType, SvelteComponent } from 'svelte'

import type { PaymentDetailsMethod } from '@plebeian/database'

export interface PaymentProcessorProps {
	paymentDetail: RichPaymentDetail
	amountSats: number
	paymentType: 'merchant' | string
}

export interface PaymentProcessor {
	component: ComponentType<SvelteComponent> | null
	props: Record<string, PaymentProcessorProps>
}

export type PaymentProcessorMap = Record<PaymentDetailsMethod, PaymentProcessor>
