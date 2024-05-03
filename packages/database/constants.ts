import { init } from "@paralleldrive/cuid2";

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

export const productMetaTypes = [
  { name: "is_user_featured", dataType: "boolean" },
  { name: "is_stall_featured", dataType: "boolean" },
  { name: "is_global_featured", dataType: "boolean" },
  { name: "is_digital", dataType: "boolean" },
  { name: "shipping_cost", dataType: "numeric" },
  { name: "spec", dataType: "text" },
]

export const digitalProductMetaTypes = [
  { name: "license_key", dataType: "text" },
  { name: "download_link", dataType: "text" },
  { name: "mime_type", dataType: "text" },
  { name: "sha256_hash", dataType: "text" },
]

export const generalMetaTypes = [
  { name: "comments", dataType: "text" }
]

export const allowedMetaNames = [
  ...productMetaTypes.map(meta => meta.name),
  ...digitalProductMetaTypes.map(meta => meta.name),
  ...generalMetaTypes.map(meta => meta.name),
]

export const metaScopes = ["products", "users", "orders"]
export const metaDataTypes = ["text", "boolean", "integer" ,"numeric"]

export const userRoles = ["admin", "editor", "pleb"]
export const userTrustLevel = ["trust", "reasonable", "paranoid"]
export const paymentDetailsMethod = ["ln" , "on-chain" , "cashu" , "other"]

export const productImagesType = ["main", "thumbnail", "gallery"]
export const productTypes = ["simple", "variable", "variation"]

export const auctionStatus = ["active", "inactive" ,"ended", "canceled"]
export const bidStatus = ["accepted" , "rejected" , "pending" , "winner"]

export const orderStatus = ["confirmed", "pending", "shipped", "completed", "canceled"]
export const invoiceStatus = ["pending" , "paid" , "canceled" , "refunded"]

export const createId = init({
  length: 10,
});