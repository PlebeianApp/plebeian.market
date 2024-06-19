import { g as get_store_value } from "./utils3.js";
import { c as createMutation } from "./createMutation.js";
import { g as goto } from "./client.js";
import { n as ndkStore } from "./ndk.js";
import { d as deleteAccount } from "./session.js";
import { c as createRequest, q as queryClient } from "./client2.js";
const userDataMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async (profile) => {
      const $ndkStore = get_store_value(ndkStore);
      if ($ndkStore.activeUser?.pubkey) {
        const user = await createRequest(`PUT /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
          auth: true,
          body: profile
        });
        return user;
      }
      return null;
    },
    onSuccess: (data) => {
      const $ndkStore = get_store_value(ndkStore);
      queryClient.invalidateQueries({ queryKey: ["user", $ndkStore.activeUser?.pubkey] });
      queryClient.setQueryData(["user", $ndkStore.activeUser?.pubkey], data);
    }
  },
  queryClient
);
const userDeleteAccountMutation = createMutation(
  {
    mutationFn: async () => {
      const $ndkStore = get_store_value(ndkStore);
      const ndkUser = $ndkStore.getUser({
        hexpubkey: $ndkStore.activeUser?.pubkey
      });
      if ($ndkStore.activeUser?.pubkey) {
        const deleted = await createRequest(`DELETE /api/v1/users/${ndkUser.pubkey}`, {
          auth: true
        });
        return deleted;
      }
      return null;
    },
    onSuccess: () => {
      const $ndkStore = get_store_value(ndkStore);
      deleteAccount($ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : "");
      delete $ndkStore.signer;
      goto();
    }
  },
  queryClient
);
export {
  userDataMutation as a,
  userDeleteAccountMutation as u
};
