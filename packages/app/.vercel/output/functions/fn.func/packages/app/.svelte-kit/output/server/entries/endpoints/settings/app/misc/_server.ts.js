import { e as error, j as json } from "../../../../../chunks/index.js";
import { i as initialSetupDataSchema } from "../../../../../chunks/schema.js";
import { u as updateAppSettings } from "../../../../../chunks/setup.service.js";
const PUT = async ({ request }) => {
  const bodyRes = await request.json();
  if (bodyRes.adminsList) {
    bodyRes.adminsList = bodyRes.adminsList.toString().split(",");
  }
  bodyRes.allowRegister = JSON.parse(bodyRes.allowRegister);
  const parsedSetupData = initialSetupDataSchema.safeParse(bodyRes);
  if (!parsedSetupData.success) {
    error(400, parsedSetupData.error);
  }
  const setupRes = await updateAppSettings(parsedSetupData.data);
  return json(setupRes);
};
export {
  PUT
};
