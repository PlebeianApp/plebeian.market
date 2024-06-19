import { j as json, e as error } from "../../../../../../chunks/index.js";
import { a as authorize } from "../../../../../../chunks/auth.js";
import { u as usersFilterSchema } from "../../../../../../chunks/schema.js";
import { g as getRichUsers, d as getUserById, u as userExists, e as updateUser, f as deleteUser } from "../../../../../../chunks/users.service.js";
const GET = async ({ params, request, url: { searchParams } }) => {
  const { userId } = params;
  try {
    await authorize(request, userId, "GET");
    const [userRes] = await getRichUsers(usersFilterSchema.parse({ userId }));
    return json(userRes);
  } catch (e) {
    if (e.status === 401) {
      if (!searchParams.has("exists")) {
        const user = await getUserById(userId);
        const userUnAuthResponse = {
          id: user.id,
          created_at: user.createdAt.getTime() / 1e3,
          name: user.name,
          displayName: user.displayName,
          about: user.about,
          image: user.image,
          banner: user.banner,
          nip05: user.nip05,
          lud06: user.lud06,
          lud16: user.lud16,
          zapService: user.zapService,
          website: user.website
        };
        return json(userUnAuthResponse);
      } else {
        return json(await userExists(userId));
      }
    }
    throw e;
  }
};
const PUT = async ({ params, request }) => {
  const { userId } = params;
  try {
    await authorize(request, userId, "PUT");
    const body = await request.json();
    return json(await updateUser(userId, body));
  } catch (e) {
    if (e.status) {
      return error(e.status, e.message);
    }
    return error(500, JSON.stringify(e));
  }
};
const DELETE = async ({ params, request }) => {
  const { userId } = params;
  try {
    await authorize(request, userId, "DELETE");
    return json(await deleteUser(userId));
  } catch (e) {
    if (e.status) {
      return error(e.status, e.message);
    }
    return error(500, JSON.stringify(e));
  }
};
export {
  DELETE,
  GET,
  PUT
};
