import { z } from "zod";
import { v as validUrls } from "./constants2.js";
const generalFilterSchema = z.object({
  pageSize: z.coerce.number().min(1).default(10),
  page: z.coerce.number().min(1).default(1),
  order: z.enum(["asc", "desc"]).default("asc")
});
generalFilterSchema.extend({
  orderBy: z.enum(["createdAt", "startDate", "endDate"]).default("createdAt")
});
const usersFilterSchema = generalFilterSchema.extend({
  orderBy: z.enum(["createdAt"]).default("createdAt"),
  userId: z.string().optional(),
  role: z.string().optional()
});
const productsFilterSchema = generalFilterSchema.extend({
  orderBy: z.enum(["createdAt", "price"]).default("createdAt"),
  stallId: z.string().optional(),
  userId: z.string().optional(),
  catId: z.string().optional(),
  catName: z.string().optional()
});
const stallsFilterSchema = generalFilterSchema.extend({
  stallId: z.string().optional(),
  userId: z.string().optional(),
  orderBy: z.enum(["createdAt"]).default("createdAt")
});
const catsFilterSchema = generalFilterSchema.extend({
  userId: z.string().optional(),
  catId: z.string().optional(),
  catName: z.string().optional()
});
const initialSetupDataSchema = z.object({
  instancePk: z.string().startsWith("npub"),
  ownerPk: z.string().startsWith("npub").optional(),
  adminsList: z.array(z.string().startsWith("npub")).optional(),
  instanceName: z.string(),
  logoUrl: z.union([z.string().url(), z.enum(validUrls)]).optional(),
  contactEmail: z.string().email().optional(),
  defaultCurrency: z.string(),
  allowRegister: z.coerce.boolean()
});
export {
  catsFilterSchema as c,
  initialSetupDataSchema as i,
  productsFilterSchema as p,
  stallsFilterSchema as s,
  usersFilterSchema as u
};
