import { p as productsFilterSchema, c as catsFilterSchema } from "../../../../chunks/schema.js";
import { g as getAllCategories } from "../../../../chunks/categories.service.js";
import { m as getStallsByUserId, n as getProductsByUserId } from "../../../../chunks/products.service.js";
import { h as getUserByNip05, d as getUserById } from "../../../../chunks/users.service.js";
import { NIP05_REGEX } from "nostr-tools/nip05";
import { npubEncode } from "nostr-tools/nip19";
const load = async ({ params }) => {
  const { id } = params;
  const userRes = NIP05_REGEX.test(id) ? await getUserByNip05(id) : await getUserById(id);
  const getStallsByUserIdRes = await getStallsByUserId(userRes.id);
  const getProductsByUserIdRes = await getProductsByUserId(productsFilterSchema.parse({ userId: userRes.id, pageSize: 15 }));
  const getCategoriesByUserIdRes = await getAllCategories(catsFilterSchema.parse({ userId: userRes.id }));
  return {
    npub: npubEncode(userRes.id),
    name: userRes.name,
    image: userRes.image,
    products: getProductsByUserIdRes,
    stalls: getStallsByUserIdRes,
    categories: getCategoriesByUserIdRes
  };
};
export {
  load
};
