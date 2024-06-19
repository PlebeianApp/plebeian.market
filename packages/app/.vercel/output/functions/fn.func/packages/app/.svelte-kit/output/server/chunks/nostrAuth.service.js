import { NSchema } from "@nostrify/nostrify";
import { e as error } from "./index.js";
import { b as KindHttpAuth } from "./constants2.js";
import { verifyEvent } from "nostr-tools";
import "./types.js";
import "./constants.js";
import "./utils.js";
const decodeJwtToEvent = (jwt) => {
  const [nostr, token] = jwt.split(" ");
  if (nostr !== "Nostr") {
    error(500, "Invalid JWT");
  }
  const decoded = Buffer.from(token, "base64").toString("utf8");
  const decodedJson = JSON.parse(decoded);
  const verifiedEvent = NSchema.event().refine(verifyEvent).refine((val) => val.kind === KindHttpAuth).safeParse(decodedJson);
  if (!verifiedEvent.success) {
    error(500, `Invalid JWT: ${JSON.stringify(verifiedEvent.error)}`);
  }
  return verifiedEvent.data;
};
export {
  decodeJwtToEvent as d
};
