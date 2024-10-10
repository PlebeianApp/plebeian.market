import type { ComponentType, SvelteComponent } from 'svelte'

export type ComponentProps = Record<string, unknown>

export interface Step {
	component: ComponentType<SvelteComponent>
	props: Record<string, unknown>
}

export const FormLabels: { [key: string]: string } = {
	address: 'Address',
	zip: 'Zip',
	city: 'City',
	country: 'Country',
	contactName: 'Name',
	region: 'Region',
	contactPhone: 'Phone',
	contactEmail: 'Email',
	observations: 'Observations',
}

export type CheckoutPaymentEvent = {
	paymentRequest: string | null
	proof: string | null
	amountSats: number
	paymentType: string
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled'
