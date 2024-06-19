import { j as json, e as error } from "../../../../../../chunks/index.js";
import { a as KindStalls } from "../../../../../../chunks/constants2.js";
import { v as verifyAndPersistRawEvent } from "../../../../../../chunks/nostrEvents.service.js";
import { j as getStallById, k as updateStall, f as deleteProduct } from "../../../../../../chunks/products.service.js";
const GET = async ({ params }) => {
  return json(await getStallById(params.stallId));
};
const PUT = async ({ params, request }) => {
  try {
    const verifiedEvent = await verifyAndPersistRawEvent(request, KindStalls);
    return json(await updateStall(params.stallId, verifiedEvent));
  } catch (e) {
    error(500, JSON.stringify(e));
  }
};
const DELETE = async ({ params }) => {
  return json(await deleteProduct(params.stallId));
};
export {
  DELETE,
  GET,
  PUT
};
