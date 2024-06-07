import { createToken } from '$lib/apiUtils'

export const load = async ({ url }) => {
	const token = await createToken(url.href, 'GET')
	const menuItems = [
		{
			title: 'App Settings',
			description: 'Configure app settings and preferences',
			value: 'app-settings',
			root: '/settings/app',
			links: [
				{ title: 'App Identity', href: '/settings/app/identity', description: 'Manage app identity' },
				{ title: 'Allow user registration', href: '/settings/app/registration', description: 'Enable or disable user registration' },
				{ title: 'Default currency', href: '/settings/app/currency', description: 'Set the default currency for transactions' },
				{ title: 'Instance relay', href: '/settings/app/relay', description: 'Configure instance relay settings' },
				{ title: 'Media services', href: '/settings/app/media', description: 'Manage media services' },
			],
		},
		{
			title: 'Account Settings',
			description: 'Manage account settings and preferences',
			value: 'account-settings',
			root: '/settings/account',
			links: [
				{ title: 'Profile', href: '/settings/account/profile', description: 'Edit your profile' },
				{ title: 'Payments', href: '/settings/account/payments', description: 'Manage payment methods' },
				{ title: 'Products', href: '/settings/account/products', description: 'View and manage your products' },
				{ title: 'Stalls', href: '/settings/account/stalls', description: 'Manage your stalls' },
				{ title: 'Notifications', href: '/settings/account/notifications', description: 'Configure notification settings and preferences' },
				{ title: 'Network', href: '/settings/account/network', description: 'Manage network settings and connections' },
				{ title: 'Delete account', href: '/settings/account/delete', description: 'Permanently delete your account' },
			],
		},
		{
			title: 'Value 4 value',
			description: 'Configure value 4 value preferences',
			value: 'v4v-settings',
			root: '/settings/v4v',
			links: [{ title: 'Contribute', href: '/settings/v4v', description: 'Configure value 4 value preferences' }],
		},
	]
	return {
		menuItems: menuItems,
		token: token,
	}
}
