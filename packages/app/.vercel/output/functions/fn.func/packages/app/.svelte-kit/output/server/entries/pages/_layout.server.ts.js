import { g as getAppSettings } from "../../chunks/setup.service.js";
import "../../chunks/types.js";
import { P as PAYMENT_DETAILS_METHOD } from "../../chunks/constants.js";
import "../../chunks/utils.js";
const load = async () => {
  return {
    appSettings: await getAppSettings(),
    paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD)
  };
};
const prerender = false;
export {
  load,
  prerender
};
