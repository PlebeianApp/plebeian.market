import type { MenuItem } from '$lib/interfaces'

export const load = async () => {
	const menuItems: MenuItem[] = [
		{
			title: 'Sales',
			description: 'View and manage your orders',
			value: 'sales',
			root: '/dash/order',
			links: [
				{
					title: '💰 Sales',
					href: '/dash/order/sales',
				},
				{
					title: '💪 Circular Economy Builder',
					href: '/dash/settings/cecb',
				},
			],
		},
		{
			title: 'Shops',
			description: 'View and manage your shops',
			value: 'shops',
			root: '/dash/stalls',
			links: [
				{ title: '📦 Products', href: '/dash/settings/account/products' },
				{ title: '🏮 Shops', href: '/dash/settings/account/stalls' },
				{ title: '💸 Payments', href: '/dash/settings/account/payments', roles: ['pleb'] },
			],
		},
		{
			title: 'Account',
			description: 'Manage account settings and preferences',
			value: 'account',
			root: '/dash/settings/account',
			links: [
				{ title: '👤 Profile', href: '/dash/settings/account/profile' },
				{
					title: '📨 Messages',
					href: '/dash/messages',
				},
				{ title: '👝 Wallets', href: '/dash/settings/account/wallets', roles: ['admin', 'pleb'] },
				{
					title: '🛍️ Purchases',
					href: '/dash/order/purchases',
				},
				{
					title: '🔌 Network',
					href: '/dash/settings/account/network',
				},
				{
					title: '❌ Delete account',
					href: '/dash/settings/account/delete',
				},
			],
		},
		{
			title: 'App Settings',
			description: 'Configure app settings and preferences',
			value: 'app-settings',
			root: '/dash/settings/app',
			links: [
				{
					title: '🔧 App Miscellanea',
					href: '/dash/settings/app/misc',
					roles: ['admin'],
				},
				{ title: '👥 Team', href: '/dash/settings/app/team', roles: ['admin'] },
				{ title: '🚫 Blacklists', href: '/dash/settings/app/blacklists', roles: ['admin'] },
			],
		},
	]

	return {
		menuItems,
	}
}
