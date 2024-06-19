import { s as subscribe } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, f as escape } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { B as Button } from "../../../../../chunks/index3.js";
import { I as Input } from "../../../../../chunks/input.js";
import { u as userDeleteAccountMutation } from "../../../../../chunks/users.mutations.js";
import "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import "../../../../../chunks/constants2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_userDeleteAccountMutation;
  let $page, $$unsubscribe_page;
  $$unsubscribe_userDeleteAccountMutation = subscribe(userDeleteAccountMutation, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let challengeSolved = false;
  let { data } = $$props;
  const linkDetails = data.menuItems.find((item) => item.value === "account-settings")?.links.find((item) => item.href === $page.url.pathname);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_userDeleteAccountMutation();
  $$unsubscribe_page();
  return `<div class="pb-4 space-y-2"><div class="flex items-center gap-1">${validate_component(Button, "Button").$$render(
    $$result,
    {
      size: "icon",
      variant: "outline",
      class: " border-none"
    },
    {},
    {
      default: () => {
        return `<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6"></span>`;
      }
    }
  )} <section><h3 class="text-lg font-bold">${escape(linkDetails?.title)}</h3> <p class="text-gray-600">${escape(linkDetails?.description)}</p></section></div> <div class="flex flex-col gap-4"><div class="flex flex-col gap-4"><p class="text-lg" data-svelte-h="svelte-bykf64">Are you sure you want to delete your account?</p> <p class="text-sm" data-svelte-h="svelte-3f78r3">This action is irreversible and will delete all your data.</p> <p class="text-sm" data-svelte-h="svelte-1t35vw6">Please type <strong>DELETE</strong> to confirm</p> <div class="flex flex-col gap-4">${validate_component(Input, "Input").$$render(
    $$result,
    {
      id: "accountDeletionChallenge",
      type: "password"
    },
    {},
    {}
  )} ${validate_component(Button, "Button").$$render(
    $$result,
    {
      id: "executeDeletion",
      disabled: !challengeSolved,
      class: "w-full font-bold bg-destructive"
    },
    {},
    {
      default: () => {
        return `Delete account`;
      }
    }
  )}</div></div></div></div>`;
});
export {
  Page as default
};
