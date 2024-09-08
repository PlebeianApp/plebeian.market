import { OrderFilter, orderSchema } from "$lib/schema";
import { createId, db, eq, orders, OrderStatus } from "@plebeian/database";
import { getAppSettings } from "./setup.service";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { ndk } from "$lib/stores/ndk";
import { authorize } from "$lib/auth";
import { error, json } from '@sveltejs/kit'

export const createOrder = async (orderFilter: OrderFilter) => {
  const { data, success } = orderSchema.safeParse({
    id: createId(),
    ...orderFilter,
  });
  console.log(data, success);

  if (!success) throw Error(`Invalid stall event data`);
  await db.insert(orders).values(data);

  const { instanceSk } = await getAppSettings();

  const signer = new NDKPrivateKeySigner(instanceSk);
  ndk.signer = signer;

  await ndk.connect();

  const testPubkey =
    "9e77eabc6b7c575a619ab7ce235b3d99443ff33b8b9d805eacc5ec3a38a48976";
  const recipient = ndk.getUser({ pubkey: testPubkey });
  await recipient.fetchProfile();
  const dm = new NDKEvent(ndk);
  dm.kind = 4;
  dm.content = await signer.encrypt(recipient, JSON.stringify(data));
  dm.tags = [["p", recipient.pubkey]];
  await dm.publish();

  return data;
};

export const updateOrder = async (
  request: Request,
  orderId: string,
  orderFilter: Partial<OrderFilter>,
) => {
  const [{ sellerUserId, buyerUserId }] = await db
    .select({
      sellerUserId: orders.sellerUserId,
      buyerUserId: orders.sellerUserId,
    })
    .from(orders)
    .where(eq(orders.id, orderId));

  let authorized = false;

  try {
    await authorize(request, sellerUserId, "PUT");
    authorized = true;
  } catch {}

  try {
    await authorize(request, buyerUserId, "PUT");
    authorized = true;
  } catch {}

  if (!authorized) {
    throw error(401, 'Only the merchant and the buyer can make modify the order')
  }

  const [order] = await db.update(orders).set(orderFilter).where(eq(orders.id, orderId)).returning();
  return order
};
