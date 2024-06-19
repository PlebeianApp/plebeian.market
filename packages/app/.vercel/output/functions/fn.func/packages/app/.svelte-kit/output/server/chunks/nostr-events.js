import { z } from "zod";
import { C as COUNTRIES_ISO, g as CURRENCIES, d as PRODUCT_TYPES } from "./constants.js";
const productTypeValidator = (value) => {
  if (typeof value !== "string") {
    return { error: new Error(`Invalid product type: ${value}`) };
  }
  if (!Object.values(PRODUCT_TYPES).includes(value)) {
    return { error: new Error(`Invalid product type: ${value}`) };
  }
  return value;
};
const productEventSchema = z.object({
  id: z.string(),
  stall_id: z.string(),
  name: z.string(),
  type: z.custom(productTypeValidator).optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  currency: z.string(),
  price: z.number(),
  quantity: z.number().int().nullable(),
  specs: z.array(z.tuple([z.string(), z.string()])).optional(),
  shipping: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      baseCost: z.string(),
      regions: z.array(z.enum(Object.values(COUNTRIES_ISO).map((c) => c.iso3)))
    })
  )
});
z.object({
  id: z.string(),
  stall_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  starting_bid: z.number().int(),
  start_date: z.number().int().optional(),
  duration: z.number().int(),
  specs: z.array(z.tuple([z.string(), z.string()])),
  shipping: z.array(
    z.object({
      id: z.string(),
      cost: z.number()
    })
  )
});
z.number().int();
const stallEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  currency: z.enum(CURRENCIES),
  shipping: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      baseCost: z.string(),
      regions: z.array(z.enum(Object.values(COUNTRIES_ISO).map((c) => c.iso3)))
    })
  )
});
const userEventSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  picture: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  nip05: z.string().optional().nullable(),
  lud06: z.string().optional().nullable(),
  lud16: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  zapService: z.string().optional().nullable(),
  displayName: z.string().optional().nullable(),
  image: z.string().optional().nullable()
});
export {
  productEventSchema as p,
  stallEventSchema as s,
  userEventSchema as u
};
