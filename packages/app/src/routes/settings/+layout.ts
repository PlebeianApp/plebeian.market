import type { MenuItem } from '$lib/interfaces'

export const load = async () => {
	const menuItems: MenuItem[] = [
		{
			title: '📊 App Settings',
			description: 'Configure app settings and preferences',
			value: 'app-settings',
			root: '/settings/app',
			public: false,
			links: [
				{ title: '⚙️ App Miscellanea', href: '/settings/app/misc', description: 'Manage app identity and other settings' },
				{ title: '👥 Team', href: '/settings/app/team', description: 'Manage team members and their roles' },
				{ title: '🚫 Blacklists', href: '/settings/app/blacklists', description: 'Manage blocked users and content' },
			],
		},
		{
			title: '👥 Account Settings',
			description: 'Manage account settings and preferences',
			value: 'account-settings',
			root: '/settings/account',
			public: true,
			links: [
				{ title: '👤 Profile', href: '/settings/account/profile', description: 'Edit your profile', public: true },
				{ title: '💸 Payments', href: '/settings/account/payments', description: 'Manage payment methods', public: false },
				{ title: '👝 Wallets', href: '/settings/account/wallets', description: 'Manage your connected wallets', public: false },
				{ title: '📦 Products', href: '/settings/account/products', description: 'View and manage your products', public: true },
				{ title: '🏮 Stalls', href: '/settings/account/stalls', description: 'Manage your stalls', public: true },
				{ title: '🔌 Network', href: '/settings/account/network', description: 'Manage network settings and connections', public: true },
				{ title: '❌ Delete account', href: '/settings/account/delete', description: 'Permanently delete your account', public: false },
			],
		},
		{
			title: '✨ Circular Economy Community Builder',
			description: 'Configure community contributions preferences',
			value: 'cecb-settings',
			root: '/settings/cecb',
			public: false,
			links: [{ title: '💪 Contribute', href: '/settings/cecb', description: 'Configure community contributions preferences' }],
		},
	]
	return {
		menuItems: menuItems,
	}
}
