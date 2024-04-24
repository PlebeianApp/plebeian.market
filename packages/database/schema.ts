import { AnySQLiteColumn, foreignKey, integer, numeric, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { allowedMimeTypes } from "./constants";

const standardColumns = {
  id: text("id")
    .primaryKey()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

// Events
export const events = sqliteTable("events", {
  ...standardColumns,
  eventAuthor: text("event_author")
    .notNull()
    .references(() => users.id),
  eventKind: integer("event_kind")
    .notNull(),
  event: text("event").notNull()
})

// Users table
export const users = sqliteTable("users", {
  ...standardColumns,
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "editor", "pleb"] }).notNull(),
  displayName: text("display_name").notNull(),
  about: text("about").notNull(),
  image: text("image"),
  banner: text("banner"),
  nip05: text("nip05"),
  lud06: text("lud06"),
  lud16: text("lud16"),
  website: text("website"),
  zapService: text("zap_Service"),
  lastLogin: integer("last_login", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Stalls table
export const stalls = sqliteTable("stalls", {
  ...standardColumns,
  name: text("name").notNull(),
  description: text("description").notNull(),
  currency: text("currency").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

// Payment details
export const paymentDetails = sqliteTable("payment_details", {
  paymentId: integer("payment_id", { mode: 'number' })
    .primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  stallId: text("stall_id")
    .notNull()
    .references(() => stalls.id),
  paymentMethod: text("payment_method", { enum: ["ln" , "on-chain" , "cashu" , "other"] }).notNull(),
  paymentDetails: text("payment_details").notNull(),
});

// Shipping 
export const shipping = sqliteTable("shipping", {
  stallId: text("stall_id")
    .notNull()
    .references(() => stalls.id),
  shippingId: text("shipping_id").notNull(),
  name: text("name").notNull(),
  shippingMethod: text("shipping_method").notNull(),
  shippingDetails: text("shipping_details").notNull(),
  baseCost: numeric("base_cost").notNull(),
  isDefault: integer("default").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.shippingId, table.stallId] }),
  };
});

// Shipping zones
export const shippingZones = sqliteTable("shipping_zones", {
  shippingId: text("shipping_id")
    .notNull(),
  stallId: text("stall_id")
    .notNull(),
  shippingZoneId: text("shipping_zone_id").primaryKey(),
  regionCode: text("region_code").notNull(),
  countryCode: text("country_code").notNull(),
}, (table) => ({
  f: foreignKey({ foreignColumns: [shipping.shippingId, shipping.stallId], columns: [table.shippingId, table.stallId], name: 'custom_fk' }),
}));

// Products
export const products = sqliteTable("products", {
  ...standardColumns,
  stallId: text("stall_id")
    .notNull()
    .references(() => stalls.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  productName: text("product_name")
    .notNull(),
  description: text("description")
    .notNull(),
  price: integer("price")
    .notNull(),
  productType: text("product_type", { enum: ["simple", "variable", "variation"] })
    .notNull(),
  currency: text("currency")
    .notNull(),
  stockQty: integer("stock_qty")
    .notNull(),
  specs: text("specs"),
  shippingCost: integer("shipping_cost"),
  isFeatured: integer("featured", { mode: "boolean" })
    .notNull()
    .default(false),
  isDigital: integer("is_digital", { mode: "boolean" })
    .notNull()
    .default(false),
  parentId: text("parent_id").references((): AnySQLiteColumn => products.id)
});

export const digitalProducts = sqliteTable("digital_products", {
  productId: text("product_id")
    .notNull()
    .primaryKey()
    .references(() => products.id),
  licenseKey: text("license_key"),
  downloadLink: text("download_link"),
  mimeType: text("mime_type", { enum: ["other", ...allowedMimeTypes] }),
  sha256Hash: text("sha256_hash"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const productImages = sqliteTable("product_images", {
  productId: text("product_id")
    .notNull()
    .primaryKey()
    .references(() => products.id),
  imageUrl: text("image_url")
    .notNull(),
  imageType: text("image_type", { enum: ["main", "thumbnail", "gallery"]})
    .notNull(),
  imageOrder: integer("image_order")
    .notNull()
    .default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})

// Categories
export const categories = sqliteTable("categories", {
  catId: text("cat_id")
    .notNull()
    .primaryKey(),
  catName: text("cat_name").notNull(),
  description: text("description").notNull(),
  parentId: text("parent_id").references((): AnySQLiteColumn => categories.catId)
});

// Product categories
export const productCategories = sqliteTable("product_categories", {
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  catId: text("cat_id")
    .notNull()
    .references(() => categories.catId),
});

// Auctions
export const auctions = sqliteTable("auctions", {
  ...standardColumns,
  stallId: text("stall_id")
    .notNull()
    .references(() => stalls.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  auctionName: text("auction_name")
    .notNull(),
  description: text("description")
    .notNull(),
  startingBidAmount: integer("starting_bid_amount")
    .notNull(),
  startDate: integer("start_date", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  endDate: integer("end_date", { mode: "timestamp" })
    .notNull(),
  currency: text("currency")
    .notNull(),
  specs: text("specs"),
  shippingCost: integer("shipping_cost")
    .notNull(),
  status: text("status", { enum: ["active", "ended", "canceled"]})
    .notNull(),
  isFeatured: integer("featured", { mode: "boolean" })
    .notNull()
    .default(false),
});

//Bids
export const bids = sqliteTable("bids", {
  ...standardColumns,
  auctionId: text("auction_id")
    .notNull()
    .references(() => auctions.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  bidAmount: integer("bid_amount").notNull(),
  bidStatus: text("bid_status", { enum: ["accepted" , "rejected" , "pending" , "winner"] }).notNull(),
});

//Orders
export const orders = sqliteTable("orders", {
  ...standardColumns,
  sellerUserId: text("seller_user_id")
    .notNull()
    .references(() => users.id),
  buyerUserId: text("buyer_user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { enum: ["confirmed", "pending", "shipped", "completed", "canceled"] }).notNull(),
  shippingId: text("shipping_id")
    .notNull(),
  stallId: text("stall_id")
    .notNull(),
  address: text("address").notNull(),
  zip: text("zip").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),// use ISO3166
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  observations: text("observations"),
}
, (table) => ({
  f: foreignKey({ foreignColumns: [shipping.shippingId, shipping.stallId], columns: [table.shippingId, table.stallId]}),
})
);

// Order items
export const orderItems = sqliteTable("order_items", {
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  qty: integer("qty").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.orderId, table.productId] }),
  };
});

// Invoices
export const invoices = sqliteTable("invoices", {
  invoiceId: text("invoice_id")
    .notNull()
    .primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  createdAt: integer("invoice_date", { mode: "timestamp" }).notNull(),
  updatedAt: integer("invoice_date", { mode: "timestamp" }).notNull(),
  totalAmount: integer("total_amount").notNull(),
  invoiceStatus: text("invoice_status", { enum:["pending" , "paid" , "canceled" , "refunded"]}).notNull(),
  paymentMethod: text("payment_method", { enum: ["ln" , "on-chain" , "cashu" , "other"] }).notNull(),
  paymentDetails: text("payment_details").notNull(),
});