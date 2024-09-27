export const CURRENCIES = [
	'SATS', // Satoshis
	'BTC', // Bitcoin
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

interface MetaInterface<T> {
	value: T
	dataType: MetaDataTypes
}

export const PRODUCT_META: Record<
	string,
	MetaInterface<'is_user_featured' | 'is_stall_featured' | 'is_global_featured' | 'is_digital' | 'spec'>
> = {
	IS_USER_FEATURED: { value: 'is_user_featured', dataType: 'boolean' },
	IS_STALL_FEATURED: { value: 'is_stall_featured', dataType: 'boolean' },
	IS_GLOBAL_FEATURED: { value: 'is_global_featured', dataType: 'boolean' },
	IS_DIGITAL: { value: 'is_digital', dataType: 'boolean' },
	SPEC: { value: 'spec', dataType: 'text' },
} as const

export type ProductMetaName = ObjectValues<typeof PRODUCT_META>

export const DIGITAL_PRODUCT_META: Record<string, MetaInterface<'license_key' | 'download_link' | 'mime_type' | 'sha256_hash'>> = {
	LICENSE_KEY: { value: 'license_key', dataType: 'text' },
	DOWNLOAD_LINK: { value: 'download_link', dataType: 'text' },
	MIME_TYPE: { value: 'mime_type', dataType: 'text' },
	SHA256_HASH: { value: 'sha256_hash', dataType: 'text' },
} as const

export type DigitalProductMetaName = ObjectValues<typeof DIGITAL_PRODUCT_META>

export const APP_SETTINGS_META: Record<string, MetaInterface<'blossom_server' | 'nip96_server'>> = {
	BLOSSOM_SERVER: { value: 'blossom_server', dataType: 'text' },
	NIP96_SERVER: { value: 'nip96_server', dataType: 'text' },
} as const

export type AppSettingsMetaName = ObjectValues<typeof APP_SETTINGS_META>

export const USER_META: Record<string, MetaInterface<'trust_lvl' | 'role' | 'v4v_share' | 'wallet_details'>> = {
	TRUST_LVL: { value: 'trust_lvl', dataType: 'text' },
	ROLE: { value: 'role', dataType: 'text' },
	V4V_SHARE: { value: 'v4v_share', dataType: 'numeric' },
	WALLET_DETAILS: { value: 'wallet_details', dataType: 'text' },
} as const

export type UserMetaName = ObjectValues<typeof USER_META>

export const GENERAL_META: Record<string, MetaInterface<'comments'>> = {
	COMMENTS: { value: 'comments', dataType: 'text' },
} as const

export type GeneralMetaName = ObjectValues<typeof GENERAL_META>

export const META_NAMES = Object.fromEntries([
	...Object.entries({ ...PRODUCT_META, ...DIGITAL_PRODUCT_META, ...APP_SETTINGS_META, ...USER_META, ...GENERAL_META }).map(
		([key, { value }]) => [key, value],
	),
]) as Record<string, string>

export type MetaName = ObjectValues<typeof META_NAMES>

export const USER_ROLES = {
	ADMIN: 'admin',
	EDITOR: 'editor',
	PLEB: 'pleb',
} as const

export type UserRoles = ObjectValues<typeof USER_ROLES> | null

export const USER_TRUST_LEVEL = {
	TRUST: 'trust',
	REASONABLE: 'reasonable',
	PARANOID: 'paranoid',
} as const

export type UserTrustLevel = ObjectValues<typeof USER_TRUST_LEVEL> | null

export const WALLET_TYPE = {
	NWC: 'nwc',
} as const

export type WalletType = ObjectValues<typeof WALLET_TYPE> | null

export const PAYMENT_DETAILS_METHOD = {
	LIGHTNING_NETWORK: 'ln',
	ON_CHAIN: 'on-chain',
	// CASHU: 'cashu',
	// OTHER: 'other',
} as const

export type PaymentDetailsMethod = ObjectValues<typeof PAYMENT_DETAILS_METHOD>

export const PRODUCT_IMAGES_TYPE = {
	GALLERY: 'gallery',
	THUMBNAIL: 'thumbnail',
} as const

export type ProductImagesType = ObjectValues<typeof PRODUCT_IMAGES_TYPE>

export const INVOICE_TYPE = {
	V4V: 'v4v',
	MERCHANT: 'merchant',
} as const

export type InvoiceType = ObjectValues<typeof INVOICE_TYPE>

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
	PENDING: 'pending',
	PARTIALLY_PAID: 'partiallyPaid',
	PAID: 'paid',
	CONFIRMED: 'confirmed',
	SHIPPED: 'shipped',
	COMPLETED: 'completed',
	CANCELED: 'canceled',
} as const

export type OrderStatus = ObjectValues<typeof ORDER_STATUS>

export interface OrderMessageItem {
	product_id: string
	quantity: number
}

export interface OrderMessage {
	id: string
	createdAt?: number
	updatedAt?: number
	type: number
	sellerUserId: string
	buyerUserId: string
	shippingId: string
	stallId: string
	status: OrderStatus
	address: string
	zip: string
	city: string
	country: string
	region?: string
	contactName: string
	contactPhone?: string
	contactEmail?: string
	observations?: string
	items: OrderMessageItem[]
}

export interface PaymentOption {
	type: string
	link: string | null
	paymentRequest: string | null
}

export interface PaymentRequestMessage {
	id: string
	payment_id: string
	type: number
	message: string
	payment_options: PaymentOption[]
}

export const INVOICE_STATUS = {
	PENDING: 'pending',
	PAID: 'paid',
	EXPIRED: 'expired',
	CANCELED: 'canceled',
	REFUNDED: 'refunded',
} as const

export type InvoiceStatus = ObjectValues<typeof INVOICE_STATUS>

// ISO 3166 Country codes

export const COUNTRIES_ISO = {
	AD: {
		languages: ['ca'],
		name: 'Andorra',
		original: 'Andorra',
		iso3: 'AND',
	},
	AE: {
		languages: ['ar'],
		name: 'United Arab Emirates',
		original: 'دولة الإمارات العربية المتحدة',
		iso3: 'ARE',
	},
	AF: {
		languages: ['ps', 'uz', 'tk'],
		name: 'Afghanistan',
		original: 'افغانستان',
		iso3: 'AFG',
	},
	AG: {
		languages: ['en'],
		name: 'Antigua and Barbuda',
		original: 'Antigua and Barbuda',
		iso3: 'ATG',
	},
	AI: {
		languages: ['en'],
		name: 'Anguilla',
		original: 'Anguilla',
		iso3: 'AIA',
	},
	AL: {
		languages: ['sq'],
		name: 'Albania',
		original: 'Shqipëria',
		iso3: 'ALB',
	},
	AM: {
		languages: ['hy', 'ru'],
		name: 'Armenia',
		original: 'Հայաստան',
		iso3: 'ARM',
	},
	AO: {
		languages: ['pt'],
		name: 'Angola',
		original: 'Angola',
		iso3: 'AGO',
	},
	AQ: {
		languages: [],
		name: 'Antarctica',
		original: 'Antarctica',
		iso3: 'ATA',
	},
	AR: {
		languages: ['es', 'gn'],
		name: 'Argentina',
		original: 'Argentina',
		iso3: 'ARG',
	},
	AS: {
		languages: ['en', 'sm'],
		name: 'American Samoa',
		original: 'American Samoa',
		iso3: 'ASM',
	},
	AT: {
		languages: ['de'],
		name: 'Austria',
		original: 'Österreich',
		iso3: 'AUT',
	},
	AU: {
		languages: ['en'],
		name: 'Australia',
		original: 'Australia',
		iso3: 'AUS',
	},
	AW: {
		languages: ['nl', 'pa'],
		name: 'Aruba',
		original: 'Aruba',
		iso3: 'ABW',
	},
	AX: {
		languages: ['sv'],
		name: 'Aland',
		original: 'Åland',
		iso3: 'ALA',
	},
	AZ: {
		languages: ['az'],
		name: 'Azerbaijan',
		original: 'Azərbaycan',
		iso3: 'AZE',
	},
	BA: {
		languages: ['bs', 'hr', 'sr'],
		name: 'Bosnia and Herzegovina',
		original: 'Bosna i Hercegovina',
		iso3: 'BIH',
	},
	BB: {
		languages: ['en'],
		name: 'Barbados',
		original: 'Barbados',
		iso3: 'BRB',
	},
	BD: {
		languages: ['bn'],
		name: 'Bangladesh',
		original: 'Bangladesh',
		iso3: 'BGD',
	},
	BE: {
		languages: ['nl', 'fr', 'de'],
		name: 'Belgium',
		original: 'België',
		iso3: 'BEL',
	},
	BF: {
		languages: ['fr', 'ff'],
		name: 'Burkina Faso',
		original: 'Burkina Faso',
		iso3: 'BFA',
	},
	BG: {
		languages: ['bg'],
		name: 'Bulgaria',
		original: 'България',
		iso3: 'BGR',
	},
	BH: {
		languages: ['ar'],
		name: 'Bahrain',
		original: 'البحرين',
		iso3: 'BHR',
	},
	BI: {
		languages: ['fr', 'rn'],
		name: 'Burundi',
		original: 'Burundi',
		iso3: 'BDI',
	},
	BJ: {
		languages: ['fr'],
		name: 'Benin',
		original: 'Bénin',
		iso3: 'BEN',
	},
	BL: {
		languages: ['fr'],
		name: 'Saint Barthelemy',
		original: 'Saint-Barthélemy',
		iso3: 'BLM',
	},
	BM: {
		languages: ['en'],
		name: 'Bermuda',
		original: 'Bermuda',
		iso3: 'BMU',
	},
	BN: {
		languages: ['ms'],
		name: 'Brunei',
		original: 'Negara Brunei Darussalam',
		iso3: 'BRN',
	},
	BO: {
		languages: ['es', 'ay', 'qu'],
		name: 'Bolivia',
		original: 'Bolivia',
		iso3: 'BOL',
	},
	BQ: {
		languages: ['nl'],
		name: 'Bonaire',
		original: 'Bonaire',
		iso3: 'BES',
	},
	BR: {
		languages: ['pt'],
		name: 'Brazil',
		original: 'Brasil',
		iso3: 'BRA',
	},
	BS: {
		languages: ['en'],
		name: 'Bahamas',
		original: 'Bahamas',
		iso3: 'BHS',
	},
	BT: {
		languages: ['dz'],
		name: 'Bhutan',
		original: 'ʼbrug-yul',
		iso3: 'BTN',
	},
	BV: {
		languages: ['no', 'nb', 'nn'],
		name: 'Bouvet Island',
		original: 'Bouvetøya',
		iso3: 'BVT',
	},
	BW: {
		languages: ['en', 'tn'],
		name: 'Botswana',
		original: 'Botswana',
		iso3: 'BWA',
	},
	BY: {
		languages: ['be', 'ru'],
		name: 'Belarus',
		original: 'Беларусь',
		iso3: 'BLR',
	},
	BZ: {
		languages: ['en', 'es'],
		name: 'Belize',
		original: 'Belize',
		iso3: 'BLZ',
	},
	CA: {
		languages: ['en', 'fr'],
		name: 'Canada',
		original: 'Canada',
		iso3: 'CAN',
	},
	CC: {
		languages: ['en'],
		name: 'Cocos (Keeling) Islands',
		original: 'Cocos (Keeling) Islands',
		iso3: 'CCK',
	},
	CD: {
		languages: ['fr', 'ln', 'kg', 'sw', 'lu'],
		name: 'Democratic Republic of the Congo',
		original: 'République démocratique du Congo',
		iso3: 'COD',
	},
	CF: {
		languages: ['fr', 'sg'],
		name: 'Central African Republic',
		original: 'Ködörösêse tî Bêafrîka',
		iso3: 'CAF',
	},
	CG: {
		languages: ['fr', 'ln'],
		name: 'Republic of the Congo',
		original: 'République du Congo',
		iso3: 'COG',
	},
	CH: {
		languages: ['de', 'fr', 'it'],
		name: 'Switzerland',
		original: 'Schweiz',
		iso3: 'CHE',
	},
	CI: {
		languages: ['fr'],
		name: 'Ivory Coast',
		original: "Côte d'Ivoire",
		iso3: 'CIV',
	},
	CK: {
		languages: ['en'],
		name: 'Cook Islands',
		original: 'Cook Islands',
		iso3: 'COK',
	},
	CL: {
		languages: ['es'],
		name: 'Chile',
		original: 'Chile',
		iso3: 'CHL',
	},
	CM: {
		languages: ['en', 'fr'],
		name: 'Cameroon',
		original: 'Cameroon',
		iso3: 'CMR',
	},
	CN: {
		languages: ['zh'],
		name: 'China',
		original: '中国',
		iso3: 'CHN',
	},
	CO: {
		languages: ['es'],
		name: 'Colombia',
		original: 'Colombia',
		iso3: 'COL',
	},
	CR: {
		languages: ['es'],
		name: 'Costa Rica',
		original: 'Costa Rica',
		iso3: 'CRI',
	},
	CU: {
		languages: ['es'],
		name: 'Cuba',
		original: 'Cuba',
		iso3: 'CUB',
	},
	CV: {
		languages: ['pt'],
		name: 'Cape Verde',
		original: 'Cabo Verde',
		iso3: 'CPV',
	},
	CW: {
		languages: ['nl', 'pa', 'en'],
		name: 'Curacao',
		original: 'Curaçao',
		iso3: 'CUW',
	},
	CX: {
		languages: ['en'],
		name: 'Christmas Island',
		original: 'Christmas Island',
		iso3: 'CXR',
	},
	CY: {
		languages: ['el', 'tr', 'hy'],
		name: 'Cyprus',
		original: 'Κύπρος',
		iso3: 'CYP',
	},
	CZ: {
		languages: ['cs'],
		name: 'Czech Republic',
		original: 'Česká republika',
		iso3: 'CZE',
	},
	DE: {
		languages: ['de'],
		name: 'Germany',
		original: 'Deutschland',
		iso3: 'DEU',
	},
	DJ: {
		languages: ['fr', 'ar'],
		name: 'Djibouti',
		original: 'Djibouti',
		iso3: 'DJI',
	},
	DK: {
		languages: ['da'],
		name: 'Denmark',
		original: 'Danmark',
		iso3: 'DNK',
	},
	DM: {
		languages: ['en'],
		name: 'Dominica',
		original: 'Dominica',
		iso3: 'DMA',
	},
	DO: {
		languages: ['es'],
		name: 'Dominican Republic',
		original: 'República Dominicana',
		iso3: 'DOM',
	},
	DZ: {
		languages: ['ar'],
		name: 'Algeria',
		original: 'الجزائر',
		iso3: 'DZA',
	},
	EC: {
		languages: ['es'],
		name: 'Ecuador',
		original: 'Ecuador',
		iso3: 'ECU',
	},
	EE: {
		languages: ['et'],
		name: 'Estonia',
		original: 'Eesti',
		iso3: 'EST',
	},
	EG: {
		languages: ['ar'],
		name: 'Egypt',
		original: 'مصر�',
		iso3: 'EGY',
	},
	EH: {
		languages: ['es'],
		name: 'Western Sahara',
		original: 'الصحراء الغربية',
		iso3: 'ESH',
	},
	ER: {
		languages: ['ti', 'ar', 'en'],
		name: 'Eritrea',
		original: 'ኤርትራ',
		iso3: 'ERI',
	},
	ES: {
		languages: ['es', 'eu', 'ca', 'gl', 'oc'],
		name: 'Spain',
		original: 'España',
		iso3: 'ESP',
	},
	ET: {
		languages: ['am'],
		name: 'Ethiopia',
		original: 'ኢትዮጵያ',
		iso3: 'ETH',
	},
	FI: {
		languages: ['fi', 'sv'],
		name: 'Finland',
		original: 'Suomi',
		iso3: 'FIN',
	},
	FJ: {
		languages: ['en', 'fj', 'hi', 'ur'],
		name: 'Fiji',
		original: 'Fiji',
		iso3: 'FJI',
	},
	FK: {
		languages: ['en'],
		name: 'Falkland Islands',
		original: 'Falkland Islands',
		iso3: 'FLK',
	},
	FM: {
		languages: ['en'],
		name: 'Micronesia',
		original: 'Micronesia',
		iso3: 'FSM',
	},
	FO: {
		languages: ['fo'],
		name: 'Faroe Islands',
		original: 'Føroyar',
		iso3: 'FRO',
	},
	FR: {
		languages: ['fr'],
		name: 'France',
		original: 'France',
		iso3: 'FRA',
	},
	GA: {
		languages: ['fr'],
		name: 'Gabon',
		original: 'Gabon',
		iso3: 'GAB',
	},
	GB: {
		languages: ['en'],
		name: 'United Kingdom',
		original: 'United Kingdom',
		iso3: 'GBR',
	},
	GD: {
		languages: ['en'],
		name: 'Grenada',
		original: 'Grenada',
		iso3: 'GRD',
	},
	GE: {
		languages: ['ka'],
		name: 'Georgia',
		original: 'საქართველო',
		iso3: 'GEO',
	},
	GF: {
		languages: ['fr'],
		name: 'French Guiana',
		original: 'Guyane française',
		iso3: 'GUF',
	},
	GG: {
		languages: ['en', 'fr'],
		name: 'Guernsey',
		original: 'Guernsey',
		iso3: 'GGY',
	},
	GH: {
		languages: ['en'],
		name: 'Ghana',
		original: 'Ghana',
		iso3: 'GHA',
	},
	GI: {
		languages: ['en'],
		name: 'Gibraltar',
		original: 'Gibraltar',
		iso3: 'GIB',
	},
	GL: {
		languages: ['kl'],
		name: 'Greenland',
		original: 'Kalaallit Nunaat',
		iso3: 'GRL',
	},
	GM: {
		languages: ['en'],
		name: 'Gambia',
		original: 'Gambia',
		iso3: 'GMB',
	},
	GN: {
		languages: ['fr', 'ff'],
		name: 'Guinea',
		original: 'Guinée',
		iso3: 'GIN',
	},
	GP: {
		languages: ['fr'],
		name: 'Guadeloupe',
		original: 'Guadeloupe',
		iso3: 'GLP',
	},
	GQ: {
		languages: ['es', 'fr'],
		name: 'Equatorial Guinea',
		original: 'Guinea Ecuatorial',
		iso3: 'GNQ',
	},
	GR: {
		languages: ['el'],
		name: 'Greece',
		original: 'Ελλάδα',
		iso3: 'GRC',
	},
	GS: {
		languages: ['en'],
		name: 'South Georgia and the South Sandwich Islands',
		original: 'South Georgia',
		iso3: 'SGS',
	},
	GT: {
		languages: ['es'],
		name: 'Guatemala',
		original: 'Guatemala',
		iso3: 'GTM',
	},
	GU: {
		languages: ['en', 'ch', 'es'],
		name: 'Guam',
		original: 'Guam',
		iso3: 'GUM',
	},
	GW: {
		languages: ['pt'],
		name: 'Guinea-Bissau',
		original: 'Guiné-Bissau',
		iso3: 'GNB',
	},
	GY: {
		languages: ['en'],
		name: 'Guyana',
		original: 'Guyana',
		iso3: 'GUY',
	},
	HK: {
		languages: ['zh', 'en'],
		name: 'Hong Kong',
		original: '香港',
		iso3: 'HKG',
	},
	HM: {
		languages: ['en'],
		name: 'Heard Island and McDonald Islands',
		original: 'Heard Island and McDonald Islands',
		iso3: 'HMD',
	},
	HN: {
		languages: ['es'],
		name: 'Honduras',
		original: 'Honduras',
		iso3: 'HND',
	},
	HR: {
		languages: ['hr'],
		name: 'Croatia',
		original: 'Hrvatska',
		iso3: 'HRV',
	},
	HT: {
		languages: ['fr', 'ht'],
		name: 'Haiti',
		original: 'Haïti',
		iso3: 'HTI',
	},
	HU: {
		languages: ['hu'],
		name: 'Hungary',
		original: 'Magyarország',
		iso3: 'HUN',
	},
	ID: {
		languages: ['id'],
		name: 'Indonesia',
		original: 'Indonesia',
		iso3: 'IDN',
	},
	IE: {
		languages: ['ga', 'en'],
		name: 'Ireland',
		original: 'Éire',
		iso3: 'IRL',
	},
	IL: {
		languages: ['he', 'ar'],
		name: 'Israel',
		original: 'ישראל',
		iso3: 'ISR',
	},
	IM: {
		languages: ['en', 'gv'],
		name: 'Isle of Man',
		original: 'Isle of Man',
		iso3: 'IMN',
	},
	IN: {
		languages: ['hi', 'en'],
		name: 'India',
		original: 'भरत',
		iso3: 'IND',
	},
	IO: {
		languages: ['en'],
		name: 'British Indian Ocean Territory',
		original: 'British Indian Ocean Territory',
		iso3: 'IOT',
	},
	IQ: {
		languages: ['ar', 'ku'],
		name: 'Iraq',
		original: 'العراق',
		iso3: 'IRQ',
	},
	IR: {
		languages: ['fa'],
		name: 'Iran',
		original: 'ایران',
		iso3: 'IRN',
	},
	IS: {
		languages: ['is'],
		name: 'Iceland',
		original: 'Ísland',
		iso3: 'ISL',
	},
	IT: {
		languages: ['it'],
		name: 'Italy',
		original: 'Italia',
		iso3: 'ITA',
	},
	JE: {
		languages: ['en', 'fr'],
		name: 'Jersey',
		original: 'Jersey',
		iso3: 'JEY',
	},
	JM: {
		languages: ['en'],
		name: 'Jamaica',
		original: 'Jamaica',
		iso3: 'JAM',
	},
	JO: {
		languages: ['ar'],
		name: 'Jordan',
		original: 'الأردن',
		iso3: 'JOR',
	},
	JP: {
		languages: ['ja'],
		name: 'Japan',
		original: '日本',
		iso3: 'JPN',
	},
	KE: {
		languages: ['en', 'sw'],
		name: 'Kenya',
		original: 'Kenya',
		iso3: 'KEN',
	},
	KG: {
		languages: ['ky', 'ru'],
		name: 'Kyrgyzstan',
		original: 'Кыргызстан',
		iso3: 'KGZ',
	},
	KH: {
		languages: ['km'],
		name: 'Cambodia',
		original: 'Kâmpŭchéa',
		iso3: 'KHM',
	},
	KI: {
		languages: ['en'],
		name: 'Kiribati',
		original: 'Kiribati',
		iso3: 'KIR',
	},
	KM: {
		languages: ['ar', 'fr'],
		name: 'Comoros',
		original: 'Komori',
		iso3: 'COM',
	},
	KN: {
		languages: ['en'],
		name: 'Saint Kitts and Nevis',
		original: 'Saint Kitts and Nevis',
		iso3: 'KNA',
	},
	KP: {
		languages: ['ko'],
		name: 'North Korea',
		original: '북한',
		iso3: 'PRK',
	},
	KR: {
		languages: ['ko'],
		name: 'South Korea',
		original: '대한민국',
		iso3: 'KOR',
	},
	KW: {
		languages: ['ar'],
		name: 'Kuwait',
		original: 'الكويت',
		iso3: 'KWT',
	},
	KY: {
		languages: ['en'],
		name: 'Cayman Islands',
		original: 'Cayman Islands',
		iso3: 'CYM',
	},
	KZ: {
		languages: ['kk', 'ru'],
		name: 'Kazakhstan',
		original: 'Қазақстан',
		iso3: 'KAZ',
	},
	LA: {
		languages: ['lo'],
		name: 'Laos',
		original: 'ສປປລາວ',
		iso3: 'LAO',
	},
	LB: {
		languages: ['ar', 'fr'],
		name: 'Lebanon',
		original: 'لبنان',
		iso3: 'LBN',
	},
	LC: {
		languages: ['en'],
		name: 'Saint Lucia',
		original: 'Saint Lucia',
		iso3: 'LCA',
	},
	LI: {
		languages: ['de'],
		name: 'Liechtenstein',
		original: 'Liechtenstein',
		iso3: 'LIE',
	},
	LK: {
		languages: ['si', 'ta'],
		name: 'Sri Lanka',
		original: 'śrī laṃkāva',
		iso3: 'LKA',
	},
	LR: {
		languages: ['en'],
		name: 'Liberia',
		original: 'Liberia',
		iso3: 'LBR',
	},
	LS: {
		languages: ['en', 'st'],
		name: 'Lesotho',
		original: 'Lesotho',
		iso3: 'LSO',
	},
	LT: {
		languages: ['lt'],
		name: 'Lithuania',
		original: 'Lietuva',
		iso3: 'LTU',
	},
	LU: {
		languages: ['fr', 'de', 'lb'],
		name: 'Luxembourg',
		original: 'Luxembourg',
		iso3: 'LUX',
	},
	LV: {
		languages: ['lv'],
		name: 'Latvia',
		original: 'Latvija',
		iso3: 'LVA',
	},
	LY: {
		languages: ['ar'],
		name: 'Libya',
		original: 'ليبيا',
		iso3: 'LBY',
	},
	MA: {
		languages: ['ar'],
		name: 'Morocco',
		original: 'المغرب',
		iso3: 'MAR',
	},
	MC: {
		languages: ['fr'],
		name: 'Monaco',
		original: 'Monaco',
		iso3: 'MCO',
	},
	MD: {
		languages: ['ro'],
		name: 'Moldova',
		original: 'Moldova',
		iso3: 'MDA',
	},
	ME: {
		languages: ['sr', 'bs', 'sq', 'hr'],
		name: 'Montenegro',
		original: 'Црна Гора',
		iso3: 'MNE',
	},
	MF: {
		languages: ['en', 'fr', 'nl'],
		name: 'Saint Martin',
		original: 'Saint-Martin',
		iso3: 'MAF',
	},
	MG: {
		languages: ['fr', 'mg'],
		name: 'Madagascar',
		original: 'Madagasikara',
		iso3: 'MDG',
	},
	MH: {
		languages: ['en', 'mh'],
		name: 'Marshall Islands',
		original: 'Majeļ',
		iso3: 'MHL',
	},
	MK: {
		languages: ['mk'],
		name: 'North Macedonia',
		original: 'Северна Македонија',
		iso3: 'MKD',
	},
	ML: {
		languages: ['fr'],
		name: 'Mali',
		original: 'Mali',
		iso3: 'MLI',
	},
	MM: {
		languages: ['my'],
		name: 'Myanmar (Burma)',
		original: 'မနမာ',
		iso3: 'MMR',
	},
	MN: {
		languages: ['mn'],
		name: 'Mongolia',
		original: 'Монгол улс',
		iso3: 'MNG',
	},
	MO: {
		languages: ['zh', 'pt'],
		name: 'Macao',
		original: '澳門',
		iso3: 'MAC',
	},
	MP: {
		languages: ['en', 'ch'],
		name: 'Northern Mariana Islands',
		original: 'Northern Mariana Islands',
		iso3: 'MNP',
	},
	MQ: {
		languages: ['fr'],
		name: 'Martinique',
		original: 'Martinique',
		iso3: 'MTQ',
	},
	MR: {
		languages: ['ar'],
		name: 'Mauritania',
		original: 'موريتانيا',
		iso3: 'MRT',
	},
	MS: {
		languages: ['en'],
		name: 'Montserrat',
		original: 'Montserrat',
		iso3: 'MSR',
	},
	MT: {
		languages: ['mt', 'en'],
		name: 'Malta',
		original: 'Malta',
		iso3: 'MLT',
	},
	MU: {
		languages: ['en'],
		name: 'Mauritius',
		original: 'Maurice',
		iso3: 'MUS',
	},
	MV: {
		languages: ['dv'],
		name: 'Maldives',
		original: 'Maldives',
		iso3: 'MDV',
	},
	MW: {
		languages: ['en', 'ny'],
		name: 'Malawi',
		original: 'Malawi',
		iso3: 'MWI',
	},
	MX: {
		languages: ['es'],
		name: 'Mexico',
		original: 'México',
		iso3: 'MEX',
	},
	MY: {
		languages: ['ms'],
		name: 'Malaysia',
		original: 'Malaysia',
		iso3: 'MYS',
	},
	MZ: {
		languages: ['pt'],
		name: 'Mozambique',
		original: 'Moçambique',
		iso3: 'MOZ',
	},
	NA: {
		languages: ['en', 'af'],
		name: 'Namibia',
		original: 'Namibia',
		iso3: 'NAM',
	},
	NC: {
		languages: ['fr'],
		name: 'New Caledonia',
		original: 'Nouvelle-Calédonie',
		iso3: 'NCL',
	},
	NE: {
		languages: ['fr'],
		name: 'Niger',
		original: 'Niger',
		iso3: 'NER',
	},
	NF: {
		languages: ['en'],
		name: 'Norfolk Island',
		original: 'Norfolk Island',
		iso3: 'NFK',
	},
	NG: {
		languages: ['en'],
		name: 'Nigeria',
		original: 'Nigeria',
		iso3: 'NGA',
	},
	NI: {
		languages: ['es'],
		name: 'Nicaragua',
		original: 'Nicaragua',
		iso3: 'NIC',
	},
	NL: {
		languages: ['nl'],
		name: 'Netherlands',
		original: 'Nederland',
		iso3: 'NLD',
	},
	NO: {
		languages: ['no', 'nb', 'nn'],
		name: 'Norway',
		original: 'Norge',
		iso3: 'NOR',
	},
	NP: {
		languages: ['ne'],
		name: 'Nepal',
		original: 'नपल',
		iso3: 'NPL',
	},
	NR: {
		languages: ['en', 'na'],
		name: 'Nauru',
		original: 'Nauru',
		iso3: 'NRU',
	},
	NU: {
		languages: ['en'],
		name: 'Niue',
		original: 'Niuē',
		iso3: 'NIU',
	},
	NZ: {
		languages: ['en', 'mi'],
		name: 'New Zealand',
		original: 'New Zealand',
		iso3: 'NZL',
	},
	OM: {
		languages: ['ar'],
		name: 'Oman',
		original: 'عمان',
		iso3: 'OMN',
	},
	PA: {
		languages: ['es'],
		name: 'Panama',
		original: 'Panamá',
		iso3: 'PAN',
	},
	PE: {
		languages: ['es'],
		name: 'Peru',
		original: 'Perú',
		iso3: 'PER',
	},
	PF: {
		languages: ['fr'],
		name: 'French Polynesia',
		original: 'Polynésie française',
		iso3: 'PYF',
	},
	PG: {
		languages: ['en'],
		name: 'Papua New Guinea',
		original: 'Papua Niugini',
		iso3: 'PNG',
	},
	PH: {
		languages: ['en'],
		name: 'Philippines',
		original: 'Pilipinas',
		iso3: 'PHL',
	},
	PK: {
		languages: ['en', 'ur'],
		name: 'Pakistan',
		original: 'Pakistan',
		iso3: 'PAK',
	},
	PL: {
		languages: ['pl'],
		name: 'Poland',
		original: 'Polska',
		iso3: 'POL',
	},
	PM: {
		languages: ['fr'],
		name: 'Saint Pierre and Miquelon',
		original: 'Saint-Pierre-et-Miquelon',
		iso3: 'SPM',
	},
	PN: {
		languages: ['en'],
		name: 'Pitcairn Islands',
		original: 'Pitcairn Islands',
		iso3: 'PCN',
	},
	PR: {
		languages: ['es', 'en'],
		name: 'Puerto Rico',
		original: 'Puerto Rico',
		iso3: 'PRI',
	},
	PS: {
		languages: ['ar'],
		name: 'Palestine',
		original: 'فلسطين',
		iso3: 'PSE',
	},
	PT: {
		languages: ['pt'],
		name: 'Portugal',
		original: 'Portugal',
		iso3: 'PRT',
	},
	PW: {
		languages: ['en'],
		name: 'Palau',
		original: 'Palau',
		iso3: 'PLW',
	},
	PY: {
		languages: ['es', 'gn'],
		name: 'Paraguay',
		original: 'Paraguay',
		iso3: 'PRY',
	},
	QA: {
		languages: ['ar'],
		name: 'Qatar',
		original: 'قطر',
		iso3: 'QAT',
	},
	RE: {
		languages: ['fr'],
		name: 'Reunion',
		original: 'La Réunion',
		iso3: 'REU',
	},
	RO: {
		languages: ['ro'],
		name: 'Romania',
		original: 'România',
		iso3: 'ROU',
	},
	RS: {
		languages: ['sr'],
		name: 'Serbia',
		original: 'Србија',
		iso3: 'SRB',
	},
	RU: {
		languages: ['ru'],
		name: 'Russia',
		original: 'Россия',
		iso3: 'RUS',
	},
	RW: {
		languages: ['rw', 'en', 'fr'],
		name: 'Rwanda',
		original: 'Rwanda',
		iso3: 'RWA',
	},
	SA: {
		languages: ['ar'],
		name: 'Saudi Arabia',
		original: 'العربية السعودية',
		iso3: 'SAU',
	},
	SB: {
		languages: ['en'],
		name: 'Solomon Islands',
		original: 'Solomon Islands',
		iso3: 'SLB',
	},
	SC: {
		languages: ['fr', 'en'],
		name: 'Seychelles',
		original: 'Seychelles',
		iso3: 'SYC',
	},
	SD: {
		languages: ['ar', 'en'],
		name: 'Sudan',
		original: 'السودان',
		iso3: 'SDN',
	},
	SE: {
		languages: ['sv'],
		name: 'Sweden',
		original: 'Sverige',
		iso3: 'SWE',
	},
	SG: {
		languages: ['en', 'ms', 'ta', 'zh'],
		name: 'Singapore',
		original: 'Singapore',
		iso3: 'SGP',
	},
	SH: {
		languages: ['en'],
		name: 'Saint Helena',
		original: 'Saint Helena',
		iso3: 'SHN',
	},
	SI: {
		languages: ['sl'],
		name: 'Slovenia',
		original: 'Slovenija',
		iso3: 'SVN',
	},
	SJ: {
		languages: ['no'],
		name: 'Svalbard and Jan Mayen',
		original: 'Svalbard og Jan Mayen',
		iso3: 'SJM',
	},
	SK: {
		languages: ['sk'],
		name: 'Slovakia',
		original: 'Slovensko',
		iso3: 'SVK',
	},
	SL: {
		languages: ['en'],
		name: 'Sierra Leone',
		original: 'Sierra Leone',
		iso3: 'SLE',
	},
	SM: {
		languages: ['it'],
		name: 'San Marino',
		original: 'San Marino',
		iso3: 'SMR',
	},
	SN: {
		languages: ['fr'],
		name: 'Senegal',
		original: 'Sénégal',
		iso3: 'SEN',
	},
	SO: {
		languages: ['so', 'ar'],
		name: 'Somalia',
		original: 'Soomaaliya',
		iso3: 'SOM',
	},
	SR: {
		languages: ['nl'],
		name: 'Suriname',
		original: 'Suriname',
		iso3: 'SUR',
	},
	SS: {
		languages: ['en'],
		name: 'South Sudan',
		original: 'South Sudan',
		iso3: 'SSD',
	},
	ST: {
		languages: ['pt'],
		name: 'Sao Tome and Principe',
		original: 'São Tomé e Príncipe',
		iso3: 'STP',
	},
	SV: {
		languages: ['es'],
		name: 'El Salvador',
		original: 'El Salvador',
		iso3: 'SLV',
	},
	SX: {
		languages: ['nl', 'en'],
		name: 'Sint Maarten',
		original: 'Sint Maarten',
		iso3: 'SXM',
	},
	SY: {
		languages: ['ar'],
		name: 'Syria',
		original: 'سوريا',
		iso3: 'SYR',
	},
	SZ: {
		languages: ['en', 'ss'],
		name: 'Eswatini',
		original: 'Eswatini',
		iso3: 'SWZ',
	},
	TC: {
		languages: ['en'],
		name: 'Turks and Caicos Islands',
		original: 'Turks and Caicos Islands',
		iso3: 'TCA',
	},
	TD: {
		languages: ['fr', 'ar'],
		name: 'Chad',
		original: 'Tchad',
		iso3: 'TCD',
	},
	TF: {
		languages: ['fr'],
		name: 'French Southern Territories',
		original: 'Territoire des Terres australes et antarctiques fr',
		iso3: 'ATF',
	},
	TG: {
		languages: ['fr'],
		name: 'Togo',
		original: 'Togo',
		iso3: 'TGO',
	},
	TH: {
		languages: ['th'],
		name: 'Thailand',
		original: 'ประเทศไทย',
		iso3: 'THA',
	},
	TJ: {
		languages: ['tg', 'ru'],
		name: 'Tajikistan',
		original: 'Тоҷикистон',
		iso3: 'TJK',
	},
	TK: {
		languages: ['en'],
		name: 'Tokelau',
		original: 'Tokelau',
		iso3: 'TKL',
	},
	TL: {
		languages: ['pt'],
		name: 'East Timor',
		original: 'Timor-Leste',
		iso3: 'TLS',
	},
	TM: {
		languages: ['tk', 'ru'],
		name: 'Turkmenistan',
		original: 'Türkmenistan',
		iso3: 'TKM',
	},
	TN: {
		languages: ['ar'],
		name: 'Tunisia',
		original: 'تونس',
		iso3: 'TUN',
	},
	TO: {
		languages: ['en', 'to'],
		name: 'Tonga',
		original: 'Tonga',
		iso3: 'TON',
	},
	TR: {
		languages: ['tr'],
		name: 'Turkey',
		original: 'Türkiye',
		iso3: 'TUR',
	},
	TT: {
		languages: ['en'],
		name: 'Trinidad and Tobago',
		original: 'Trinidad and Tobago',
		iso3: 'TTO',
	},
	TV: {
		languages: ['en'],
		name: 'Tuvalu',
		original: 'Tuvalu',
		iso3: 'TUV',
	},
	TW: {
		languages: ['zh'],
		name: 'Taiwan',
		original: '臺灣',
		iso3: 'TWN',
	},
	TZ: {
		languages: ['sw', 'en'],
		name: 'Tanzania',
		original: 'Tanzania',
		iso3: 'TZA',
	},
	UA: {
		languages: ['uk'],
		name: 'Ukraine',
		original: 'Україна',
		iso3: 'UKR',
	},
	UG: {
		languages: ['en', 'sw'],
		name: 'Uganda',
		original: 'Uganda',
		iso3: 'UGA',
	},
	UM: {
		languages: ['en'],
		name: 'U.S. Minor Outlying Islands',
		original: 'United States Minor Outlying Islands',
		iso3: 'UMI',
	},
	US: {
		languages: ['en'],
		name: 'United States',
		original: 'United States',
		iso3: 'USA',
	},
	UY: {
		languages: ['es'],
		name: 'Uruguay',
		original: 'Uruguay',
		iso3: 'URY',
	},
	UZ: {
		languages: ['uz', 'ru'],
		name: 'Uzbekistan',
		original: "O'zbekiston",
		iso3: 'UZB',
	},
	VA: {
		languages: ['it', 'la'],
		name: 'Vatican City',
		original: 'Vaticano',
		iso3: 'VAT',
	},
	VC: {
		languages: ['en'],
		name: 'Saint Vincent and the Grenadines',
		original: 'Saint Vincent and the Grenadines',
		iso3: 'VCT',
	},
	VE: {
		languages: ['es'],
		name: 'Venezuela',
		original: 'Venezuela',
		iso3: 'VEN',
	},
	VG: {
		languages: ['en'],
		name: 'British Virgin Islands',
		original: 'British Virgin Islands',
		iso3: 'VGB',
	},
	VI: {
		languages: ['en'],
		name: 'U.S. Virgin Islands',
		original: 'United States Virgin Islands',
		iso3: 'VIR',
	},
	VN: {
		languages: ['vi'],
		name: 'Vietnam',
		original: 'Việt Nam',
		iso3: 'VNM',
	},
	VU: {
		languages: ['bi', 'en', 'fr'],
		name: 'Vanuatu',
		original: 'Vanuatu',
		iso3: 'VUT',
	},
	WF: {
		languages: ['fr'],
		name: 'Wallis and Futuna',
		original: 'Wallis et Futuna',
		iso3: 'WLF',
	},
	WS: {
		languages: ['sm', 'en'],
		name: 'Samoa',
		original: 'Samoa',
		iso3: 'WSM',
	},
	XK: {
		languages: ['sq', 'sr'],
		name: 'Kosovo',
		original: 'Republika e Kosovës',
		iso3: 'XKX',
	},
	YE: {
		languages: ['ar'],
		name: 'Yemen',
		original: 'اليمن',
		iso3: 'YEM',
	},
	YT: {
		languages: ['fr'],
		name: 'Mayotte',
		original: 'Mayotte',
		iso3: 'MYT',
	},
	ZA: {
		languages: ['af', 'en', 'nr', 'st', 'ss', 'tn', 'ts', 've', 'xh', 'zu'],
		name: 'South Africa',
		original: 'South Africa',
		iso3: 'ZAF',
	},
	ZM: {
		languages: ['en'],
		name: 'Zambia',
		original: 'Zambia',
		iso3: 'ZMB',
	},
	ZW: {
		languages: ['en', 'sn', 'nd'],
		name: 'Zimbabwe',
		original: 'Zimbabwe',
		iso3: 'ZWE',
	},
} as const

export const V4V_DEFAULT_RECIPIENTS = [
	'npub1ks6gyyhh8nvmzwssqul3yvw3gptevrcmxlmn93kdvatns6uh3cxqc26vrm',
	'npub10pensatlcfwktnvjjw2dtem38n6rvw8g6fv73h84cuacxn4c28eqyfn34f',
	'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6',
]

export type ISO3 = (typeof COUNTRIES_ISO)[keyof typeof COUNTRIES_ISO]['iso3']

export const INITIAL_V4V_PLATFORM_SHARE_PERCENTAGE = 0.1
