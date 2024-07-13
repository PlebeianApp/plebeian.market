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
			title: '📊 App Settings',
			description: 'Configure app settings and preferences',
			value: 'app-settings',
			root: '/settings/app',
			links: [
				{ title: '⚙️ App Miscellanea', href: '/settings/app/misc', description: 'Manage app identity and other settings', public: false },
				// { title: 'Instance relay', href: '/settings/app/relay', description: 'Configure instance relay settings' },
				// { title: 'Media services', href: '/settings/app/media', description: 'Manage media services' },
			],
		},
		{
			title: '👥 Account Settings',
			description: 'Manage account settings and preferences',
			value: 'account-settings',
			root: '/settings/account',
			links: [
				{ title: '👤 Profile', href: '/settings/account/profile', description: 'Edit your profile', public: true },
				{ title: '💸 Payments', href: '/settings/account/payments', description: 'Manage payment methods', public: false },
				{ title: '📦 Products', href: '/settings/account/products', description: 'View and manage your products', public: true },
				{ title: '🏮 Stalls', href: '/settings/account/stalls', description: 'Manage your stalls', public: true },
				{
					title: '🔔 Notifications',
					href: '/settings/account/notifications',
					description: 'Configure notification settings and preferences',
					public: false,
				},
				{ title: '🔌 Network', href: '/settings/account/network', description: 'Manage network settings and connections', public: true },
				{ title: '❌ Delete account', href: '/settings/account/delete', description: 'Permanently delete your account', public: false },
			],
		},
		{
			title: '✨ Value 4 value',
			description: 'Configure value 4 value preferences',
			value: 'v4v-settings',
			root: '/settings/v4v',
			links: [{ title: '💪 Contribute', href: '/settings/v4v', description: 'Configure value 4 value preferences', public: true }],
		},
	]
	return {
		menuItems: menuItems,
		activeUser: activeUser,
		userExist,
	}
}
