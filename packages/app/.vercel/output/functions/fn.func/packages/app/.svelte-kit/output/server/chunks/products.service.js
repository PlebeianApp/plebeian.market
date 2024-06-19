import { e as error } from "./index.js";
import { s as standardDisplayDateFormat } from "./constants2.js";
import { s as stallsFilterSchema, p as productsFilterSchema } from "./schema.js";
import { d as db, l as productImages, e as eq, h as getTableColumns, m as stalls, g as products, k as productCategories, j as categories, s as sql, a as and, u as users, n as shipping, o as shippingZones, q as orders, p as paymentDetails, i as productMeta } from "./types.js";
import { f as PRODUCT_META } from "./constants.js";
import { c as createId } from "./utils.js";
import { g as getEventCoordinates, d as customTagValue } from "./utils2.js";
import { format } from "date-fns";
import { s as stallEventSchema, p as productEventSchema } from "./nostr-events.js";
import { j as getNip05ByUserId } from "./users.service.js";
const devUser1 = {
  pk: "86a82cab18b293f53cbaaae8cdcbee3f7ec427fdf9f9c933db77800bb5ef38a0",
  sk: "5c81bffa8303bbd7726d6a5a1170f3ee46de2addabefd6a735845166af01f5c0"
};
const getImagesByProductId = async (productId) => {
  const productImagesResult = await db.select().from(productImages).where(eq(productImages.productId, productId)).execute();
  const galleryImages = [];
  productImagesResult.forEach((image) => {
    if (image.imageUrl) {
      galleryImages.push(image.imageUrl);
    }
  });
  if (galleryImages) {
    return galleryImages;
  }
  error(404, "Not found");
};
const resolveStalls = async (stall) => {
  const [ownerRes] = await db.select({
    userId: users.id,
    userName: users.name,
    userNip05: users.nip05
  }).from(users).where(eq(users.id, stall.userId)).execute();
  const [productCount] = (await db.select({
    count: sql`cast(count(${stalls.id}) as int)`
  }).from(products).where(eq(products.stallId, stall.id)).execute()).map((product) => product.count);
  const [orderCount] = (await db.select({
    count: sql`cast(count(${orders.id}) as int)`
  }).from(orders).where(eq(orders.stallId, stall.id)).execute()).map((order) => order.count);
  if (!ownerRes.userId) {
    error(404, "Not found");
  }
  const paymentMethods = await db.select().from(paymentDetails).where(eq(paymentDetails.stallId, stall.id)).execute();
  return {
    id: stall.id,
    name: stall.name,
    description: stall.description,
    currency: stall.currency,
    createDate: format(stall.createdAt, standardDisplayDateFormat),
    userId: ownerRes.userId,
    userName: ownerRes.userName,
    userNip05: ownerRes.userNip05,
    productCount,
    orderCount,
    paymentMethods,
    identifier: stall.id.split(":")[2]
  };
};
const getAllStalls = async (filter = stallsFilterSchema.parse({})) => {
  ({
    createdAt: products.createdAt,
    price: products.price
  })[filter.orderBy];
  const stallsResult = await db.select().from(stalls).limit(filter.pageSize).offset((filter.page - 1) * filter.pageSize).where(and(filter.userId ? eq(stalls.userId, filter.userId) : void 0, filter.stallId ? eq(stalls.id, filter.stallId) : void 0)).execute();
  const richStalls = await Promise.all(
    stallsResult.map(async (stall) => {
      return await resolveStalls(stall);
    })
  );
  if (richStalls) {
    return richStalls;
  }
  error(404, "Not found");
};
const getStallById = async (id) => {
  const [uniqueStall] = await db.select().from(stalls).where(eq(stalls.id, id)).execute();
  const [ownerRes] = await db.select({
    userId: users.id
  }).from(users).where(eq(users.id, uniqueStall.userId)).execute();
  if (!ownerRes.userId) {
    error(404, "Not found");
  }
  const stallProducts = await getProductsByStallId(uniqueStall.id);
  const stallInfo = {
    id: uniqueStall.id,
    name: uniqueStall.name,
    description: uniqueStall.description,
    currency: uniqueStall.currency,
    createDate: format(uniqueStall.createdAt, standardDisplayDateFormat),
    userId: ownerRes.userId,
    products: stallProducts
  };
  if (stallInfo) {
    return stallInfo;
  }
  error(404, "Not found");
};
const stallsByCatNamePrepared = db.select({ ...getTableColumns(stalls) }).from(stalls).leftJoin(products, eq(stalls.id, products.stallId)).leftJoin(productCategories, eq(products.id, productCategories.productId)).leftJoin(categories, eq(productCategories.catId, categories.id)).where(eq(categories.name, sql.placeholder("catName"))).groupBy(stalls.id).prepare();
const getStallsByCatName = async (catName) => {
  const stallsRes = await stallsByCatNamePrepared.execute({ catName });
  const richStalls = await Promise.all(
    stallsRes.map(async (stall) => {
      return await resolveStalls(stall);
    })
  );
  if (richStalls) {
    return richStalls;
  }
  throw new Error("404: Not found");
};
const getStallsByUserId = async (userId) => {
  const stallsResult = await db.select().from(stalls).where(eq(stalls.userId, userId)).execute();
  const richStalls = await Promise.all(
    stallsResult.map(async (stall) => {
      return await resolveStalls(stall);
    })
  );
  if (richStalls) {
    return richStalls;
  }
  error(404, "Not found");
};
const createStall = async (stallEvent) => {
  const eventCoordinates = getEventCoordinates(stallEvent);
  const productEventContent = JSON.parse(stallEvent.content);
  const parsedProduct = stallEventSchema.parse({
    id: productEventContent.id,
    ...productEventContent
  });
  const insertStall = {
    id: eventCoordinates.coordinates,
    createdAt: new Date(stallEvent.created_at * 1e3),
    updatedAt: new Date(stallEvent.created_at * 1e3),
    name: parsedProduct.name,
    identifier: eventCoordinates.tagD,
    description: parsedProduct.description,
    currency: parsedProduct.currency,
    userId: stallEvent.pubkey
  };
  const [stallResult] = await db.insert(stalls).values(insertStall).returning();
  if (!stallResult) {
    error(404, "Not found");
  }
  for (const method of parsedProduct.shipping) {
    const [shippingResult] = await db.insert(shipping).values({
      id: method.id,
      name: method.name,
      baseCost: String(method.baseCost),
      userId: stallResult.userId,
      stallId: stallResult.id
    }).returning();
    await db.insert(shippingZones).values(
      method.regions.map((region) => ({
        countryCode: region,
        regionCode: region,
        shippingId: shippingResult.id,
        stallId: stallResult.id
      }))
    );
  }
  const stall = stallResult;
  return {
    id: stall.id,
    name: stall.name,
    description: stall.description,
    currency: stall.currency,
    createDate: format(stall.createdAt, standardDisplayDateFormat),
    userId: stall.userId
  };
};
const updateStall = async (stallId, stallEvent) => {
  const stallEventContent = JSON.parse(stallEvent.content);
  const parsedStall = stallEventSchema.partial().parse({ id: stallId, ...stallEventContent });
  const insertStall = {
    updatedAt: /* @__PURE__ */ new Date(),
    name: parsedStall.name,
    description: parsedStall.description,
    currency: parsedStall.currency
  };
  const [stallResult] = await db.update(stalls).set({
    ...insertStall
  }).where(eq(stalls.id, stallId)).returning();
  if (stallResult) {
    await db.delete(shippingZones).where(eq(shippingZones.stallId, stallId)).execute();
    for (const method of parsedStall.shipping ?? []) {
      const [shippingResult] = await db.insert(shipping).values({
        id: method.id,
        name: method.name,
        baseCost: String(method.baseCost),
        userId: stallResult.userId,
        stallId: stallResult.id
      }).returning();
      await db.insert(shippingZones).values(
        method.regions.map((region) => ({
          countryCode: region,
          regionCode: region,
          shippingId: shippingResult.id,
          stallId: stallResult.id
        }))
      );
    }
    return {
      id: stallResult.id,
      name: stallResult.name,
      description: stallResult.description,
      currency: stallResult.currency,
      createDate: format(stallResult.createdAt, standardDisplayDateFormat),
      userId: stallResult.userId
    };
  }
  error(500, "Failed to update product");
};
const toDisplayProduct = async (product) => {
  const images = await getImagesByProductId(product.id);
  const userNip05 = await getNip05ByUserId(product.userId);
  return {
    id: product.id,
    identifier: product.identifier,
    userId: product.userId,
    userNip05,
    createdAt: format(product.createdAt, standardDisplayDateFormat),
    name: product.productName,
    description: product.description,
    price: parseFloat(product.price),
    currency: product.currency,
    stockQty: product.stockQty,
    galleryImages: images,
    stallId: product.stallId
  };
};
const getProductsByUserId = async (filter = productsFilterSchema.parse({})) => {
  const productsResult = await db.select().from(products).where(and(filter.userId ? eq(products.userId, filter.userId) : void 0)).limit(filter.pageSize).execute();
  const displayProducts = await Promise.all(productsResult.map(toDisplayProduct));
  if (displayProducts) {
    return displayProducts;
  }
  error(404, "Not found");
};
const getProductsByStallId = async (stallId) => {
  const productsResult = await db.select().from(products).where(eq(products.stallId, stallId)).execute();
  const displayProducts = await Promise.all(productsResult.map(toDisplayProduct));
  if (displayProducts) {
    return displayProducts;
  }
  error(404, "Not found");
};
const getAllProducts = async (filter = productsFilterSchema.parse({})) => {
  const orderBy = {
    createdAt: products.createdAt,
    price: products.price
  }[filter.orderBy];
  const productsResult = await db.query.products.findMany({
    limit: filter.pageSize,
    offset: (filter.page - 1) * filter.pageSize,
    orderBy: (products2, { asc, desc }) => filter.order === "asc" ? asc(orderBy) : desc(orderBy),
    where: and(filter.userId ? eq(products.userId, filter.userId) : void 0)
  });
  const displayProducts = await Promise.all(productsResult.map(toDisplayProduct));
  if (displayProducts) {
    return displayProducts;
  }
  error(404, "Not found");
};
const getProductById = async (productId) => {
  const [productResult] = await db.select().from(products).where(eq(products.id, productId)).execute();
  if (!productResult) {
    error(404, "Not found");
  }
  const images = await getImagesByProductId(productId);
  const userNip05 = await getNip05ByUserId(productResult.userId);
  return {
    id: productResult.id,
    identifier: productResult.identifier,
    userId: productResult.userId,
    userNip05,
    createdAt: format(productResult.createdAt, standardDisplayDateFormat),
    name: productResult.productName,
    description: productResult.description,
    price: parseFloat(productResult.price),
    currency: productResult.currency,
    stockQty: productResult.stockQty,
    galleryImages: images,
    stallId: productResult.stallId
  };
};
const createProduct = async (productEvent) => {
  const eventCoordinates = getEventCoordinates(productEvent);
  const productEventContent = JSON.parse(productEvent.content);
  const parsedProduct = productEventSchema.parse({ id: productEventContent.id, ...productEventContent });
  if (!parsedProduct)
    throw Error("Bad product schema");
  const stall = await getStallById(parsedProduct.stall_id);
  const parentId = customTagValue(productEvent.tags, "a")[0] || null;
  const extraCost = parsedProduct.shipping.length ? parsedProduct.shipping[0].baseCost : 0;
  if (!stall) {
    error(400, "Stall not found");
  }
  if (!parsedProduct.type) {
    parsedProduct.type = "simple";
  }
  const insertProduct = {
    id: eventCoordinates.coordinates,
    createdAt: new Date(productEvent.created_at * 1e3),
    updatedAt: new Date(productEvent.created_at * 1e3),
    identifier: eventCoordinates.tagD,
    productName: parsedProduct.name,
    description: parsedProduct.description,
    currency: parsedProduct.currency,
    price: parsedProduct.price.toString(),
    extraCost: extraCost.toString(),
    productType: parsedProduct.type,
    parentId,
    userId: productEvent.pubkey,
    stallId: parsedProduct.stall_id,
    stockQty: parsedProduct.quantity ?? 0
  };
  const insertSpecs = parsedProduct.specs?.map((spec) => ({
    id: createId(),
    createdAt: new Date(productEvent.created_at * 1e3),
    updatedAt: new Date(productEvent.created_at * 1e3),
    productId: eventCoordinates.coordinates,
    auctionId: null,
    metaName: PRODUCT_META.SPEC.value,
    key: spec[0],
    valueText: spec[1],
    valueBoolean: null,
    valueInteger: null,
    valueNumeric: null
  }));
  const insertProductImages = parsedProduct.images?.map((imageUrl, index) => ({
    createdAt: new Date(productEvent.created_at * 1e3),
    productId: eventCoordinates.coordinates,
    auctionId: null,
    imageUrl,
    imageType: "gallery",
    imageOrder: index + 1
  }));
  const productResult = await db.insert(products).values(insertProduct).returning();
  insertSpecs?.length && await db.insert(productMeta).values(insertSpecs).returning();
  insertProductImages?.length && await db.insert(productImages).values(insertProductImages).returning();
  if (productResult[0]) {
    return toDisplayProduct(productResult[0]);
  }
  error(500, "Failed to create product");
};
const updateProduct = async (productId, productEvent) => {
  const productEventContent = JSON.parse(productEvent.content);
  const parsedProduct = productEventSchema.partial().parse({ id: productId, ...productEventContent });
  const insertProduct = {
    id: parsedProduct.id,
    description: parsedProduct?.description,
    updatedAt: /* @__PURE__ */ new Date(),
    currency: parsedProduct?.currency,
    price: parsedProduct?.price?.toString(),
    extraCost: parsedProduct?.shipping?.length ? parsedProduct?.shipping[0].baseCost.toString() : String(0),
    userId: devUser1.pk,
    stallId: parsedProduct?.stall_id,
    productName: parsedProduct?.name,
    stockQty: parsedProduct?.quantity !== null ? parsedProduct?.quantity : void 0
  };
  const productResult = await db.update(products).set({
    ...insertProduct
  }).where(eq(products.id, productId)).returning();
  if (productResult.length > 0) {
    return toDisplayProduct(productResult[0]);
  }
  error(500, "Failed to update product");
};
const deleteProduct = async (productId) => {
  const productResult = await db.delete(products).where(eq(products.id, productId)).execute();
  if (productResult) {
    return true;
  }
  error(500, "Failed to delete product");
};
const preparedProductsByCatId = db.select({ ...getTableColumns(products) }).from(products).innerJoin(productCategories, eq(products.id, productCategories.productId)).where(eq(productCategories.catId, sql.placeholder("catId"))).limit(sql.placeholder("limit")).offset(sql.placeholder("offset")).prepare();
const getProductsByCatId = async (filter) => {
  if (!filter.catId) {
    throw new Error("Category ID must be provided");
  }
  const productRes = await preparedProductsByCatId.execute({
    catId: filter.catId,
    limit: filter.pageSize,
    offset: (filter.page - 1) * filter.pageSize
  });
  if (productRes) {
    return await Promise.all(productRes.map(toDisplayProduct));
  }
  error(404, "not found");
};
const preparedProductsByCatName = db.select({ ...getTableColumns(products) }).from(products).innerJoin(productCategories, eq(products.id, productCategories.productId)).innerJoin(categories, eq(productCategories.catId, categories.id)).where(eq(categories.name, sql.placeholder("catName"))).limit(sql.placeholder("limit")).offset(sql.placeholder("offset")).prepare();
const getProductsByCatName = async (filter) => {
  if (!filter.catName) {
    throw new Error("Category Name must be provided");
  }
  const productRes = await preparedProductsByCatName.execute({
    catName: filter.catName,
    limit: filter.pageSize,
    offset: (filter.page - 1) * filter.pageSize
  });
  if (productRes) {
    return await Promise.all(productRes.map(toDisplayProduct));
  }
  throw error(404, "not found");
};
export {
  getProductsByCatName as a,
  getProductsByStallId as b,
  getAllProducts as c,
  createProduct as d,
  getProductById as e,
  deleteProduct as f,
  getProductsByCatId as g,
  getAllStalls as h,
  createStall as i,
  getStallById as j,
  updateStall as k,
  getStallsByCatName as l,
  getStallsByUserId as m,
  getProductsByUserId as n,
  toDisplayProduct as t,
  updateProduct as u
};
