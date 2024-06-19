import { u as usersFilterSchema } from "../../../chunks/schema.js";
import { a as getUsersByRole } from "../../../chunks/users.service.js";
import { U as USER_ROLES, g as CURRENCIES } from "../../../chunks/constants.js";
const load = async () => {
  const currencies = CURRENCIES;
  const adminUsers = await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN }));
  return { currencies, adminUsers };
};
export {
  load
};
