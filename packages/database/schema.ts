import { integer, numeric, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

const standardColumns = {
  id: text("id")
    .primaryKey()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
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
  lastLogin: integer("last_login", { mode: "timestamp" }),
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
  paymentId: integer("payment_id").primaryKey(),
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
  shippingId: text("shipping_id"),//This sould be a composed primary key (shipping_id, stall_id)
  name: text("name").notNull(),
  shippingMethod: text("shipping_method").notNull(),
  shippingDetails: text("shipping_details").notNull(),
  baseCost: numeric("base_cost").notNull(),
  isDefault: integer("default").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.bookId, table.authorId] }),// This is not working
  };
});
// Shipping zones
export const shippingZones = sqliteTable("shipping_zones", {
  shippingId: text("shipping_id")
    .notNull()
    .references(() => shipping.shippingId),
  shippingZoneId: text("shipping_zone_id").primaryKey(),
  regionCode: text("region_code").notNull(),
  countryCode: text("country_code").notNull(),
});

// Products
export const products = sqliteTable("products", {
  ...standardColumns,
  stallId: text("stall_id")
    .notNull()
    .references(() => stalls.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  productName: text("product_name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  productType: text("product_type", { enum: ["simple", "variable", "variation"] }).notNull(),
  images: text("images"),
  currency: text("currency").notNull(),
  stockQty: integer("stock_qty").notNull(),
  specs: text("specs"),
  shippingCost: integer("shipping_cost"),
  isFeatured: integer("featured", {mode: "boolean"}).notNull(),
  parentId: text("parent_id").notNull()// We have to self reference this to a `id` of another product in the table
});

// Categories
export const categories = sqliteTable("categories", {
  catId: integer("cat_id").primaryKey(),
  catName: text("cat_name").notNull(),
  description: text("description").notNull(),
  parentId: integer("parent_id").notNull()// We have to self reference this to a `id` of another category in the table
});

// Product categories
export const productCategories = sqliteTable("product_categories", {
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  catId: integer("cat_id")
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
  auctionName: text("auction_name").notNull(),
  description: text("description").notNull(),
  startingBidAmount: integer("starting_bid_amount").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  images: text("images"),
  currency: text("currency").notNull(),
  specs: text("specs"),
  shippingCost: integer("shipping_cost"),
  status: text("status").notNull(),
  isFeatured: integer("featured", { mode: "boolean" }).notNull(),
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
  sellerUserId: integer("seller_user_id")
    .notNull()
    .references(() => users.id),
  buyerUserId: integer("buyer_user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { enum: ["confirmed", "pending", "shipped", "completed", "canceled"] }).notNull(),
  shippingId: text("shipping_id")
    .references(() => shipping.shippingId),
  address: text("address").notNull(),
  zip: text("zip").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  observations: text("observations"),
});

// Order items
export const orderItems = sqliteTable("order_items", {
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id").primaryKey(),//Primary key (order_id, product_id). Foreign Key, References the product_id in the Products table
  qty: integer("qty").notNull(),
});

// Invoices
export const invoices = sqliteTable("invoices", {
  invoiceId: integer("invoice_id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  invoiceDate: integer("invoice_date", { mode: "timestamp" }).notNull(),
  totalAmount: integer("total_amount").notNull(),
  invoiceStatus: text("invoice_status", { enum:["pending" , "paid" , "canceled" , "refunded"]}).notNull(),
  paymentMethod: text("payment_method", { enum: ["ln" , "on-chain" , "cashu" , "other"] }).notNull(),
  paymentDetails: text("payment_details").notNull(),
});

// TODO: Continue doing relations
export const userRelations = relations(users, ({ many }) => ({
  stalls: many(stalls),
}));

export const stallRelations = relations(stalls, ({ one }) => ({
  user: one(users, {
    fields: [stalls.userId],
    references: [users.id],
  }),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  stall: one(stalls, {
    fields: [products.stallId],
    references: [stalls.id],
  }),
  categories: many(categories),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const auctionRelations = relations(auctions, ({ one, many }) => ({
  user: one(users, {
    fields: [auctions.userId],
    references: [users.id],
  }),
  stall: one(stalls, {
    fields: [auctions.stallId],
    references: [stalls.id],
  }),
  bids: many(bids),
}));

export const bidRelations = relations(bids, ({ one }) => ({
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
  auction: one(auctions, {
    fields: [bids.auctionId],
    references: [auctions.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  sellerUser: one(users, {
    fields: [orders.sellerUserId],
    references: [users.id],
  }),
  buyerUser: one(users, {
    fields: [orders.buyerUserId],
    references: [users.id],
  }),
  shipping: one(shipping, {
    fields: [orders.shippingId],
    references: [shipping.shippingId],
  }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
}));
