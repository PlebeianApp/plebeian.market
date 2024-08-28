import { z } from "zod";

import { validUrls } from "./constants";

export const generalFilterSchema = z.object({
  pageSize: z.coerce.number().min(1).default(10),
  page: z.coerce.number().min(1).default(1),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type GeneralFilter = z.infer<typeof generalFilterSchema>;

export const auctionsFilterSchema = generalFilterSchema.extend({
  orderBy: z.enum(["createdAt", "startDate", "endDate"]).default("createdAt"),
});

export type AuctionsFilter = z.infer<typeof auctionsFilterSchema>;

export const usersFilterSchema = generalFilterSchema.extend({
  orderBy: z.enum(["createdAt"]).default("createdAt"),
  userId: z.string().optional(),
  role: z.string().optional(),
});

export type UsersFilter = z.infer<typeof usersFilterSchema>;

export const productsFilterSchema = generalFilterSchema.extend({
  orderBy: z.enum(["createdAt", "price"]).default("createdAt"),
  stallId: z.string().optional(),
  userId: z.string().optional(),
  category: z.string().optional(),
});

export type ProductsFilter = z.infer<typeof productsFilterSchema>;

export const stallsFilterSchema = generalFilterSchema.extend({
  stallId: z.string().optional(),
  userId: z.string().optional(),
  orderBy: z.enum(["createdAt"]).default("createdAt"),
});

export type StallsFilter = z.infer<typeof stallsFilterSchema>;

export const shippingFilterSchema = generalFilterSchema.extend({
  stallId: z.string().optional(),
});

export type ShippingFilter = z.infer<typeof shippingFilterSchema>;

export const catsFilterSchema = generalFilterSchema.extend({
  userId: z.string().optional(),
  category: z.string().optional(),
});

export type CatsFilter = z.infer<typeof catsFilterSchema>;

export const initialSetupDataSchema = z.object({
  instancePk: z.string().startsWith("npub"),
  instanceSk: z.string().startsWith("ncryptsec"),
  ownerPk: z.string().startsWith("npub").optional(),
  adminsList: z.array(z.string().startsWith("npub")).optional(),
  instanceName: z.string().max(24),
  logoUrl: z.union([z.string().url(), z.enum(validUrls), z.null()]).optional(),
  contactEmail: z.union([z.string().email(), z.null()]).optional(),
  defaultCurrency: z.string(),
  allowRegister: z.coerce.boolean(),
  isFirstTimeRunning: z.coerce.boolean().optional(),
});

export const postProductImageSchema = z.object({
  productId: z.string(),
  imageUrl: z.string(),
  newImageUrl: z.string().optional(),
  imageOrder: z.number().optional(),
  imageType: z.string().optional(),
});

export type PostProductImageFilter = z.infer<typeof postProductImageSchema>;

export const orderSchema = z.object({
  id: z.string().optional(),
  type: z.number(),
  sellerUserId: z.string(),
  buyerUserId: z.string(),
  shippingId: z.string(),
  stallId: z.string(),
  address: z.string(),
  zip: z.string(),
  city: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  contactName: z.string(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  observations: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number(),
    }),
  ),
});

export type OrderFilter = z.infer<typeof orderSchema>
