export const CURRENCIES = [
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
] as const

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

export type ObjectValues<T> = T[keyof T]

export const META_SCOPES = {
	PRODUCTS: 'products',
	USERS: 'users',
	ORDERS: 'orders',
	APP_SETTINGS: 'app_settings',
} as const

export type MetaScopes = ObjectValues<typeof META_SCOPES>

export const META_DATA_TYPES = {
	TEXT: 'text',
	BOOLEAN: 'boolean',
	INTEGER: 'integer',
	NUMERIC: 'numeric',
} as const

export type MetaDataTypes = ObjectValues<typeof META_DATA_TYPES>

interface MetaInterface {
	value: string
	dataType: MetaDataTypes
}

export const PRODUCT_META: Record<string, MetaInterface> = {
	IS_USER_FEATURED: { value: 'is_user_featured', dataType: 'boolean' },
	IS_STALL_FEATURED: { value: 'is_stall_featured', dataType: 'boolean' },
	IS_GLOBAL_FEATURED: { value: 'is_global_featured', dataType: 'boolean' },
	IS_DIGITAL: { value: 'is_digital', dataType: 'boolean' },
	SPEC: { value: 'spec', dataType: 'text' },
} as const

export type ProductMetaName = ObjectValues<typeof PRODUCT_META>

export const DIGITAL_PRODUCT_META: Record<string, MetaInterface> = {
	LICENSE_KEY: { value: 'license_key', dataType: 'text' },
	DOWNLOAD_LINK: { value: 'download_link', dataType: 'text' },
	MIME_TYPE: { value: 'mime_type', dataType: 'text' },
	SHA256_HASH: { value: 'sha256_hash', dataType: 'text' },
} as const

export type DigitalProductMetaName = ObjectValues<typeof DIGITAL_PRODUCT_META>

export const APP_SETTINGS_META: Record<string, MetaInterface> = {
	BLOSSOM_SERVER: { value: 'blossom_server', dataType: 'text' },
	NIP96_SERVER: { value: 'nip96_server', dataType: 'text' },
} as const

export type AppSettingsMetaName = ObjectValues<typeof APP_SETTINGS_META>

export const GENERAL_META: Record<string, MetaInterface> = {
	COMMENTS: { value: 'comments', dataType: 'text' },
} as const

export type GeneralMetaName = ObjectValues<typeof GENERAL_META>

export const META_NAMES = Object.fromEntries([
	...Object.entries({ ...PRODUCT_META, ...DIGITAL_PRODUCT_META, ...APP_SETTINGS_META, ...GENERAL_META }).map(([key, { value }]) => [
		key,
		value,
	]),
]) as Record<string, string>

export type MetaName = ObjectValues<typeof META_NAMES>

export const USER_ROLES = {
	ADMIN: 'admin',
	EDITOR: 'editor',
	PLEB: 'pleb',
} as const

export type UserRoles = ObjectValues<typeof USER_ROLES>

export const USER_TRUST_LEVEL = {
	TRUST: 'trust',
	REASONABLE: 'reasonable',
	PARANOID: 'paranoid',
} as const

export type UserTrustLevel = ObjectValues<typeof USER_TRUST_LEVEL>

export const PAYMENT_DETAILS_METHOD = {
	LIGHTNING_NETWORK: 'ln',
	ON_CHAIN: 'on-chain',
	CASHU: 'cashu',
	OTHER: 'other',
} as const

export type PaymentDetailsMethod = ObjectValues<typeof PAYMENT_DETAILS_METHOD>

export const PRODUCT_IMAGES_TYPE = {
	GALLERY: 'gallery',
	THUMBNAIL: 'thumbnail',
} as const

export type ProductImagesType = ObjectValues<typeof PRODUCT_IMAGES_TYPE>

export const PRODUCT_TYPES = {
	SIMPLE: 'simple',
	VARIABLE: 'variable',
	VARIATION: 'variation',
} as const

export type ProductTypes = ObjectValues<typeof PRODUCT_TYPES>

export const AUCTION_STATUS = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	ENDED: 'ended',
	CANCELED: 'canceled',
} as const

export type AuctionStatus = ObjectValues<typeof AUCTION_STATUS>

export const BID_STATUS = {
	ACCEPTED: 'accepted',
	REJECTED: 'rejected',
	PENDING: 'pending',
	WINNER: 'winner',
} as const

export type BidStatus = ObjectValues<typeof BID_STATUS>

export const ORDER_STATUS = {
	CONFIRMED: 'confirmed',
	PENDING: 'pending',
	SHIPPED: 'shipped',
	COMPLETED: 'completed',
	CANCELED: 'canceled',
} as const

export type OrderStatus = ObjectValues<typeof ORDER_STATUS>

export const INVOICE_STATUS = {
	PENDING: 'pending',
	PAID: 'paid',
	CANCELED: 'canceled',
	REFUNDED: 'refunded',
} as const

export type InvoiceStatus = ObjectValues<typeof INVOICE_STATUS>
