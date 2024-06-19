import { d as derived } from "./index2.js";
import { c as createQuery } from "./createQuery.js";
import { i as invalidateAll } from "./client.js";
import "./schema.js";
import { n as ndkStore } from "./ndk.js";
import { c as createRequest, q as queryClient } from "./client2.js";
const activeUserQuery = createQuery(
  derived(ndkStore, ($ndkStore) => ({
    queryKey: ["user", $ndkStore.activeUser?.pubkey],
    queryFn: async () => {
      if ($ndkStore.activeUser?.pubkey) {
        const user = await createRequest(`GET /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
          auth: true
        });
        invalidateAll();
        return user;
      }
      return null;
    },
    enabled: !!$ndkStore.activeUser?.pubkey
  })),
  queryClient
);
const createUserByIdQuery = (id) => createQuery(
  {
    queryKey: ["users", id],
    queryFn: async () => {
      const user = await createRequest(`GET /api/v1/users/${id}`, {});
      return user;
    },
    enabled: !!id
  },
  queryClient
);
export {
  activeUserQuery as a,
  createUserByIdQuery as c
};
