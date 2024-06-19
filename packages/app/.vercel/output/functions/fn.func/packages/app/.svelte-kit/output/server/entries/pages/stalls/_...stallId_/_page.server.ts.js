import { a as KindStalls } from "../../../../chunks/constants2.js";
import { a as getShippingZonesByStallId } from "../../../../chunks/shipping.service.js";
import { j as getStallById } from "../../../../chunks/products.service.js";
import { h as getUserByNip05, d as getUserById } from "../../../../chunks/users.service.js";
import { NIP05_REGEX } from "nostr-tools/nip05";
const load = async ({ params }) => {
  let userId;
  let stallIdentifier;
  const parts = params.stallId.split("/");
  if (parts.length < 1 || parts.length > 2) {
    throw new Error("Invalid stall format");
  }
  const [root, productId] = parts;
  if (NIP05_REGEX.test(root) && productId) {
    userId = (await getUserByNip05(root)).id;
    stallIdentifier = productId;
  }
  const stallRes = userId && stallIdentifier ? await getStallById(`${KindStalls}:${userId}:${stallIdentifier}`) : await getStallById(root);
  const userRes = await getUserById(stallRes.userId);
  const shippingZonesRes = await getShippingZonesByStallId(stallRes.id);
  return {
    stall: stallRes,
    user: userRes,
    zones: shippingZonesRes
  };
};
export {
  load
};
