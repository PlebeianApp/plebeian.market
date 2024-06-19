import { e as error, j as json } from "../../../../../../chunks/index.js";
import { b as authorizeUserless } from "../../../../../../chunks/auth.js";
import { a as getPaymentDetailsByStallId, s as setDefaultPaymentDetail } from "../../../../../../chunks/paymentDetails.service.js";
const GET = async ({ params, request }) => {
  const stallId = params.stallId;
  try {
    const userId = await authorizeUserless(request, "GET");
  } catch (e) {
    error(401, "Unauthorized");
  }
  const paymentDetails = await getPaymentDetailsByStallId(stallId);
  return json(paymentDetails);
};
const POST = async ({ params, request, url: { searchParams } }) => {
  const stallId = params.stallId;
  const paymentDetailId = searchParams.get("paymentDetailId");
  if (!paymentDetailId) {
    error(400, "Invalid request");
  }
  try {
    const userId = await authorizeUserless(request, "POST");
  } catch (e) {
    error(401, "Unauthorized");
  }
  const paymentDetails = await setDefaultPaymentDetail(paymentDetailId, stallId);
  return json(paymentDetails);
};
export {
  GET,
  POST
};
