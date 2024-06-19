import { e as error } from "./index.js";
import { d as decodeJwtToEvent } from "./nostrAuth.service.js";
import { f as findCustomTags } from "./utils2.js";
import { d as db, u as users, e as eq } from "./types.js";
import "./constants.js";
import "./utils.js";
const userExists = async (userId) => {
  const [user] = await db.select({
    userId: users.id
  }).from(users).where(eq(users.id, userId)).execute();
  return !!user;
};
const authorizeUserless = async (request, method) => {
  const authorizationHeader = request.headers.get("Authorization");
  if (!authorizationHeader) {
    throw error(401, "Authorization header missing");
  }
  const token = decodeJwtToEvent(authorizationHeader);
  if (token.pubkey && findCustomTags(token.tags, "method")[0] === method) {
    if (await userExists(token.pubkey)) {
      return token.pubkey;
    }
    throw error(401, "User does not exist");
  }
  throw error(401, "Invalid Token");
};
const authorize = async (request, userId, method) => {
  const authorizationHeader = request.headers.get("Authorization");
  if (!authorizationHeader) {
    throw error(401, "Authorization header missing");
  }
  const token = decodeJwtToEvent(authorizationHeader);
  if (token.pubkey === userId && findCustomTags(token.tags, "method")[0] === method) {
    return true;
  }
  throw error(401, "Invalid Token");
};
export {
  authorize as a,
  authorizeUserless as b
};
