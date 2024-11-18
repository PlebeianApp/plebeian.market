export const load = async () => {
	const menuItems = [
		{
			title: '🛍️ Orders',
			description: 'View and manage your orders',
			value: 'orders',
			root: '/dash/order',
			links: [
				{ title: '💰 Sales', href: '/dash/order/sales', description: 'Manage your sales' },
				{ title: '🛍️ Purchases', href: '/dash/order/purchases', description: 'View your purchases' },
			],
		},
		{
			title: 'Messages',
			description: 'View and manage your messages',
			value: 'messages',
			root: '/dash/messages',
			links: [{ title: 'Messages', href: '/dash/messages', description: 'Manage your messages' }],
		},
		// {
		//   title: '📍 Address Book',
		//   description: 'Manage your addresses',
		//   value: 'address-book',
		//   root: '/dash/address-book',
		//   links: [
		// 	{ title: '📍 All Addresses', href: '/dash/address-book/all', description: 'View all your addresses'},
		// 	{ title: '📍 Add New Address', href: '/dash/address-book/add', description: 'Add a new address'},
		//   ],
		// },
		// {
		//   title: '❤️ Wishlist',
		//   description: 'View and manage your wishlist',
		//   value: 'wishlist',
		//   root: '/dash/wishlist',
		//   links: [
		// 	{ title: '❤️ All Wishlist Items', href: '/dash/wishlist/all', description: 'View all your wishlist items'},
		// 	{ title: '❤️ Add to Wishlist', href: '/dash/wishlist/add', description: 'Add a new item to your wishlist'},
		//   ],
		// },
	]
	return {
		menuItems: menuItems,
	}
}
