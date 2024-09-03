import { OrderFilter, orderSchema } from "$lib/schema";
import { createId, db, orders } from "@plebeian/database";
import { getAppSettings } from "./setup.service";
import { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { ndk } from "$lib/stores/ndk";

export const createOrder = async (orderFilter: OrderFilter) => {
  const { data, success } = orderSchema.safeParse({
    id: createId(),
    ...orderFilter,
  });
  console.log(data, success);

  if (!success) throw Error(`Invalid stall event data`);
  await db.insert(orders).values(data)

  const {instanceSk} = await getAppSettings()

  const signer = new NDKPrivateKeySigner(instanceSk)
  ndk.signer = signer

  await ndk.connect()

  const testPubkey = "9e77eabc6b7c575a619ab7ce235b3d99443ff33b8b9d805eacc5ec3a38a48976"
	const recipient = ndk.getUser({ pubkey: testPubkey })
  await recipient.fetchProfile()
	const dm = new NDKEvent(ndk)
	dm.kind = 4
	dm.content = await signer.encrypt(recipient, JSON.stringify(data))
	dm.tags = [['p', recipient.pubkey]]
	await dm.publish()
