import { e as error, j as json } from "../../../chunks/index.js";
import { i as initialSetupDataSchema } from "../../../chunks/schema.js";
import { d as doSetup } from "../../../chunks/setup.service.js";
const POST = async ({ request }) => {
  const bodyRes = await request.json();
  if (bodyRes.adminsList) {
    bodyRes.adminsList = bodyRes.adminsList.toString().split(",");
  }
  const parsedSetupData = initialSetupDataSchema.safeParse(bodyRes);
  if (!parsedSetupData.success) {
    error(400, parsedSetupData.error);
  }
  const setupRes = await doSetup(bodyRes, parsedSetupData.data.adminsList);
  return json(setupRes);
};
export {
  POST
};
