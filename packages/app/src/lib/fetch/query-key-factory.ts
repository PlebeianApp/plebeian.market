import type { CatsFilter, InvoicesFilter, OrdersFilter, ProductsFilter, StallsFilter, UsersFilter } from '$lib/schema'

import type { AppSettingsMetaName } from '@plebeian/database'

//   export const productKeys = {
// 	all: ['products'] as const,
// 	lists: () => [...productKeys.all, 'list'] as const,
// 	detail: (id: string) => [...productKeys.all, id] as const,
// 	filtered: (filter: Partial<ProductsFilter>) => [...productKeys.lists(), ...Object.values(filter)] as const,
// 	exists: (id: string) => [...productKeys.all, 'exists', id] as const,
// 	images: {
// 	  all: ['product-images'] as const,
// 	  byUser: (pubkey: string) => [...productKeys.images.all, pubkey] as const,
// 	}
//   } as const

export const productKeys = {
	all: ['products'] as const,
	lists: () => [...productKeys.all] as const,
	filtered: (filter: Partial<ProductsFilter>) => [...productKeys.lists(), ...Object.values(filter)] as const,
	detail: (id: string) => [...productKeys.all, id] as const,
	exists: (id: string) => [...productKeys.all, 'exists', id] as const,
	currency: {
		all: ['currency-conversion'] as const,
		base: (currency: string) => [...productKeys.currency.all, currency] as const,
		amount: (currency: string, amount: number) => [...productKeys.currency.base(currency), amount] as const,
	},
	images: {
		all: ['product-images'] as const,
		lists: () => [...productKeys.images.all] as const,
		byUser: (userId: string) => [...productKeys.images.lists(), { userId }] as const,
	},
} as const

//   export const currencyKeys = {
// 	all: ['currency-conversion'] as const,
// 	byCurrency: (currency: string) => [...currencyKeys.all, currency] as const,
// 	byAmount: (currency: string, amount: number) => [...currencyKeys.byCurrency(currency), amount] as const,
//   } as const

//   export const userKeys = {
// 	all: ['user'] as const,
// 	lists: () => ['users'] as const,
// 	detail: (pubkey: string) => [...userKeys.all, pubkey] as const,
// 	filtered: (filter: Partial<UsersFilter>) => [...userKeys.lists(), ...Object.values(filter)] as const,
// 	exists: (pubkey: string) => ['exists', ...userKeys.detail(pubkey)] as const,
// 	role: (pubkey: string) => ['role', ...userKeys.detail(pubkey)] as const,
// 	relays: (pubkey: string) => ['relays', ...userKeys.detail(pubkey)] as const,
// 	wallet: {
// 	  all: ['wallet-details'] as const,
// 	  details: (pubkey: string) => [...userKeys.wallet.all, pubkey] as const,
// 	  balance: (pubkey: string, id: string) => ['wallet-balance', pubkey, id] as const,
// 	  onChain: (userId: string, paymentDetailId: string) => [...userKeys.wallet.all, 'on-chain', userId, paymentDetailId] as const,
// 	}
//   } as const

export const walletKeys = {
	all: ['wallet-details'] as const,
	details: (pubkey: string) => [...walletKeys.all, pubkey] as const,
	balance: (pubkey: string, id: string) => ['wallet-balance', pubkey, id] as const,
	onChain: (userId: string, paymentDetailId: string) => [...walletKeys.all, 'on-chain', userId, paymentDetailId] as const,
} as const

export const userKeys = {
	all: ['users'] as const,
	lists: () => [...userKeys.all] as const,
	filtered: (filter: Partial<UsersFilter>) => [...userKeys.lists(), ...Object.values(filter)] as const,
	detail: (pubkey: string) => ['user', pubkey] as const,
	exists: (pubkey: string) => ['exists', ...userKeys.detail(pubkey)] as const,
	role: (pubkey: string) => ['role', ...userKeys.detail(pubkey)] as const,
	relays: (pubkey: string) => ['relays', ...userKeys.detail(pubkey)] as const,
} as const

export const orderKeys = {
	all: ['orders'] as const,
	detail: (orderId: string) => [...orderKeys.all, orderId] as const,
	filtered: (filter: Partial<OrdersFilter>) => [...orderKeys.all, ...Object.values(filter)] as const,
	byUserAndRole: (userId: string, role: 'buyer' | 'seller') => [...orderKeys.all, userId, role] as const,
} as const

export const stallKeys = {
	all: ['stalls'] as const,
	lists: () => [...stallKeys.all] as const,
	filtered: (filter: Partial<StallsFilter>) => [...stallKeys.lists(), ...Object.values(filter)] as const,
	detail: (stallId: string) => [...stallKeys.all, stallId] as const,
	exists: (id: string) => [...stallKeys.all, 'exists', id] as const,
	event: (stallId: string) => [...stallKeys.all, 'event', stallId] as const,
} as const

export const shippingKeys = {
	all: ['shipping'] as const,
	lists: () => [...shippingKeys.all] as const,
	byStall: (stallId: string) => [...shippingKeys.lists(), { stallId }] as const,
	byMethod: (methodId: string) => [...shippingKeys.lists(), { methodId }] as const,
} as const

export const paymentKeys = {
	all: ['payment-details'] as const,
	private: (pubkey: string) => ['payment-details-private', pubkey] as const,
	byUser: (id: string) => [...paymentKeys.all, 'user', id] as const,
	byStall: (id: string) => [...paymentKeys.all, 'stall', id] as const,
	v4v: (userId: string) => ['v4v', userId] as const,
	mempool: {
		transactions: (address: string) => ['mempool-address-transactions', address] as const,
	},
} as const

export const invoiceKeys = {
	all: ['invoices'] as const,
	detail: (id: string) => [...invoiceKeys.all, id] as const,
	filtered: (filter: Partial<InvoicesFilter>) => [...invoiceKeys.all, ...Object.values(filter)] as const,
} as const

export const categoryKeys = {
	all: ['categories'] as const,
	filtered: (filter: Partial<CatsFilter>) => [...categoryKeys.all, ...Object.values(filter)] as const,
} as const

export const settingsKeys = {
	meta: (key: AppSettingsMetaName['value']) => ['settings-meta', key] as const,
} as const
