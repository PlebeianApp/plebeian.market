import type { MenuItem } from '$lib/interfaces'

export const load = async () => {
	const menuItems: MenuItem[] = [
		{
			title: 'Orders',
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
		{
			title: 'App Settings',
			description: 'Configure app settings and preferences',
			value: 'app-settings',
			root: '/dash/settings/app',
			links: [
				{
					title: '⚙️ App Miscellanea',
					href: '/dash/settings/app/misc',
					description: 'Manage app identity and other settings',
					public: false,
				},
				{ title: '👥 Team', href: '/dash/settings/app/team', description: 'Manage team members and their roles', public: false },
				{ title: '🚫 Blacklists', href: '/dash/settings/app/blacklists', description: 'Manage blocked users and content', public: false },
			],
		},
		{
			title: 'Account Settings',
			description: 'Manage account settings and preferences',
			value: 'account-settings',
			root: '/dash/settings/account',
			links: [
				{ title: '👤 Profile', href: '/dash/settings/account/profile', description: 'Edit your profile', public: true },
				{ title: '💸 Payments', href: '/dash/settings/account/payments', description: 'Manage payment methods', public: false },
				{ title: '👝 Wallets', href: '/dash/settings/account/wallets', description: 'Manage your connected wallets', public: false },
				{ title: '📦 Products', href: '/dash/settings/account/products', description: 'View and manage your products', public: true },
				{ title: '🏮 Shops', href: '/dash/settings/account/stalls', description: 'Manage your shops', public: true },
				{
					title: '🔌 Network',
					href: '/dash/settings/account/network',
					description: 'Manage network settings and connections',
					public: true,
				},
				{
					title: '❌ Delete account',
					href: '/dash/settings/account/delete',
					description: 'Permanently delete your account',
					public: false,
				},
			],
		},
		{
			title: 'Circular Economy Community Builder',
			description: 'Configure community contributions preferences',
			value: 'cecb-settings',
			root: '/dash/settings/cecb',
			links: [
				{
					title: '💪 Contribute',
					href: '/dash/settings/cecb',
					description: 'Configure community contributions preferences',
					public: false,
				},
			],
		},
	]

	return {
		menuItems: menuItems,
	}
}
