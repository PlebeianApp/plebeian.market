import { e as error, j as json } from "../../../../../chunks/index.js";
import { a as KindStalls } from "../../../../../chunks/constants2.js";
import { s as stallsFilterSchema } from "../../../../../chunks/schema.js";
import { v as verifyAndPersistRawEvent } from "../../../../../chunks/nostrEvents.service.js";
import { h as getAllStalls, i as createStall } from "../../../../../chunks/products.service.js";
async function GET({ url: { searchParams } }) {
  const spObj = Object.fromEntries(searchParams);
  const filter = stallsFilterSchema.safeParse(spObj);
  if (!filter.success) {
    return error(400, `Invalid request: ${JSON.stringify(filter.error)}`);
  } else {
    return json(await getAllStalls(filter.data));
  }
}
async function POST({ request }) {
  try {
    const verifiedEvent = await verifyAndPersistRawEvent(request, KindStalls);
    return json(await createStall(verifiedEvent));
  } catch (e) {
    console.log("error", e);
    error(500, JSON.stringify(e));
  }
}
export {
  GET,
  POST
};
