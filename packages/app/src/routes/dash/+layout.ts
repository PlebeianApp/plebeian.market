import type { MenuItem } from '$lib/interfaces'

export const load = async () => {
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
	}
}
