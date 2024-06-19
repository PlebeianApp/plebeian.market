import { e as error, j as json } from "../../../../../chunks/index.js";
import { u as usersFilterSchema } from "../../../../../chunks/schema.js";
import { d as decodeJwtToEvent } from "../../../../../chunks/nostrAuth.service.js";
import { g as getRichUsers, a as getUsersByRole, b as getAllUsers, c as createUser } from "../../../../../chunks/users.service.js";
const GET = async ({ request, url: { searchParams } }) => {
  const authorizationHeader = request.headers.get("Authorization");
  const spObj = Object.fromEntries(searchParams);
  const filter = usersFilterSchema.safeParse(spObj);
  if (!filter.success) {
    return error(400, `Invalid request: ${JSON.stringify(filter.error)}`);
  }
  if (authorizationHeader) {
    const token = decodeJwtToEvent(authorizationHeader);
    if (token && filter.data.userId) {
      const users2 = await getRichUsers(filter.data);
      return json(users2);
    } else if (token && filter.data.role) {
      const users2 = await getUsersByRole(filter.data);
      return json(users2);
    }
  }
  const users = await getAllUsers(filter.data);
  const usersUnAuthResponse = users.map((user) => ({
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
  }));
  return json(usersUnAuthResponse);
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    return json(await createUser(body));
  } catch (e) {
    console.log("e", e);
    error(500, JSON.stringify(e));
  }
};
export {
  GET,
  POST
};
