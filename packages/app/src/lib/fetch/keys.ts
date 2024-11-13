import type { CatsFilter, InvoicesFilter, OrdersFilter, ProductsFilter, StallsFilter, UsersFilter } from '$lib/schema'

import type { AppSettingsMetaName } from '@plebeian/database'

type QueryKey = ReadonlyArray<unknown>

export const createProductKey = (id: string): QueryKey => ['products', id]

export const createProductByFilterKey = (filter: Partial<ProductsFilter>) => ['products', 'filter', ...Object.values(filter)]

export const createProductExistsKey = (id: string) => ['products', 'exists', id]

export const createCurrencyConversionKey = (currency: string): QueryKey => ['currency-conversion', currency]

export const createCurrencyAmountConversionKey = (currency: string, amount: number): QueryKey => [
	...createCurrencyConversionKey(currency),
	amount,
]

export const createUserKey = (pubkey: string) => ['user', pubkey]

export const createUserRoleKey = (pubkey: string) => ['role', ...createUserKey(pubkey)]

export const createUserRelaysKey = (pubkey: string) => ['relays', ...createUserKey(pubkey)]

export const createUserExistsKey = (pubkey: string) => ['exists', ...createUserKey(pubkey)]

export const createUsersByFilterKey = (filter: Partial<UsersFilter>) => ['users', 'filter', ...Object.values(filter)]

export const createOrderKey = (orderId: string) => ['orders', orderId]

export const createOrdersByUserAndRoleKey = (userId: string, role: 'buyer' | 'seller') => ['orders', 'list', userId, role]

export const createOrdersByFilterKey = (filter: Partial<OrdersFilter>) => ['orders', 'list', 'filter', ...Object.values(filter)]

export const createStallKey = (stallId: string) => ['stalls', stallId]

export const createStallsByFilterKey = (filter: Partial<StallsFilter>) => ['stalls', 'filter', ...Object.values(filter)]

export const createStallExistsKey = (id: string) => ['stalls', 'exists', id]

export const createShippingKey = (stallId: string) => ['shipping', stallId]

export const createShippingMethodKey = (methodId: string) => ['shipping-method', methodId]

export const createV4VForUserKey = (userId: string) => ['v4v', userId]

export const createUserWalletDetailsKey = (pubkey: string) => ['wallet-details', pubkey]

export const createWalletBalanceKey = (pubkey: string, id: string) => ['wallet-balance', pubkey, id]

export const createOnChainWalletDetailsKey = (userId: string, paymentDetailId: string) => [
	'wallet-details',
	'on-chain',
	userId,
	paymentDetailId,
]

export const createPrivatePaymentsKey = (pubkey: string) => ['payment-details-private', pubkey]

export const createPaymentsForUserKey = (id: string) => ['payment-details', 'user', id]

export const createPaymentsForStall = (id: string) => ['payment-details', 'stall', id]

export const createMempoolAddressTransactionsKey = (address: string) => ['mempool-address-transactions', address]

export const createInvoiceKey = (id: string) => ['invoices', id]

export const createInvoicesByFilterKey = (filter: Partial<InvoicesFilter>) => ['invoices', 'filter', ...Object.values(filter)]

export const createProductImagesForUserKey = (pubkey: string) => ['product-images', pubkey]

export const createCategoriesByFilterKey = (filter: Partial<CatsFilter>) => ['categories', 'filter', ...Object.values(filter)]

export const createSettingsMetaKey = (key: AppSettingsMetaName['value']) => ['settings-meta', key]
