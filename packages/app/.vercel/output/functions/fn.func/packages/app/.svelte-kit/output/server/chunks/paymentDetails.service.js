import { e as error } from "./index.js";
import { d as db, e as eq, p as paymentDetails, a as and } from "./types.js";
import "./constants.js";
import "./utils.js";
const stallHasDefaultPaymentDetail = async (stallId) => {
  const [paymentDetailsByStall] = await db.query.paymentDetails.findMany({
    where: and(eq(paymentDetails.stallId, stallId), eq(paymentDetails.isDefault, true))
  });
  if (!paymentDetailsByStall)
    return null;
  return paymentDetailsByStall.id || null;
};
const unsetDefaultsForStall = async (stallId) => {
  const paymentDetailsByStall = await db.query.paymentDetails.findMany({
    where: eq(paymentDetails.stallId, stallId)
  });
  await Promise.all(
    paymentDetailsByStall.map(
      (pd) => db.update(paymentDetails).set({ isDefault: false }).where(and(eq(paymentDetails.id, pd.id), eq(paymentDetails.isDefault, true)))
    )
  );
};
const enrichWithStallName = async (detail) => {
  const stall = await db.query.stalls.findFirst({
    where: (stalls) => eq(stalls.id, detail.stallId)
  });
  return {
    ...detail,
    stallName: stall?.name || ""
  };
};
const getPaymentDetailsByUserId = async (userId) => {
  const details = await db.query.paymentDetails.findMany({
    where: eq(paymentDetails.userId, userId)
  });
  return await Promise.all(details.map(enrichWithStallName));
};
const createPaymentDetail = async (paymentDetail) => {
  const intentToSetDefault = paymentDetail.stallId ? !!paymentDetail.isDefault : false;
  if (intentToSetDefault && paymentDetail.stallId) {
    const defaultPaymentDetailId = await stallHasDefaultPaymentDetail(paymentDetail.stallId);
    if (defaultPaymentDetailId) {
      await unsetDefaultsForStall(paymentDetail.stallId);
    }
  }
  const [newPaymentDetails] = await db.insert(paymentDetails).values(paymentDetail).returning();
  return enrichWithStallName(newPaymentDetails);
};
const updatePaymentDetail = async (paymentDetailId, paymentDetail) => {
  const intentToSetDefault = paymentDetail.stallId ? !!paymentDetail.isDefault : false;
  if (intentToSetDefault && paymentDetail.stallId) {
    const defaultPaymentDetailId = await stallHasDefaultPaymentDetail(paymentDetail.stallId);
    if (defaultPaymentDetailId) {
      await unsetDefaultsForStall(paymentDetail.stallId);
    }
  }
  const [updatedPaymentDetail] = await db.update(paymentDetails).set(paymentDetail).where(eq(paymentDetails.id, paymentDetailId)).returning();
  return enrichWithStallName(updatedPaymentDetail);
};
const deletePaymentDetail = async (paymentDetailId) => {
  const [deleted] = await db.delete(paymentDetails).where(eq(paymentDetails.id, paymentDetailId)).returning();
  return !!deleted;
};
const getPaymentDetailsByStallId = async (stallId) => {
  const paymentDetailsForStall = await db.query.paymentDetails.findMany({
    where: eq(paymentDetails.stallId, stallId)
  });
  return await Promise.all(paymentDetailsForStall.map(enrichWithStallName));
};
const setDefaultPaymentDetail = async (paymentDetailId, stallId) => {
  const targetStall = await db.query.stalls.findFirst({
    where: (stalls) => eq(stalls.id, stallId)
  });
  if (!targetStall) {
    error(404, "Stall not found");
  }
  await unsetDefaultsForStall(targetStall.id);
  const [updatedPaymentDetail] = await db.update(paymentDetails).set({ isDefault: true }).where(eq(paymentDetails.id, paymentDetailId)).returning();
  return enrichWithStallName(updatedPaymentDetail);
};
export {
  getPaymentDetailsByStallId as a,
  createPaymentDetail as c,
  deletePaymentDetail as d,
  getPaymentDetailsByUserId as g,
  setDefaultPaymentDetail as s,
  updatePaymentDetail as u
};
