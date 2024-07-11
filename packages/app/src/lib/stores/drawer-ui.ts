import { writable } from 'svelte/store'

export type DraweUiType = 'stall' | 'product' | 'cart' | null

export type StallIdType = `30017:${string}:${string}`
export type ProductIdType = `30018:${string}:${string}`

type IdType = StallIdType | ProductIdType | null

export const drawerUI = writable<{
	drawerType: DraweUiType
	id: IdType
	forStall: StallIdType | null
}>({
	drawerType: null,
	id: null,
	forStall: null,
})

export const openDrawerForCart = () => {
	drawerUI.set({
		drawerType: 'cart',
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewStall = () => {
	drawerUI.set({
		drawerType: 'stall',
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewProduct = () => {
	drawerUI.set({
		drawerType: 'product',
		id: null,
		forStall: null,
	})
}

export const openDrawerForStall = (stallId: string) => {
	const id = stallId as StallIdType
	drawerUI.set({ drawerType: 'stall', id, forStall: null })
}

export const openDrawerForProduct = (productId: string) => {
	const id = productId as ProductIdType
	drawerUI.set({ drawerType: 'product', id, forStall: null })
}

export const closeDrawer = () => {
	drawerUI.set({
		drawerType: null,
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewProductForStall = (stallId: string) => {
	drawerUI.set({ drawerType: 'product', id: null, forStall: stallId as StallIdType })
}
