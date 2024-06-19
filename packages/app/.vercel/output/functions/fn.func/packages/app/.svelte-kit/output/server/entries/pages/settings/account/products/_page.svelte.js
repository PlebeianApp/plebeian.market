import { g as get_store_value, s as subscribe, n as noop } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, f as escape, e as each } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { B as Button } from "../../../../../chunks/index3.js";
import { a as ndk, n as ndkStore } from "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import { K as KindProducts } from "../../../../../chunks/constants2.js";
import "../../../../../chunks/create.js";
import "../../../../../chunks/ctx.js";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { c as createMutation } from "../../../../../chunks/createMutation.js";
import { c as createId } from "../../../../../chunks/utils.js";
import { q as queryClient } from "../../../../../chunks/client2.js";
import "../../../../../chunks/schema.js";
import "../../../../../chunks/constants.js";
import { c as createProductsByFilterQuery } from "../../../../../chunks/spinner.svelte_svelte_type_style_lang.js";
import { S as Skeleton } from "../../../../../chunks/skeleton.js";
createMutation(
  {
    mutationFn: async ([sEvent, product, images, shippingMethods]) => {
      const $ndkStore = get_store_value(ndkStore);
      if (!$ndkStore.activeUser?.pubkey)
        return;
      const formData = new FormData(sEvent.currentTarget);
      const identifier = product?.identifier ? product.identifier : createId();
      const evContent = {
        id: identifier,
        stall_id: product?.stallId,
        name: formData.get("title"),
        description: formData.get("description"),
        // TODO: implement image uploading in a seperate api
        images,
        price: Number(formData.get("price")),
        quantity: Number(formData.get("quantity")),
        shipping: shippingMethods,
        currency: product?.currency
      };
      const newEvent = new NDKEvent($ndkStore, {
        kind: KindProducts,
        pubkey: $ndkStore.activeUser.pubkey,
        content: JSON.stringify(evContent),
        created_at: Math.floor(Date.now()),
        tags: [["d", identifier]]
      });
      await newEvent.sign(ndk.signer);
      const nostrEvent = await newEvent.toNostrEvent();
      const result = await fetch(new URL(product ? `/api/v1/products/${product.id}` : "/api/v1/products", window.location.origin), {
        // TODO: POST & PUT?
        method: "POST",
        body: JSON.stringify(nostrEvent),
        headers: {
          "Content-Type": "application/json"
        }
      }).then((response) => response.json());
      return result;
    }
  },
  queryClient
);
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let productsQuery;
  let $page, $$unsubscribe_page;
  let $productsQuery, $$unsubscribe_productsQuery = noop, $$subscribe_productsQuery = () => ($$unsubscribe_productsQuery(), $$unsubscribe_productsQuery = subscribe(productsQuery, ($$value) => $productsQuery = $$value), productsQuery);
  let $ndkStore, $$unsubscribe_ndkStore;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_ndkStore = subscribe(ndkStore, (value) => $ndkStore = value);
  let { data } = $$props;
  const linkDetails = data.menuItems.find((item) => item.value === "account-settings")?.links.find((item) => item.href === $page.url.pathname);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$subscribe_productsQuery(productsQuery = $ndkStore.activeUser?.pubkey ? createProductsByFilterQuery({ userId: $ndkStore.activeUser.pubkey }) : null);
  {
    $productsQuery?.refetch();
  }
  $$unsubscribe_page();
  $$unsubscribe_productsQuery();
  $$unsubscribe_ndkStore();
  return `<div class="pb-4 space-y-2">${`<div class="flex justify-between items-center"><div class="flex items-center gap-1">${validate_component(Button, "Button").$$render(
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
  )} <section><h3 class="text-lg font-bold">${escape(linkDetails?.title)}</h3> <p class="text-gray-600">${escape(linkDetails?.description)}</p></section></div> ${validate_component(Button, "Button").$$render(
    $$result,
    {
      variant: "outline",
      class: "border-2 border-black font-bold px-6"
    },
    {},
    {
      default: () => {
        return `New`;
      }
    }
  )}</div>`} <div class="flex flex-col gap-2">${`${$productsQuery?.isLoading ? `${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-full" }, {}, {})}` : ``} ${each([...$productsQuery?.data ?? []], (product) => {
    return `${validate_component(Button, "Button").$$render(
      $$result,
      {
        class: "cursor-pointer border border-gray flex justify-start items-center p-4 font-bold",
        variant: "outline"
      },
      {},
      {
        default: () => {
          return `<div class="flex items-center gap-2"><span class="i-tdesign-store w-6 h-6"></span> <span>${escape(product.name)}</span></div> `;
        }
      }
    )}`;
  })}`}</div></div>`;
});
export {
  Page as default
};
