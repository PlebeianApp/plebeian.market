import type { RichUser } from '$lib/server/users.service.js'
import { activeUserQuery } from '$lib/fetch/users.queries'
import ndkStore from '$lib/stores/ndk.js'
import { checkIfUserExists } from '$lib/utils.js'
import { get } from 'svelte/store'

export const load = async () => {
	const $ndkStore = get(ndkStore)
	const userExist = await checkIfUserExists($ndkStore.activeUser?.pubkey as string)
	const activeUser = userExist
		? get(activeUserQuery).data
		: ({ ...$ndkStore.activeUser?.profile, id: $ndkStore.activeUser?.pubkey } as Partial<RichUser>)
	const menuItems = [
		{
			title: '🛍️ Orders',
			description: 'View and manage your orders',
			value: 'orders',
			root: '/dash/orders',
			links: [
				{ title: '💰 Sales', href: '/dash/orders/sales', description: 'Manage your sales', public: true },
				{ title: '🛍️ Purchases', href: '/dash/orders/purchases', description: 'View your purchases', public: true },
			],
		},
		// {
		//   title: '📍 Address Book',
		//   description: 'Manage your addresses',
		//   value: 'address-book',
		//   root: '/dash/address-book',
		//   links: [
		// 	{ title: '📍 All Addresses', href: '/dash/address-book/all', description: 'View all your addresses', public: true },
		// 	{ title: '📍 Add New Address', href: '/dash/address-book/add', description: 'Add a new address', public: true },
		//   ],
		// },
		// {
		//   title: '❤️ Wishlist',
		//   description: 'View and manage your wishlist',
		//   value: 'wishlist',
		//   root: '/dash/wishlist',
		//   links: [
		// 	{ title: '❤️ All Wishlist Items', href: '/dash/wishlist/all', description: 'View all your wishlist items', public: true },
		// 	{ title: '❤️ Add to Wishlist', href: '/dash/wishlist/add', description: 'Add a new item to your wishlist', public: true },
		//   ],
		// },
	]
	return {
		menuItems: menuItems,
		activeUser: activeUser,
		userExist,
	}
}
