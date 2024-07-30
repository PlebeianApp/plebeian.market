import type { CartProduct, CartStall, CartUser } from '$lib/components/cart/types'
import type { DisplayProduct } from '$lib/server/products.service'
import { toast } from 'svelte-sonner'
import { derived, get, writable } from 'svelte/store'

export type Cart = {
	pubkey: string
	stalls: CartStall[]
}

function createCart() {
	const initialCart: CartUser[] = typeof sessionStorage !== 'undefined' ? JSON.parse(sessionStorage.getItem('cart') || '[]') : []
	const { subscribe, set, update } = writable<CartUser[]>(initialCart)
	const saveToStorage = (cart: CartUser[]) => {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem('cart', JSON.stringify(cart))
		}
	}
	return {
		subscribe,
		addProduct: (userPubkey: string, stallId: string, product: CartProduct) =>
			update((cart) => {
				const updatedCart = [...cart]
				const userIndex = updatedCart.findIndex((u) => u.pubkey === userPubkey)
				if (userIndex === -1) {
					updatedCart.push({
						pubkey: userPubkey,
						stalls: [{ id: stallId, products: [product], currency: '', shippingMethodId: null, shippingCost: 0 }],
					})
				} else {
					const stallIndex = updatedCart[userIndex].stalls.findIndex((s) => s.id === stallId)
					if (stallIndex === -1) {
						updatedCart[userIndex].stalls.push({ id: stallId, products: [product], currency: '', shippingMethodId: null, shippingCost: 0 })
					} else {
						const productIndex = updatedCart[userIndex].stalls[stallIndex].products.findIndex((p) => p.id === product.id)
						if (productIndex === -1) {
							updatedCart[userIndex].stalls[stallIndex].products.push(product)
						} else {
							const currentAmount = updatedCart[userIndex].stalls[stallIndex].products[productIndex].amount
							const newAmount = Math.min(currentAmount + product.amount, product.stockQuantity)
							updatedCart[userIndex].stalls[stallIndex].products[productIndex].amount = newAmount
						}
					}
				}
				saveToStorage(updatedCart)
				return updatedCart
			}),

		updateProductAmount: (userPubkey: string, stallId: string, productId: string, amount: number) =>
			update((cart) => {
				const updatedCart = cart.map((user) => {
					if (user.pubkey === userPubkey) {
						user.stalls = user.stalls.map((stall) => {
							if (stall.id === stallId) {
								stall.products = stall.products.map((product) => {
									if (product.id === productId) {
										return { ...product, amount: Math.min(amount, product.stockQuantity) }
									}
									return product
								})
							}
							return stall
						})
					}
					return user
				})
				saveToStorage(updatedCart)
				return updatedCart
			}),
		removeProduct: (userPubkey: string, stallId: string, productId: string) =>
			update((cart) => {
				const updatedCart = cart
					.map((user) => {
						if (user.pubkey === userPubkey) {
							user.stalls = user.stalls
								.map((stall) => {
									if (stall.id === stallId) {
										stall.products = stall.products.filter((p) => p.id !== productId)
									}
									return stall
								})
								.filter((stall) => stall.products.length > 0)
						}
						return user
					})
					.filter((user) => user.stalls.length > 0)
				saveToStorage(updatedCart)
				return updatedCart
			}),
		setShippingMethod: (userPubkey: string, stallId: string, shippingMethodId: string, shippingCost: number) =>
			update((cart) => {
				const updatedCart = cart.map((user) => {
					if (user.pubkey === userPubkey) {
						user.stalls = user.stalls.map((stall) => {
							if (stall.id === stallId) {
								return { ...stall, shippingMethodId, shippingCost }
							}
							return stall
						})
					}
					return user
				})
				saveToStorage(updatedCart)
				return updatedCart
			}),
		getShippingMethod: (userPubkey: string, stallId: string): string | null => {
			const cart = get({ subscribe })
			const user = cart.find((u) => u.pubkey === userPubkey)
			if (user) {
				const stall = user.stalls.find((s) => s.id === stallId)
				return stall ? stall.shippingMethodId : null
			}
			return null
		},
		clear: () => {
			set([])
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.removeItem('cart')
			}
		},
	}
}

export const cart = createCart()

export const cartTotal = derived(cart, ($cart) =>
	$cart.reduce(
		(total, user) =>
			total +
			user.stalls.reduce(
				(userTotal, stall) =>
					userTotal +
					stall.products.reduce((stallTotal, product) => stallTotal + product.price * product.amount, 0) +
					(stall.shippingCost || 0),
				0,
			),
		0,
	),
)

export const userCartTotal = derived(cart, ($cart) =>
	$cart.map((user) => ({
		userPubkey: user.pubkey,
		total: user.stalls.reduce(
			(userTotal, stall) =>
				userTotal +
				stall.products.reduce((stallTotal, product) => stallTotal + product.price * product.amount, 0) +
				(stall.shippingCost || 0),
			0,
		),
	})),
)

export function handleAddToCart(userId: string, stallCoordinates: string, product: Partial<DisplayProduct>) {
	const currentCart = get(cart)
	const currentAmount =
		currentCart
			.find((u) => u.pubkey === userId)
			?.stalls.find((s) => s.id === stallCoordinates)
			?.products.find((p) => p.id === product.id)?.amount || 0

	const availableStock = product.quantity ?? 0
	const amountToAdd = Math.min(1, availableStock - currentAmount)

	if (amountToAdd > 0) {
		cart.addProduct(userId, stallCoordinates, {
			id: product.id ?? '',
			name: product.name ?? '',
			amount: amountToAdd,
			price: Number(product.price) || 0,
			stockQuantity: availableStock,
		})
		toast.success('Product added to cart')
	} else {
		toast.error('Cannot add more of this product to the cart')
	}
}
