import type { DisplayProduct } from '$lib/server/products.service'
import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
import { debounce, resolveQuery } from '$lib/utils'
import { toast } from 'svelte-sonner'
import { derived, get, writable } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'

export interface CartProduct {
	id: string
	name: string
	amount: number
	price: number
	currency: string
	stockQuantity: number
	images?: ProductImage[]
}

export interface CartStall {
	id: string
	products: string[]
	currency: string
	shippingMethodId: string | null
	shippingCost: number
}

export interface CartUser {
	pubkey: string
	stalls: string[]
}

interface NormalizedCart {
	users: Record<string, CartUser>
	stalls: Record<string, CartStall>
	products: Record<string, CartProduct>
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
		return { users: {}, stalls: {}, products: {} }
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

		setShippingMethod: (userPubkey: string, stallId: string, shippingMethodId: string, shippingCost: number) =>
			update((cart) => {
				const stall = cart.stalls[stallId]
				if (stall) {
					stall.shippingMethodId = shippingMethodId
					stall.shippingCost = shippingCost
				}
				batchUpdate(cart)
				return cart
			}),

		getShippingMethod: (userPubkey: string, stallId: string): string | null => {
			const cart = get({ subscribe })
			return cart.stalls[stallId]?.shippingMethodId || null
		},

		clear: () => {
			set({ users: {}, stalls: {}, products: {} })
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.removeItem('cart')
			}
		},
	}
}

export const cart = createCart()

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

export const userCartTotalInSats = derived(cart, ($cart, set) => {
	const calculateUserTotals = async () => {
		const userTotals = []
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
			userTotals.push({ userPubkey: user.pubkey, totalSats: userTotalSats })
		}
		set(userTotals)
	}

	const debouncedCalculate = debounce(calculateUserTotals, 250)
	debouncedCalculate()
})

export function handleAddToCart(userId: string, stallCoordinates: string, product: Partial<DisplayProduct>) {
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
			},
			currency,
		)
		toast.success('Product added to cart')
	} else {
		toast.error('Cannot add more of this product to the cart')
	}
}
