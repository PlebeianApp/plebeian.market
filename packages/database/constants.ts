export const allowedMimeTypes = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.oasis.opendocument.text',
	'text/plain',
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/bmp',
	'image/tiff',
	'image/svg+xml',
	'audio/mpeg',
	'audio/wav',
	'audio/ogg',
	'video/mp4',
	'video/webm',
	'video/ogg',
	'application/x-msdownload',
	'application/x-shockwave-flash',
	'application/java-archive',
	'application/x-deb',
	'application/x-rpm',
	'application/x-apple-diskimage',
	'application/x-mach-binary',
	'application/x-elf',
	'application/x-executable',
	'application/octet-stream',
	'application/binary',
	'application/zip',
	'application/x-rar-compressed',
	'application/x-tar',
	'application/x-gzip',
	'application/epub+zip',
	'application/x-mobipocket-ebook',
]

export const popularCurrencies = [
	'USD', // United States Dollar
	'EUR', // Euro
	'JPY', // Japanese Yen
	'GBP', // Pound Sterling
	'CHF', // Swiss Franc
	'CNY', // Chinese Renminbi (RMB)
	'AUD', // Australian Dollar
	'CAD', // Canadian Dollar
	'HKD', // Hong Kong Dollar
	'SGD', // Singapore Dollar
	'INR', // Indian Rupee
	'MXN', // Mexican Peso
	'RUB', // Russian Ruble
	'BRL', // Brazilian Real
	'TRY', // Turkish Lira
	'KRW', // South Korean Won
	'ZAR', // South African Rand
	'ARS', // Argentine Peso
	'CLP', // Chilean Peso
	'COP', // Colombian Peso
	'PEN', // Peruvian Sol
	'UYU', // Uruguayan Peso
	'VEF', // Venezuelan Bolivar (note: highly volatile and subject to frequent changes)
	'PHP', // Philippine Peso
	'THB', // Thai Baht
	'IDR', // Indonesian Rupiah
	'MYR', // Malaysian Ringgit
]

export const devUser1 = {
	pk: '86a82cab18b293f53cbaaae8cdcbee3f7ec427fdf9f9c933db77800bb5ef38a0',
	sk: '5c81bffa8303bbd7726d6a5a1170f3ee46de2addabefd6a735845166af01f5c0',
}

export const devUser2 = {
	pk: 'd943e96d62695b318a9c0658a3bd3fafaaf441a069d8bfd04dc9ff39c69cc782',
	sk: '08a475839723c79f2993ad000289670eb737d34bc9d72d43128f898713fc3fb3',
}

export const devUser3 = {
	pk: '2edec1b799cd2f41f70a5ff0edc10d2260a57d62f39072aab4eb8174b7ca912a',
	sk: 'e61ae5a4f505026e3d2b5aeba82c748b6b799346a1e98e266d7252cddb8f502b',
}

export const devUser4 = {
	pk: 'f47121cd783802e6d4879e63233b54aff54e6788ea9ef568cec0259cc60fe286',
	sk: 'beb8f6777d4379ac60b01d91fa84456bb23a2ef6b083f557b9ede311ae1ede53',
}

export const devUser5 = {
	pk: '96c727f4d1ea18a80d03621520ebfe3c9be1387033009a4f5b65959d09222eec',
	sk: 'ee40a2dc441238f241d1728af9507147e9b5ed18c1c61d84876d4f2502c044b3',
}

export enum ProductMetaName {
	IS_USER_FEATURED = 'is_user_featured',
	IS_STALL_FEATURED = 'is_stall_featured',
	IS_GLOBAL_FEATURED = 'is_global_featured',
	IS_DIGITAL = 'is_digital',
	SPEC = 'spec',
}

export enum DigitalProductMetaName {
	LICENSE_KEY = 'license_key',
	DOWNLOAD_LINK = 'download_link',
	MIME_TYPE = 'mime_type',
	SHA256_HASH = 'sha256_hash',
}

export enum GeneralMetaName {
	COMMENTS = 'comments',
}

export const productMetaTypes = {
	[ProductMetaName.IS_USER_FEATURED]: { dataType: 'boolean' },
	[ProductMetaName.IS_STALL_FEATURED]: { dataType: 'boolean' },
	[ProductMetaName.IS_GLOBAL_FEATURED]: { dataType: 'boolean' },
	[ProductMetaName.IS_DIGITAL]: { dataType: 'boolean' },
	[ProductMetaName.SPEC]: { dataType: 'text' },
} as const

export const digitalProductMetaTypes = {
	[DigitalProductMetaName.LICENSE_KEY]: { dataType: 'text' },
	[DigitalProductMetaName.DOWNLOAD_LINK]: { dataType: 'text' },
	[DigitalProductMetaName.MIME_TYPE]: { dataType: 'text' },
	[DigitalProductMetaName.SHA256_HASH]: { dataType: 'text' },
} as const

export const generalMetaTypes = {
	[GeneralMetaName.COMMENTS]: { dataType: 'text' },
} as const

export const allowedMetaNames = [
	...Object.values(ProductMetaName),
	...Object.values(DigitalProductMetaName),
	...Object.values(GeneralMetaName),
]

export const metaScopes = ['products', 'users', 'orders']
export const metaDataTypes = ['text', 'boolean', 'integer', 'numeric']

export enum USER_ROLES {
	ADMIN = 'admin',
	EDITOR = 'editor',
	PLEB = 'pleb',
}

export enum USER_TRUST_LEVEL {
	TRUST = 'trust',
	REASONABLE = 'reasonable',
	PARANOID = 'paranoid',
}

export const paymentDetailsMethod = ['ln', 'on-chain', 'cashu', 'other']

export const productImagesType = ['gallery', 'thumbnail'] as const
export const productTypes = ['simple', 'variable', 'variation']

export const auctionStatus = ['active', 'inactive', 'ended', 'canceled']
export const bidStatus = ['accepted', 'rejected', 'pending', 'winner']

export const orderStatus = ['confirmed', 'pending', 'shipped', 'completed', 'canceled']
export const invoiceStatus = ['pending', 'paid', 'canceled', 'refunded']
