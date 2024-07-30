export interface CartProduct {
	id: string
	name: string
	amount: number
	price: number
	stockQuantity: number
	images?: Array<{ imageUrl: string }>
}

export interface CartStall {
	id: string
	products: CartProduct[]
	currency: string
	shippingMethodId: string | null
	shippingCost: number
}

export interface CartUser {
	pubkey: string
	stalls: CartStall[]
}
