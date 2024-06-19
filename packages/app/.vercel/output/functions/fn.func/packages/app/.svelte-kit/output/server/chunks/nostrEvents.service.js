import { NSchema } from "@nostrify/nostrify";
import { e as error } from "./index.js";
import { i as isPReplacEvent, g as getEventCoordinates } from "./utils2.js";
import { verifyEvent } from "nostr-tools";
import { d as db, b as events, e as eq, u as users } from "./types.js";
import "./constants.js";
import "./utils.js";
const verifyEventBody = async (event, kind) => {
  const body = await event.json();
  const verifiedEvent = NSchema.event().refine(verifyEvent).refine((val) => val.kind === kind).safeParse(body);
  if (!verifiedEvent.success) {
    error(400, `Invalid nostr Event: ${JSON.stringify(verifiedEvent.error)}`);
  }
  return verifiedEvent.data;
};
const ensureAuthorExists = async (pubkey) => {
  const [authorExists] = await db.select().from(users).where(eq(users.id, pubkey)).execute();
  if (!authorExists.id) {
    const [newUser] = await db.insert(users).values({ id: pubkey }).returning();
    if (!newUser.id) {
      error(500, "Failed to insert user");
    }
    return newUser.id;
  }
  return authorExists.id;
};
const persistEvent = async (event) => {
  await ensureAuthorExists(event.pubkey);
  const eventTargetId = isPReplacEvent(event.kind) ? getEventCoordinates(event).coordinates : event.id;
  const eventExists = await db.select().from(events).where(eq(events.id, eventTargetId)).execute();
  const eventResult = await (eventExists ? db.update(events).set({ event: JSON.stringify(event) }).where(eq(events.id, eventTargetId)).returning() : db.insert(events).values({ id: eventTargetId, kind: event.kind, event: JSON.stringify(event), author: event.pubkey }).returning());
  if (!eventResult) {
    error(500, "Failed to persist event");
  }
};
const verifyAndPersistRawEvent = async (event, kind) => {
  const verifiedEvent = await verifyEventBody(event, kind);
  await persistEvent(verifiedEvent);
  return verifiedEvent;
};
export {
  verifyAndPersistRawEvent as v
};
