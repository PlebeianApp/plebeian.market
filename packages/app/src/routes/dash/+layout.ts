// routes/dash/+layout.ts
import type { MenuItem } from '$lib/interfaces'
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

	const menuItems: MenuItem[] = [
		{
			title: '🛍️ Orders',
			description: 'View and manage your orders',
			value: 'orders',
			root: '/dash/order',
			public: false,
			links: [
				{
					title: '💰 Sales',
					href: '/dash/order/sales',
					description: 'Manage your sales',
				},
				{
					title: '🛍️ Purchases',
					href: '/dash/order/purchases',
					description: 'View your purchases',
				},
			],
		},
		{
			title: 'Messages',
			description: 'View and manage your messages',
			value: 'messages',
			root: '/dash/messages',
			public: false,
			links: [
				{
					title: 'Messages',
					href: '/dash/messages',
					description: 'Manage your messages',
				},
			],
		},
	]

	return {
		menuItems: menuItems,
		activeUser: activeUser,
		userExist,
	}
}
