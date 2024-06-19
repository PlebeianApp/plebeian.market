import { e as error } from "./index.js";
import { u as usersFilterSchema } from "./schema.js";
import { decode } from "nostr-tools/nip19";
import { d as db, c as appSettings, f as userMeta, e as eq, u as users } from "./types.js";
import { U as USER_ROLES, a as USER_META } from "./constants.js";
import "./utils.js";
import { a as getUsersByRole } from "./users.service.js";
const getAppSettings = async () => {
  const [appSettingsRes] = await db.select().from(appSettings).execute();
  return appSettingsRes;
};
const doSetup = async (setupData) => {
  if (!setupData.instancePk) {
    error(400, "Invalid request");
  }
  const decodedInstancePk = setupData.instancePk.startsWith("npub") ? decode(setupData.instancePk).data.toString() : setupData.instancePk;
  const decodedOwnerPk = setupData.ownerPk ? decode(setupData.ownerPk).data.toString() : null;
  const updatedAppSettings = await updateAppSettings({
    ...setupData,
    isFirstTimeRunning: true,
    instancePk: decodedInstancePk,
    defaultCurrency: setupData.defaultCurrency,
    ownerPk: decodedOwnerPk,
    allowRegister: JSON.parse(setupData.allowRegister)
  });
  const insertedUsers = adminsToInsert(setupData);
  return { updatedAppSettings, insertedUsers };
};
const adminsToInsert = async (appSettingsData) => {
  const decodedInstancePk = appSettingsData.instancePk.startsWith("npub") ? decode(appSettingsData.instancePk).data.toString() : appSettingsData.instancePk;
  const decodedOwnerPk = appSettingsData.ownerPk ? decode(appSettingsData.ownerPk).data.toString() : null;
  const adminsToInsert2 = [
    ...decodedInstancePk ? [{ id: decodedInstancePk, role: USER_ROLES.ADMIN }] : [],
    ...decodedOwnerPk ? [{ id: decodedOwnerPk, role: USER_ROLES.ADMIN }] : [],
    ...appSettingsData.adminsList?.map((adminPk) => ({
      id: decode(adminPk).data.toString(),
      role: USER_ROLES.ADMIN
    })) ?? []
  ].filter((admin) => admin?.id !== null);
  const currentAdminUsers = await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN }));
  const usersToInsert = adminsToInsert2.filter((admin) => !currentAdminUsers.includes(admin.id));
  const insertedUsers = await insertUsers(usersToInsert);
  await revokeAdmins(adminsToInsert2, currentAdminUsers);
  return insertedUsers;
};
const revokeAdmins = async (adminsToInsert2, currentAdminUsers) => {
  const revokedAdminUsers = currentAdminUsers.filter((user) => !adminsToInsert2.some((admin) => admin.id === user));
  await Promise.all(
    revokedAdminUsers.map(async (user) => {
      await db.update(userMeta).set({ valueText: USER_ROLES.PLEB }).where(eq(userMeta.userId, user)).execute();
    })
  );
};
const updateAppSettings = async (appSettingsData) => {
  const decodedInstancePk = appSettingsData.instancePk.startsWith("npub") ? decode(appSettingsData.instancePk).data.toString() : appSettingsData.instancePk;
  const decodedOwnerPk = appSettingsData.ownerPk ? decode(appSettingsData.ownerPk).data.toString() : null;
  const [appSettingsRes] = await db.update(appSettings).set({
    ...appSettingsData,
    isFirstTimeRunning: false,
    instancePk: decodedInstancePk,
    ownerPk: decodedOwnerPk,
    allowRegister: JSON.parse(appSettingsData.allowRegister)
  }).where(appSettingsData.isFirstTimeRunning ? eq(appSettings.isFirstTimeRunning, true) : eq(appSettings.instancePk, decodedInstancePk)).returning().execute();
  if (!appSettingsRes) {
    error(500, "Failed to update app settings");
  }
  if (appSettingsData.adminsList) {
    const insertedUsers = await adminsToInsert(appSettingsData);
    return { appSettingsRes, insertedUsers };
  }
  return { appSettingsRes };
};
const insertUsers = async (usersToInsert) => {
  const results = await Promise.all(
    usersToInsert.map(async ({ id, role }) => {
      try {
        await db.transaction(async (trx) => {
          const insertedUser = await trx.insert(users).values({ id }).onConflictDoNothing({ target: users.id }).returning().execute();
          if (insertedUser) {
            await trx.insert(userMeta).values({ userId: id, metaName: USER_META.ROLE.value, valueText: role }).returning().execute();
          }
          return insertedUser;
        });
      } catch (error2) {
        console.error("Error inserting user:", { id, role }, error2);
        return null;
      }
    })
  );
  return results.filter(Boolean);
};
export {
  doSetup as d,
  getAppSettings as g,
  updateAppSettings as u
};
