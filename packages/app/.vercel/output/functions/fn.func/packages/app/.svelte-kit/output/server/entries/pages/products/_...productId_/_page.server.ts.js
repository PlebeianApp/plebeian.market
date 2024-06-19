import { K as KindProducts } from "../../../../chunks/constants2.js";
import { p as productsFilterSchema } from "../../../../chunks/schema.js";
import { a as getCategoriesByProductId } from "../../../../chunks/categories.service.js";
import { e as getProductById, n as getProductsByUserId } from "../../../../chunks/products.service.js";
import { h as getUserByNip05, i as getUserForProduct } from "../../../../chunks/users.service.js";
import { NIP05_REGEX } from "nostr-tools/nip05";
const load = async ({ params }) => {
  let userId;
  let productIdentifier;
  const parts = params.productId.split("/");
  if (parts.length < 1 || parts.length > 2) {
    throw new Error("Invalid productId format");
  }
  const [root, productId] = parts;
  if (NIP05_REGEX.test(root) && productId) {
    userId = (await getUserByNip05(root)).id;
    productIdentifier = productId;
  }
  const product = userId && productIdentifier ? await getProductById(`${KindProducts}:${userId}:${productIdentifier}`) : await getProductById(root);
  const seller = await getUserForProduct(product.id);
  const products = (await getProductsByUserId(productsFilterSchema.parse({ userId: seller.id }))).slice(0, 4);
  const productCats = userId && productIdentifier ? await getCategoriesByProductId(`${KindProducts}:${userId}:${productIdentifier}`) : await getCategoriesByProductId(root);
  return { product, seller, products, productCats };
};
export {
  load
};
