import { e as error } from "./index.js";
import { u as usersFilterSchema } from "./schema.js";
import { g as products, d as db, u as users, a as and, e as eq, f as userMeta, s as sql } from "./types.js";
import { a as USER_META } from "./constants.js";
import "./utils.js";
import { u as userEventSchema } from "./nostr-events.js";
const resolveUser = async (user) => {
  const [roleRes] = await db.select({
    valueText: userMeta.valueText
  }).from(userMeta).where(and(eq(userMeta.userId, user.id), eq(userMeta.metaName, USER_META.ROLE.value))).execute();
  const [trustRes] = await db.select({
    valueText: userMeta.valueText
  }).from(userMeta).where(and(eq(userMeta.userId, user.id), eq(userMeta.metaName, USER_META.TRUST_LVL.value))).execute();
  return {
    ...user,
    role: roleRes.valueText,
    trustLevel: trustRes.valueText
  };
};
const getAllUsers = async (filter = usersFilterSchema.parse({})) => {
  const orderBy = {
    createdAt: products.createdAt
  }[filter.orderBy];
  const usersResult = await db.query.users.findMany({
    limit: filter.pageSize,
    offset: (filter.page - 1) * filter.pageSize,
    orderBy: (users2, { asc, desc }) => filter.order === "asc" ? asc(orderBy) : desc(orderBy)
  });
  if (usersResult) {
    return usersResult;
  }
  error(404, "User not found");
};
const getRichUsers = async (filter = usersFilterSchema.parse({})) => {
  ({
    createdAt: products.createdAt,
    price: products.price
  })[filter.orderBy];
  const userResult = await db.select().from(users).limit(filter.pageSize).offset((filter.page - 1) * filter.pageSize).where(and(filter.userId ? eq(users.id, filter.userId) : void 0)).execute();
  const richUsers = await Promise.all(
    userResult.map(async (user) => {
      return await resolveUser(user);
    })
  );
  if (richUsers) {
    return richUsers;
  }
  error(404, "User not found");
};
const getUsersByRole = async (filter = usersFilterSchema.parse({})) => {
  if (!filter.role)
    error(500, "bad filter");
  const userResult = await db.select().from(userMeta).limit(filter.pageSize).offset((filter.page - 1) * filter.pageSize).where(and(eq(userMeta.metaName, USER_META.ROLE.value), eq(userMeta.valueText, filter.role))).execute();
  return userResult.map((user) => user.userId);
};
const getUserById = async (id) => {
  const [user] = await db.select().from(users).where(eq(users.id, id)).execute();
  if (user) {
    return user;
  }
  error(404, "Not found");
};
const getNip05ByUserId = async (id) => {
  const [user] = await db.select({ nip05: users.nip05 }).from(users).where(eq(users.id, id)).execute();
  if (user) {
    return user.nip05;
  }
  return null;
};
const getUserByNip05 = async (nip05addr) => {
  const [user] = await db.select().from(users).where(eq(users.nip05, nip05addr)).execute();
  if (user) {
    return user;
  }
  error(404, "Not found");
};
const getUserForProduct = async (productId) => {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).execute();
  const [user] = await db.select().from(users).where(eq(users.id, product.userId)).execute();
  if (user) {
    return user;
  }
  error(404, "Not found");
};
const createUser = async (user, role = "pleb", trustLevel = "reasonable") => {
  const parsedUserMeta = userEventSchema.safeParse(user);
  if (!parsedUserMeta.success) {
    throw Error(JSON.stringify(parsedUserMeta.error));
  }
  const userMetaData = parsedUserMeta.data;
  const insertUser = {
    id: userMetaData.id,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date(),
    name: userMetaData.name,
    nip05: userMetaData.nip05?.toLowerCase(),
    banner: userMetaData.banner,
    about: userMetaData.about,
    lud06: userMetaData.lud06,
    lud16: userMetaData.lud16,
    displayName: userMetaData.displayName,
    image: userMetaData.image ? userMetaData.image : userMetaData.picture,
    website: userMetaData.website,
    zapService: userMetaData.zapService,
    lastLogin: /* @__PURE__ */ new Date()
  };
  const [userResult] = await db.insert(users).values(insertUser).returning();
  if (userResult) {
    await Promise.all([
      db.insert(userMeta).values({ userId: userResult.id, metaName: USER_META.ROLE.value, valueText: role }).returning().execute(),
      db.insert(userMeta).values({ userId: userResult.id, metaName: USER_META.TRUST_LVL.value, valueText: trustLevel }).returning().execute()
    ]);
    return userResult;
  }
  error(500, "Failed to create user");
};
const updateUser = async (userId, userProfile) => {
  const insertUser = {
    updatedAt: /* @__PURE__ */ new Date(),
    name: userProfile.name,
    nip05: userProfile.nip05?.toLowerCase(),
    banner: userProfile.banner,
    about: userProfile.about,
    lud06: userProfile.lud06,
    lud16: userProfile.lud16,
    displayName: userProfile.displayName,
    image: userProfile.image,
    website: userProfile.website,
    zapService: userProfile.zapService
  };
  const userResult = await db.update(users).set({
    ...insertUser
  }).where(eq(users.id, userId)).returning();
  if (userProfile.role || userProfile.trustLevel) {
    await updateUserMeta(userId, userProfile.role, userProfile.trustLevel);
  }
  if (userResult.length > 0) {
    return userResult[0];
  }
  error(500, "Failed to update user");
};
const updateUserMeta = async (userId, role, trustLevel) => {
  const result = await Promise.all([
    role && db.update(userMeta).set({ valueText: role }).where(and(eq(userMeta.userId, userId), eq(userMeta.metaName, USER_META.ROLE.value))).returning(),
    trustLevel && db.update(userMeta).set({ valueText: trustLevel }).where(and(eq(userMeta.userId, userId), eq(userMeta.metaName, USER_META.TRUST_LVL.value))).returning()
  ]).then((results) => results.flat().filter((result2) => result2 !== void 0));
  return result ?? error(500, "Failed to update user");
};
const deleteUser = async (userId) => {
  const userResult = await db.delete(users).where(eq(users.id, userId)).returning();
  if (userResult) {
    return true;
  }
  error(500, "Failed to delete user");
};
const userExists = async (userId) => {
  const result = await db.select({ id: sql`1` }).from(users).where(eq(users.id, userId));
  return result.length > 0;
};
export {
  getUsersByRole as a,
  getAllUsers as b,
  createUser as c,
  getUserById as d,
  updateUser as e,
  deleteUser as f,
  getRichUsers as g,
  getUserByNip05 as h,
  getUserForProduct as i,
  getNip05ByUserId as j,
  userExists as u
};
