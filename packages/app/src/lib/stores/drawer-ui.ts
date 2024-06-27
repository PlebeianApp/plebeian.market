import { writable } from 'svelte/store'

export type StallIdType = `30017:${string}:${string}`
export type ProductIdType = `30018:${string}:${string}`

type IdType = StallIdType | ProductIdType | `new:stall` | `new:product` | null

export const drawerUI = writable<{
	id: IdType
	forStall: StallIdType | null
}>({
	id: null,
	forStall: null,
})

export const openDrawerForNewStall = () => {
	drawerUI.set({
		id: 'new:stall',
		forStall: null,
	})
}

export const openDrawerForNewProduct = () => {
	drawerUI.set({
		id: 'new:product',
		forStall: null,
	})
}

export const openDrawerForStall = (stallId: string) => {
	const id = stallId as StallIdType
	drawerUI.set({ id, forStall: null })
}

export const openDrawerForProduct = (productId: string) => {
	const id = productId as ProductIdType
	drawerUI.set({ id, forStall: null })
}

export const closeDrawer = () => {
	drawerUI.set({
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewProductForStall = (stallId: string) => {
	const id = 'new:product' as IdType
	drawerUI.set({ id, forStall: stallId as StallIdType })
}
