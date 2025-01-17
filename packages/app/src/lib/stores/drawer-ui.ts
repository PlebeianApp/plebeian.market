import type NDKSvelte from '@nostr-dev-kit/ndk-svelte'
import type { KindProducts, KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { toast } from 'svelte-sonner'
import { get, writable } from 'svelte/store'

export type DraweUiType = 'stall' | 'product' | 'cart' | 'payment' | null

export type StallCoordinatesType = `${typeof KindStalls}:${string}:${string}`
export type ProductCoordinatesType = `${typeof KindProducts}:${string}:${string}`

type IdType = StallCoordinatesType | ProductCoordinatesType | null

export const drawerUI = writable<{
	drawerType: DraweUiType
	id: IdType
	forStall: string | null
}>({
	drawerType: null,
	id: null,
	forStall: null,
})

const isUserLoggedIn = (ndkStore: NDKSvelte) => !!ndkStore.activeUser

const handleUserNotLoggedIn = (action: string) => {
	toast.error(`You need to be logged in to ${action}`)
}

const setDrawerState = (state: { drawerType: DraweUiType; id: IdType; forStall: string | null }) => {
	drawerUI.set(state)
}

export const openDrawerForCart = () => {
	const currentNdkStore = get(ndkStore)
	// if (!isUserLoggedIn(currentNdkStore)) {
	// 	handleUserNotLoggedIn('view your cart')
	// 	return
	// }
	setDrawerState({
		drawerType: 'cart',
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewStall = () => {
	const currentNdkStore = get(ndkStore)
	if (!isUserLoggedIn(currentNdkStore)) {
		handleUserNotLoggedIn('create a stall')
		return
	}
	setDrawerState({
		drawerType: 'stall',
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewProduct = () => {
	const currentNdkStore = get(ndkStore)
	if (!isUserLoggedIn(currentNdkStore)) {
		handleUserNotLoggedIn('create a product')
		return
	}
	setDrawerState({
		drawerType: 'product',
		id: null,
		forStall: null,
	})
}

export const openDrawerForPaymentDetail = () => {
	const currentNdkStore = get(ndkStore)
	if (!isUserLoggedIn(currentNdkStore)) {
		handleUserNotLoggedIn('create a payment detail')
		return
	}
	setDrawerState({
		drawerType: 'payment',
		id: null,
		forStall: null,
	})
}

export const openDrawerForStall = (stallId: string) => {
	const currentNdkStore = get(ndkStore)
	if (!isUserLoggedIn(currentNdkStore)) {
		handleUserNotLoggedIn('view a stall')
		return
	}
	const id = stallId as StallCoordinatesType
	setDrawerState({ drawerType: 'stall', id, forStall: null })
}

export const openDrawerForProduct = (productId: string, stallId?: string) => {
	const currentNdkStore = get(ndkStore)
	if (!isUserLoggedIn(currentNdkStore)) {
		handleUserNotLoggedIn('view a product')
		return
	}
	const id = productId as ProductCoordinatesType
	setDrawerState({ drawerType: 'product', id, forStall: stallId ? stallId : null })
}

export const closeDrawer = () => {
	setDrawerState({
		drawerType: null,
		id: null,
		forStall: null,
	})
}

export const openDrawerForNewProductForStall = (stallId: string) => {
	const currentNdkStore = get(ndkStore)
	if (!isUserLoggedIn(currentNdkStore)) {
		handleUserNotLoggedIn('create a product')
		return
	}
	setDrawerState({ drawerType: 'product', id: null, forStall: stallId as StallCoordinatesType })
}
