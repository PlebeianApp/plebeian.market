import type { V4VDTO } from '$lib/fetch/v4v.queries'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichShippingInfo } from '$lib/server/shipping.service'
import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
import { debounce, resolveQuery } from '$lib/utils'
import { toast } from 'svelte-sonner'
import { derived, get, writable } from 'svelte/store'

import type { InvoiceStatus, OrderMessage, OrderStatus, ProductImage, ProductShipping } from '@plebeian/database'

import type { StallCoordinatesType } from './drawer-ui'
import { checkoutFormStore, currentStep } from './checkout'

export interface CartProduct {
	id: string
	name: string
	amount: number
	price: number
	currency: string
	stockQuantity: number
	images?: ProductImage[]
	shipping: ProductShipping[]
}

export interface CartStall {
	id: string
	products: string[]
	currency: string
	shippingMethodId: string | null
	shippingMethodName: string | null
	shippingCost: number
}

export interface CartUser {
	pubkey: string
	stalls: string[]
	v4vShares: V4VDTO[]
}

export interface InvoiceMessage {
	id: string
	createdAt: number
	updatedAt: number
	orderId: string
	totalAmount: number
	invoiceStatus: InvoiceStatus
	type: 'v4v' | 'merchant'
	paymentId: string
	paymentRequest: string | null
	proof: string | null
}

export interface NormalizedCart {
	users: Record<string, CartUser>
	stalls: Record<string, CartStall>
	products: Record<string, CartProduct>
	orders: Record<string, OrderMessage>
	invoices: Record<string, InvoiceMessage>
}

function createCart() {
	const { subscribe, set, update } = writable<NormalizedCart>(loadInitialCart())

	let batchUpdateTimeout: number | null = null

	const batchUpdate = (cart: NormalizedCart) => {
		if (batchUpdateTimeout) clearTimeout(batchUpdateTimeout)
		batchUpdateTimeout = setTimeout(() => {
			saveToStorage(cart)
			batchUpdateTimeout = null
		}, 300) as unknown as number
	}

	const saveToStorage = async (cart: NormalizedCart) => {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem('cart', JSON.stringify(cart))
		}
	}

	function loadInitialCart(): NormalizedCart {
		if (typeof sessionStorage !== 'undefined') {
			const storedCart = sessionStorage.getItem('cart')
			if (storedCart) {
				return JSON.parse(storedCart)
			}
		}
		return { users: {}, stalls: {}, products: {}, orders: {}, invoices: {} }
	}

	const findOrCreateUserStallProduct = (cart: NormalizedCart, userPubkey: string, stallId: string, productId?: string) => {
		const user = cart.users[userPubkey] || { pubkey: userPubkey, stalls: [] }
		if (!cart.users[userPubkey]) {
			cart.users[userPubkey] = user
		}

		const stall = cart.stalls[stallId] || { id: stallId, products: [], currency: '', shippingMethodId: null, shippingCost: 0 }
		if (!cart.stalls[stallId]) {
			cart.stalls[stallId] = stall
			user.stalls.push(stallId)
		}

		const product = productId ? cart.products[productId] : undefined

		return { user, stall, product }
	}

	const calculateStallTotal = async (stall: CartStall, products: Record<string, CartProduct>) => {
		let stallTotalInCurrency = 0
		let stallExtraShippingCost = 0

		for (const productId of stall.products) {
			const product = products[productId]
			const productTotal = product.price * product.amount
			stallTotalInCurrency += productTotal

			if (stall?.shippingMethodId) {
				const extraShippingCost = product.shipping?.find((s) => s.shippingId === stall.shippingMethodId)?.cost || 0
				stallExtraShippingCost += Number(extraShippingCost) * product.amount
			}
		}

		const [stallTotalInSats, shippingInSats, extraShippingInSats] = await Promise.all([
			resolveQuery(() => createCurrencyConversionQuery(stall.currency, stallTotalInCurrency)),
			stall.shippingCost && stall.currency
				? resolveQuery(() => createCurrencyConversionQuery(stall.currency, stall.shippingCost))
				: Promise.resolve(0),
			stallExtraShippingCost && stall.currency
				? resolveQuery(() => createCurrencyConversionQuery(stall.currency, stallExtraShippingCost))
				: Promise.resolve(0),
		])
		const _stallTotalInSats = stallTotalInSats ?? 0
		const _shippingInSats = shippingInSats ?? 0
		const _extraShippingInSats = extraShippingInSats ?? 0
		const stallShippingCost = stall.shippingCost ?? 0
		return {
			subtotalInSats: _stallTotalInSats,
			shippingInSats: _shippingInSats + _extraShippingInSats,
			totalInSats: _stallTotalInSats + _shippingInSats + _extraShippingInSats,
			subtotalInCurrency: stallTotalInCurrency,
			shippingInCurrency: stallShippingCost + stallExtraShippingCost,
			totalInCurrency: stallTotalInCurrency,
			currency: stall.currency,
		}
	}

	const calculateUserTotal = async (userPubkey: string) => {
		const cart = get({ subscribe })
		const user = cart.users[userPubkey]
		if (!user) return null

		let subtotalInSats = 0
		let shippingInSats = 0
		let totalInSats = 0
		const currencyTotals: Record<string, { subtotal: number; shipping: number; total: number }> = {}

		const stallTotalsPromises = user.stalls.map(async (stallId) => {
			const stall = cart.stalls[stallId]
			return await calculateStallTotal(stall, cart.products)
		})

		const stallTotals = await Promise.all(stallTotalsPromises)

		for (const stallTotal of stallTotals) {
			subtotalInSats += stallTotal.subtotalInSats
			shippingInSats += stallTotal.shippingInSats
			totalInSats += stallTotal.totalInSats

			if (!currencyTotals[stallTotal.currency]) {
				currencyTotals[stallTotal.currency] = { subtotal: 0, shipping: 0, total: 0 }
			}
			currencyTotals[stallTotal.currency].subtotal += stallTotal.subtotalInCurrency
			currencyTotals[stallTotal.currency].shipping += stallTotal.shippingInCurrency
			currencyTotals[stallTotal.currency].total += stallTotal.totalInCurrency
		}

		return { subtotalInSats, shippingInSats, totalInSats, currencyTotals }
	}

	const calculateGrandTotal = async () => {
		const cart = get({ subscribe })
		if (Object.keys(cart.users).length === 0) {
			return {
				grandSubtotalInSats: 0,
				grandShippingInSats: 0,
				grandTotalInSats: 0,
				currencyTotals: {},
			}
		}

		let grandSubtotalInSats = 0
		let grandShippingInSats = 0
		let grandTotalInSats = 0
		const currencyTotals: Record<string, { subtotal: number; shipping: number; total: number }> = {}

		const userTotalsPromises = Object.keys(cart.users).map(async (userPubkey) => {
			return await calculateUserTotal(userPubkey)
		})

		const userTotals = await Promise.all(userTotalsPromises)

		for (const userTotal of userTotals) {
			if (userTotal) {
				grandSubtotalInSats += userTotal.subtotalInSats
				grandShippingInSats += userTotal.shippingInSats
				grandTotalInSats += userTotal.totalInSats

				for (const [currency, amounts] of Object.entries(userTotal.currencyTotals)) {
					if (!currencyTotals[currency]) {
						currencyTotals[currency] = { subtotal: 0, shipping: 0, total: 0 }
					}
					currencyTotals[currency].subtotal += amounts.subtotal
					currencyTotals[currency].shipping += amounts.shipping
					currencyTotals[currency].total += amounts.total
				}
			}
		}

		return {
			grandSubtotalInSats,
			grandShippingInSats,
			grandTotalInSats,
			currencyTotals,
		}
	}
	return {
		subscribe,
		addProduct: (userPubkey: string, stallId: string, product: CartProduct, currency: string) =>
			update((cart) => {
				const { stall } = findOrCreateUserStallProduct(cart, userPubkey, stallId)

				if (cart.products[product.id]) {
					cart.products[product.id].amount = Math.min(cart.products[product.id].amount + product.amount, product.stockQuantity)
				} else {
					cart.products[product.id] = { ...product }
					stall.products.push(product.id)
				}

				stall.currency = currency

				batchUpdate(cart)
				return cart
			}),

		updateProductAmount: (userPubkey: string, stallId: string, productId: string, amount: number) =>
			update((cart) => {
				const product = cart.products[productId]
				if (product) {
					product.amount = Math.min(amount, product.stockQuantity)
				}
				batchUpdate(cart)
				return cart
			}),

		removeProduct: (userPubkey: string, stallId: string, productId: string) =>
			update((cart) => {
				const stall = cart.stalls[stallId]
				if (stall) {
					stall.products = stall.products.filter((id) => id !== productId)
					delete cart.products[productId]
				}

				// Clean up empty stalls and users
				if (stall.products.length === 0) {
					delete cart.stalls[stallId]
					const user = cart.users[userPubkey]
					if (user) {
						user.stalls = user.stalls.filter((id) => id !== stallId)
						if (user.stalls.length === 0) {
							delete cart.users[userPubkey]
						}
					}
				}

				batchUpdate(cart)
				return cart
			}),

		setShippingMethod: (stallId: string, shipping: Partial<RichShippingInfo>) =>
			update((cart) => {
				const stall = cart.stalls[stallId]
				if (stall && shipping.id) {
					stall.shippingMethodId = shipping.id
					stall.shippingCost = Number(shipping.cost)
					stall.shippingMethodName = shipping.name ?? null
				}
				batchUpdate(cart)
				return cart
			}),

		getShippingMethod: (userPubkey: string, stallId: string): string | null => {
			const cart = get({ subscribe })
			return cart.stalls[stallId]?.shippingMethodId || null
		},

		clear: () => {
			set({ users: {}, stalls: {}, products: {}, orders: {}, invoices: {} })
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.removeItem('cart')
			}
			currentStep.set(0)
			checkoutFormStore.set(null)
		},
		clearKeys: (keys: (keyof NormalizedCart)[]) => {
			update((cart) => {
				keys.forEach((key) => {
					cart[key] = {}
				})
				batchUpdate(cart)
				return cart
			})
		},
		handleProductUpdate: (event: CustomEvent) => {
			const { action, userPubkey, stallId, productId, amount } = event.detail

			update((cart) => {
				switch (action) {
					case 'increment':
						cart.products[productId].amount = Math.min(cart.products[productId].amount + 1, cart.products[productId].stockQuantity)
						break
					case 'decrement':
						cart.products[productId].amount = Math.max(cart.products[productId].amount - 1, 0)
						break
					case 'setAmount':
						cart.products[productId].amount = Math.min(amount, cart.products[productId].stockQuantity)
						break
					case 'remove': {
						const stall = cart.stalls[stallId]
						if (stall) {
							stall.products = stall.products.filter((id) => id !== productId)
							delete cart.products[productId]

							if (stall.products.length === 0) {
								delete cart.stalls[stallId]
								const user = cart.users[userPubkey]
								if (user) {
									user.stalls = user.stalls.filter((id) => id !== stallId)
									if (user.stalls.length === 0) {
										delete cart.users[userPubkey]
									}
								}
							}
						}
						break
					}
				}
				batchUpdate(cart)
				return cart
			})
		},
		calculateUserTotal,
		calculateStallTotal,
		calculateGrandTotal,
		addOrder(order: OrderMessage) {
			update((cart) => {
				cart.orders = {
					...cart.orders,
					[order.id as string]: order,
				}
				batchUpdate(cart)
				return cart
			})
		},
		addInvoice(invoice: InvoiceMessage) {
			update((cart) => {
				cart.invoices = {
					...cart.invoices,
					[invoice.id]: invoice,
				}
				batchUpdate(cart)
				return cart
			})
		},
		updateOrderStatus(orderId: string, status: OrderStatus) {
			update((cart) => {
				if (cart.orders[orderId]) {
					cart.orders[orderId] = {
						...cart.orders[orderId],
						status: status,
					}
				} else {
					console.warn(`Attempted to update non-existent order: ${orderId}`)
				}
				batchUpdate(cart)
				return cart
			})
		},
	}
}

export const cart = createCart()

export const v4vShares = derived(
	cart,
	($cart, set) => {
		const fetchV4VShares = async () => {
			const shares: Record<string, V4VDTO[]> = {}

			for (const userPubkey of Object.keys($cart.users)) {
				try {
					const userShares = await resolveQuery(() => v4VForUserQuery(userPubkey))
					shares[userPubkey] = userShares || []
				} catch (error) {
					console.error(`Failed to fetch v4v shares for user ${userPubkey}:`, error)
					shares[userPubkey] = []
				}
			}
			set(shares)
		}

		const debouncedFetch = debounce(fetchV4VShares, 250)
		debouncedFetch()

		return () => {}
	},
	{} as Record<string, V4VDTO[]>,
)

export const cartTotal = derived(cart, ($cart) =>
	Object.values($cart.stalls).reduce(
		(total, stall) =>
			total +
			stall.products.reduce((stallTotal, productId) => stallTotal + $cart.products[productId].price * $cart.products[productId].amount, 0) +
			(stall.shippingCost || 0),
		0,
	),
)

export const userCartTotal = derived(cart, ($cart) =>
	Object.values($cart.users).map((user) => ({
		userPubkey: user.pubkey,
		total: user.stalls.reduce((userTotal, stallId) => {
			const stall = $cart.stalls[stallId]
			return (
				userTotal +
				stall.products.reduce(
					(stallTotal, productId) => stallTotal + $cart.products[productId].price * $cart.products[productId].amount,
					0,
				) +
				(stall.shippingCost || 0)
			)
		}, 0),
	})),
)

export const cartTotalInSats = derived(cart, ($cart, set) => {
	const calculateTotal = async () => {
		let totalSats = 0
		for (const stall of Object.values($cart.stalls)) {
			const stallTotal =
				stall.products.reduce((total, productId) => {
					const product = $cart.products[productId]
					return total + product.price * product.amount
				}, 0) + (stall.shippingCost || 0)
			const stallTotalInSats = (await resolveQuery(() => createCurrencyConversionQuery(stall.currency, stallTotal))) || 0
			totalSats += stallTotalInSats
		}
		set(totalSats)
	}

	const debouncedCalculate = debounce(calculateTotal, 250)
	debouncedCalculate()
})

export const userCartTotalInSats = derived<typeof cart, Record<string, number>>(cart, ($cart, set) => {
	const calculateUserTotals = async () => {
		const userTotals: Record<string, number> = {}
		for (const user of Object.values($cart.users)) {
			let userTotalSats = 0
			for (const stallId of user.stalls) {
				const stall = $cart.stalls[stallId]
				const stallTotal =
					stall.products.reduce((total, productId) => {
						const product = $cart.products[productId]
						return total + product.price * product.amount
					}, 0) + (stall.shippingCost || 0)
				const stallTotalInSats = (await resolveQuery(() => createCurrencyConversionQuery(stall.currency, stallTotal))) || 0
				userTotalSats += stallTotalInSats
			}
			userTotals[user.pubkey] = userTotalSats
		}
		set(userTotals)
	}

	const debouncedCalculate = debounce(calculateUserTotals, 250)
	debouncedCalculate()
})

export function handleAddToCart(userId: string, stallCoordinates: StallCoordinatesType, product: Partial<DisplayProduct> | null) {
	if (!product) return
	const currentCart = get(cart)
	const currentAmount = currentCart.products[product.id ?? '']?.amount || 0

	const availableStock = product.quantity ?? 0
	const amountToAdd = Math.min(1, availableStock - currentAmount)
	const currency = product.currency ?? ''
	if (amountToAdd > 0) {
		cart.addProduct(
			userId,
			stallCoordinates,
			{
				id: product.id ?? '',
				name: product.name ?? '',
				amount: amountToAdd,
				price: Number(product.price) || 0,
				stockQuantity: availableStock,
				images: product.images,
				currency: product.currency as string,
				shipping: product.shipping || [],
			},
			currency,
		)
		toast.success('Product added to cart')
	} else {
		toast.error('Cannot add more of this product to the cart')
	}
}
