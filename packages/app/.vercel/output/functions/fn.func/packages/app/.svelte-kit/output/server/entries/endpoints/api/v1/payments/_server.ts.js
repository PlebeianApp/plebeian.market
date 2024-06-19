import { e as error, j as json } from "../../../../../chunks/index.js";
import { a as authorize } from "../../../../../chunks/auth.js";
import { g as getPaymentDetailsByUserId, c as createPaymentDetail, u as updatePaymentDetail, d as deletePaymentDetail } from "../../../../../chunks/paymentDetails.service.js";
const GET = async ({ request, url: { searchParams } }) => {
  const userId = searchParams.get("userId");
  if (!userId) {
    error(400, "Invalid request");
  }
  try {
    await authorize(request, userId, "GET");
  } catch (e) {
    error(401, "Unauthorized");
  }
  const paymentDetails = await getPaymentDetailsByUserId(userId);
  return json(paymentDetails);
};
const POST = async ({ request, url: { searchParams } }) => {
  const userId = searchParams.get("userId");
  if (!userId) {
    error(400, "Invalid request");
  }
  try {
    await authorize(request, userId, "POST");
  } catch (e) {
    error(401, "Unauthorized");
  }
  const paymentDetail = await request.json();
  const insertPaymentDetail = {
    ...paymentDetail,
    userId
  };
  const newPaymentDetail = await createPaymentDetail(insertPaymentDetail);
  return json(newPaymentDetail);
};
const PUT = async ({ request, url: { searchParams } }) => {
  const userId = searchParams.get("userId");
  const paymentDetailId = searchParams.get("paymentDetailId");
  if (!userId || !paymentDetailId) {
    error(400, "Invalid request");
  }
  try {
    await authorize(request, userId, "PUT");
  } catch (e) {
    error(401, "Unauthorized");
  }
  const paymentDetail = await request.json();
  const updatedPaymentDetail = await updatePaymentDetail(paymentDetailId, paymentDetail);
  return json(updatedPaymentDetail);
};
const DELETE = async ({ request, url: { searchParams } }) => {
  const userId = searchParams.get("userId");
  const paymentDetailId = searchParams.get("paymentDetailId");
  if (!userId || !paymentDetailId) {
    error(400, "Invalid request");
  }
  try {
    await authorize(request, userId, "DELETE");
  } catch (e) {
    error(401, "Unauthorized");
  }
  const deleted = await deletePaymentDetail(paymentDetailId);
  if (!deleted) {
    error(404, "Payment detail not found");
  }
  return json({ deleted });
};
export {
  DELETE,
  GET,
  POST,
  PUT
};
