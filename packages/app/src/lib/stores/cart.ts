import { browser } from '$app/environment'
import { createProductQuery } from '$lib/fetch/products.queries'
import { createShippingMethodQuery } from '$lib/fetch/shipping.queries'
import { currencyToBtc } from '$lib/utils'
import { toast } from 'svelte-sonner'
import { derived, get, writable } from 'svelte/store'

import type { StallCoordinatesType } from './drawer-ui'

// TODO Adapt cart to non registered users
interface Product {
	id: string
	name: string
	amount: number
	price: number
	stockQuantity: number
}

interface Stall {
	id: string
	products: Product[]
	currency: string
	shippingMethodId: string | null
	shippingCost: number
}

interface User {
	pubkey: string
	stalls: Stall[]
}

type Cart = User[]

function saveCartToStorage(cartData: Cart) {
	if (browser) {
		sessionStorage.setItem('cart', JSON.stringify(cartData))
	}
}

function loadCartFromStorage(): Cart {
	if (browser) {
		const savedCart = sessionStorage.getItem('cart')
		return savedCart ? JSON.parse(savedCart) : []
	}
	return []
}

export const cart = writable<Cart>(loadCartFromStorage())

if (browser) {
	cart.subscribe(($cart) => {
		saveCartToStorage($cart)
	})
}

export function initializeCart() {
	if (browser) {
		const savedCart = loadCartFromStorage()
		cart.set(savedCart)
	}
}

export function clearCart() {
	cart.set([])
	if (browser) {
		sessionStorage.removeItem('cart')
	}
}

function findUser(pubkey: string): User {
	const currentCart = get(cart)
	let user = currentCart.find((u) => u.pubkey === pubkey)
	if (!user) {
		user = { pubkey, stalls: [] }
		cart.update((c) => [...c, user as User])
	}
	return user
}

function findStall(user: User, stallId: StallCoordinatesType, currency: string): Stall {
	let stall = user.stalls.find((s) => s.id === stallId)
	if (!stall) {
		stall = { id: stallId, products: [], currency, shippingMethodId: null, shippingCost: 0 }
		cart.update((c) => {
			const userIndex = c.findIndex((u) => u.pubkey === user.pubkey)
			if (userIndex !== -1) {
				c[userIndex].stalls.push(stall as Stall)
			}
			return c
		})
	}
	return stall
}

function cleanupCart(c: Cart): Cart {
	return c.filter((user) => {
		user.stalls = user.stalls.filter((stall) => stall.products.length > 0)
		return user.stalls.length > 0
	})
}

async function updateShippingCost(stall: Stall) {
	if (stall.shippingMethodId) {
		const shippingQuery = createShippingMethodQuery(stall.shippingMethodId)
		return new Promise<void>((resolve) => {
			let unsubscribe = () => {}
			unsubscribe = shippingQuery.subscribe((queryResult) => {
				if (queryResult.data && queryResult.data.length > 0) {
					stall.shippingCost = +queryResult.data[0].cost
					cart.update((c) => c) // Trigger an update to the cart
				}
				unsubscribe()
				resolve()
			})
		})
	}
}

export async function setShippingMethod(stallId: string, shippingMethodId: string) {
	const currentCart = get(cart)
	for (const user of currentCart) {
		const stall = user.stalls.find((s) => s.id === stallId)
		if (stall) {
			stall.shippingMethodId = shippingMethodId
			await updateShippingCost(stall)
			cart.set(currentCart)
			break
		}
	}
}

export const getShippingMethod = (stallId: string) => {
	return derived(cart, ($cart) => {
		for (const user of $cart) {
			const stall = user.stalls.find((s) => s.id === stallId)
			if (stall) {
				return stall.shippingMethodId
			}
		}
		return null
	})
}

export function addProduct(userPubkey: string, stallId: StallCoordinatesType, product: Product, currency: string) {
	const user = findUser(userPubkey)
	const stall = findStall(user, stallId, currency)
	cart.update((c) => {
		const userIndex = c.findIndex((u) => u.pubkey === user.pubkey)
		const stallIndex = c[userIndex].stalls.findIndex((s) => s.id === stall.id)
		const existingProduct = c[userIndex].stalls[stallIndex].products.find((p) => p.id === product.id)

		if (existingProduct) {
			existingProduct.amount = Math.min(existingProduct.amount + product.amount, product.stockQuantity)
		} else {
			c[userIndex].stalls[stallIndex].products.push({
				...product,
				amount: Math.min(product.amount, product.stockQuantity),
			})
		}
		return c
	})
	toast.success('Product added to cart')
}

export function removeProduct(productId: string) {
	cart.update((c) => {
		for (let i = 0; i < c.length; i++) {
			for (let j = 0; j < c[i].stalls.length; j++) {
				const index = c[i].stalls[j].products.findIndex((p) => p.id === productId)
				if (index !== -1) {
					c[i].stalls[j].products.splice(index, 1)
					return cleanupCart(c)
				}
			}
		}
		return c
	})
	toast.success('Product removed from cart')
}

export function incrementProduct(productId: string) {
	cart.update((c) => {
		for (let i = 0; i < c.length; i++) {
			for (let j = 0; j < c[i].stalls.length; j++) {
				const product = c[i].stalls[j].products.find((p) => p.id === productId)
				if (product) {
					if (product.amount < product.stockQuantity) {
						product.amount++
					}
					return c
				}
			}
		}
		return c
	})
}

export function decrementProduct(productId: string) {
	cart.update((c) => {
		for (let i = 0; i < c.length; i++) {
			for (let j = 0; j < c[i].stalls.length; j++) {
				const productIndex = c[i].stalls[j].products.findIndex((p) => p.id === productId)
				if (productIndex !== -1) {
					if (c[i].stalls[j].products[productIndex].amount > 1) {
						c[i].stalls[j].products[productIndex].amount--
					} else {
						c[i].stalls[j].products.splice(productIndex, 1)
					}
					return cleanupCart(c)
				}
			}
		}
		return c
	})
}

export function getStallProducts(stallId: string): Product[] {
	const currentCart = get(cart)
	for (const user of currentCart) {
		const stall = user.stalls.find((s) => s.id === stallId)
		if (stall) {
			return stall.products
		}
	}
	return []
}

export function setAmountForProduct(productId: string, amount: number) {
	cart.update((c) => {
		for (let i = 0; i < c.length; i++) {
			for (let j = 0; j < c[i].stalls.length; j++) {
				const productIndex = c[i].stalls[j].products.findIndex((p) => p.id === productId)
				if (productIndex !== -1) {
					const product = c[i].stalls[j].products[productIndex]
					if (amount > 0) {
						product.amount = Math.min(amount, product.stockQuantity)
					} else {
						c[i].stalls[j].products.splice(productIndex, 1)
					}
					return cleanupCart(c)
				}
			}
		}
		return c
	})
}

export const getProductAmount = (productId: string) => {
	return derived(cart, ($cart) => {
		for (const user of $cart) {
			for (const stall of user.stalls) {
				const product = stall.products.find((p) => p.id === productId)
				if (product) {
					return product.amount
				}
			}
		}
		return 0
	})
}

export const allStallsHaveShippingMethod = derived(cart, ($cart) => {
	for (const user of $cart) {
		for (const stall of user.stalls) {
			if (!stall.shippingMethodId) {
				return false
			}
		}
	}
	return $cart.length > 0 // Return true only if there are stalls and all have shipping methods
})

interface TotalAmounts {
	totalAmountItems: number
	totalInSats: number
	totalShippingCost: number
}

const initialTotalAmounts: TotalAmounts = {
	totalAmountItems: 0,
	totalInSats: 0,
	totalShippingCost: 0,
}

export const getTotalAmounts = derived<typeof cart, TotalAmounts>(
	cart,
	($cart, set) => {
		let totalAmountItems = 0
		let totalInSats = 0
		let totalShippingCostInSats = 0
		let pendingConversions = 0

		function attemptToFinalize() {
			if (pendingConversions === 0) {
				set({
					totalAmountItems,
					totalInSats: totalInSats + totalShippingCostInSats,
					totalShippingCost: totalShippingCostInSats,
				})
			}
		}

		for (const user of $cart) {
			for (const stall of user.stalls) {
				for (const product of stall.products) {
					totalAmountItems += product.amount
					const productTotal = product.price * product.amount
					pendingConversions++

					currencyToBtc(stall.currency, productTotal, true)
						.then((satsAmount) => {
							totalInSats += satsAmount
							pendingConversions--
							attemptToFinalize()
						})
						.catch((error) => {
							console.error('Error converting currency to BTC:', error)
							pendingConversions--
							attemptToFinalize()
						})
				}

				pendingConversions++
				currencyToBtc(stall.currency, stall.shippingCost, true)
					.then((satsAmount) => {
						totalShippingCostInSats += satsAmount
						pendingConversions--
						attemptToFinalize()
					})
					.catch((error) => {
						console.error('Error converting shipping cost to BTC:', error)
						pendingConversions--
						attemptToFinalize()
					})
			}
		}

		if (pendingConversions === 0) {
			set({
				totalAmountItems,
				totalInSats: 0,
				totalShippingCost: 0,
			})
		}

		return initialTotalAmounts
	},
	initialTotalAmounts,
)

export async function updatePrices() {
	const currentCart = get(cart)
	const updatedCart = [...currentCart]
	let hasChanges = false

	const updatePromises = updatedCart.flatMap((user) =>
		user.stalls.flatMap((stall) =>
			stall.products
				.map(async (product) => {
					return new Promise<void>((resolve) => {
						const productQuery = createProductQuery(product.id)
						let unsubscribe = () => {}
						unsubscribe = productQuery.subscribe((queryResult) => {
							if (queryResult.data) {
								if (queryResult.data.price !== product.price) {
									product.price = queryResult.data.price
									hasChanges = true
								}
								if (queryResult.data.quantity !== product.stockQuantity) {
									product.stockQuantity = queryResult.data.quantity
									product.amount = Math.min(product.amount, product.stockQuantity)
									hasChanges = true
								}
							}
							unsubscribe()
							resolve()
						})
					})
				})
				.concat([updateShippingCost(stall)]),
		),
	)

	await Promise.all(updatePromises)

	if (hasChanges) {
		cart.set(updatedCart)
	}
}
