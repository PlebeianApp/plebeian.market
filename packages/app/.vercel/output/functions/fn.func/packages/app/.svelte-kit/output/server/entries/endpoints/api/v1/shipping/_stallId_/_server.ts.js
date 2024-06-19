import { j as json } from "../../../../../../chunks/index.js";
import { g as getShippingByStallId } from "../../../../../../chunks/shipping.service.js";
const GET = async ({ params }) => {
  return json(await getShippingByStallId(params.stallId));
};
export {
  GET
};
