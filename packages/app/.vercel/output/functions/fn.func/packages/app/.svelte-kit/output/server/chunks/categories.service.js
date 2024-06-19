import { e as error } from "./index.js";
import { c as catsFilterSchema } from "./schema.js";
import { d as db, j as categories, k as productCategories, e as eq, s as sql, a as and } from "./types.js";
import "./constants.js";
import "./utils.js";
const resolveCategory = async (cat) => {
  const [productCount] = (await db.select({
    count: sql`cast(count(${productCategories.productId}) as int)`
  }).from(productCategories).where(eq(productCategories.catId, cat.id)).execute()).map((product) => product.count);
  return {
    id: cat.id,
    name: cat.name,
    description: cat.description,
    parentId: cat.parentId,
    userId: cat.userId,
    productCount
  };
};
const getAllCategories = async (filter = catsFilterSchema.parse({})) => {
  const categoriesResult = await db.select().from(categories).where(
    and(
      filter.catName ? eq(categories.name, filter.catName) : void 0,
      filter.catId ? eq(categories.id, filter.catId) : void 0,
      filter.userId ? eq(categories.userId, filter.userId) : void 0
    )
  ).groupBy(categories.name).limit(filter.pageSize).offset((filter.page - 1) * filter.pageSize);
  const richCats = await Promise.all(
    categoriesResult.map(async (cat) => {
      return await resolveCategory(cat);
    })
  );
  if (richCats) {
    return richCats;
  }
  error(404, "Not found");
};
const preparedCatByProductId = db.select().from(categories).innerJoin(productCategories, eq(productCategories.catId, categories.id)).where(eq(productCategories.productId, sql.placeholder("productId"))).prepare();
const getCategoriesByProductId = async (productId) => {
  const categoriesResult = await preparedCatByProductId.execute({ productId });
  if (categoriesResult) {
    return categoriesResult.map((data) => data.categories);
  }
  error(404, "Not found");
};
export {
  getCategoriesByProductId as a,
  getAllCategories as g
};
