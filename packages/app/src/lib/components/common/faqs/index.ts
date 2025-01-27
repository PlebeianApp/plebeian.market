import type { ComponentType, SvelteComponent } from 'svelte'

import AccountPasswords from './accountPasswords.svelte'
import CustomerSupport from './customerSupport.svelte'

export interface FaqItem {
	question: string
	answer?: string
	component?: ComponentType<SvelteComponent>
}

export const faqItems: FaqItem[] = [
	{
		question: 'Account & Passwords',
		component: AccountPasswords,
	},
	{
		question: 'Supported Payment Methods',
		answer: 'We support Bitcoin on-chain and lightning transactions at the moment but will be supporting Cashu in due course.',
	},
	{
		question: 'Merchant Payments',
		answer: 'Some merchants can be paid directly, depending on whether the merchant has provided their payment details.',
	},
	{
		question: 'Wallet Support',
		answer:
			'The wallets tested for compatibility include Coinos, Wallet of Satoshi, Minibits, and Alby, and Primal. Ongoing testing is performed to ensure compatibility with various wallets',
	},
	{
		question: 'Shipping',
		answer:
			'Shipping costs and geographic support are set by the individual sellers so make sure to check their profile to see if they ship to your location.',
	},
	{
		question: 'Order Tracking',
		answer:
			'Currently any order tracking will be provided by the individual seller, you can message them directly on their profile for support',
	},
	{
		question: 'Returns and refunds',
		answer: 'Returns and refunds can be negotiated with the individual sellers, you can message them via their profile page.',
	},
	{
		question: 'Customer Support',
		component: CustomerSupport,
	},
] as const
