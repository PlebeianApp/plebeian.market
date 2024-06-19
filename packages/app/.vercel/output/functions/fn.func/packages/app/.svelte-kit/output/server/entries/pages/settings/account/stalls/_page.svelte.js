import { s as subscribe, n as noop } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, f as escape, v as validate_component, e as each, a as add_attribute } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { a as createProductPriceQuery, c as createProductsByFilterQuery } from "../../../../../chunks/spinner.svelte_svelte_type_style_lang.js";
import { S as Spinner, I as ImgPlaceHolder } from "../../../../../chunks/imgPlaceHolder.js";
import { S as Separator } from "../../../../../chunks/separator.js";
import "@nostr-dev-kit/ndk";
import { B as Button } from "../../../../../chunks/index3.js";
import "../../../../../chunks/ctx.js";
import "../../../../../chunks/create.js";
import { n as ndkStore } from "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import "../../../../../chunks/constants2.js";
import "../../../../../chunks/constants.js";
import "../../../../../chunks/utils.js";
import "../../../../../chunks/nostr-events.js";
import { c as createStallsByFilterQuery, R as Root, T as Trigger, C as Collapsible_content } from "../../../../../chunks/payments.queries.js";
import { S as Skeleton } from "../../../../../chunks/skeleton.js";
const Sat_price_loader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let priceQuery;
  let $priceQuery, $$unsubscribe_priceQuery = noop, $$subscribe_priceQuery = () => ($$unsubscribe_priceQuery(), $$unsubscribe_priceQuery = subscribe(priceQuery, ($$value) => $priceQuery = $$value), priceQuery);
  let { product } = $$props;
  if ($$props.product === void 0 && $$bindings.product && product !== void 0)
    $$bindings.product(product);
  $$subscribe_priceQuery(priceQuery = createProductPriceQuery(product));
  $$unsubscribe_priceQuery();
  return `<span>${escape($priceQuery.data)} sats</span>`;
});
const Stall_product_list = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let productsByStall;
  let $productsByStall, $$unsubscribe_productsByStall = noop, $$subscribe_productsByStall = () => ($$unsubscribe_productsByStall(), $$unsubscribe_productsByStall = subscribe(productsByStall, ($$value) => $productsByStall = $$value), productsByStall);
  let { stall } = $$props;
  if ($$props.stall === void 0 && $$bindings.stall && stall !== void 0)
    $$bindings.stall(stall);
  $$subscribe_productsByStall(productsByStall = createProductsByFilterQuery({ stallId: stall.id }));
  $$unsubscribe_productsByStall();
  return `<div>${$productsByStall.isLoading ? `${validate_component(Spinner, "Spinner").$$render($$result, {}, {}, {})}` : `${$productsByStall.data ? `${each($productsByStall.data, (product) => {
    return `<a class="flex flex-row justify-between my-4 gap-2" href="${"/products/" + escape(product.id, true)}">${product.galleryImages[0] ? `<img class="contain h-[60px] aspect-square object-cover"${add_attribute("src", product.galleryImages[0], 0)} alt="">` : `${validate_component(ImgPlaceHolder, "ImgPlaceHolder").$$render($$result, { imageType: "mini" }, {}, {})}`} <div class="flex flex-col flex-grow justify-between"><div>${escape(product.name)}</div> <div class="max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">${escape(product.description)}</div></div> <div class="flex flex-col justify-between text-right">${validate_component(Sat_price_loader, "SatPriceLoader").$$render($$result, { product }, {}, {})} <div>(${escape(product.currency)} ${escape(product.price)})</div> </div></a> ${validate_component(Separator, "Separator").$$render($$result, {}, {}, {})}`;
  })}` : ``}`}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let stallsQuery;
  let $page, $$unsubscribe_page;
  let $stallsQuery, $$unsubscribe_stallsQuery = noop, $$subscribe_stallsQuery = () => ($$unsubscribe_stallsQuery(), $$unsubscribe_stallsQuery = subscribe(stallsQuery, ($$value) => $stallsQuery = $$value), stallsQuery);
  let $ndkStore, $$unsubscribe_ndkStore;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_ndkStore = subscribe(ndkStore, (value) => $ndkStore = value);
  let { data } = $$props;
  const linkDetails = data.menuItems.find((item) => item.value === "account-settings")?.links.find((item) => item.href === $page.url.pathname);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$subscribe_stallsQuery(stallsQuery = createStallsByFilterQuery({ userId: $ndkStore.activeUser?.pubkey }));
  {
    $stallsQuery.refetch();
  }
  $$unsubscribe_page();
  $$unsubscribe_stallsQuery();
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
  )}</div>`} <div class="flex flex-col gap-2">${`${$stallsQuery && $stallsQuery.isLoading ? `${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-full" }, {}, {})}` : `${$stallsQuery && $stallsQuery.data ? `${each([...$stallsQuery.data ?? []], (stall) => {
    return `${validate_component(Root, "Collapsible.Root").$$render($$result, { class: "border-black border p-2" }, {}, {
      default: () => {
        return `<div class="flex flex-row">${validate_component(Trigger, "Collapsible.Trigger").$$render(
          $$result,
          {
            class: "flex flex-row w-full items-center justify-between gap-2"
          },
          {},
          {
            default: () => {
              return `<div class="flex items-center gap-2 font-bold"><span class="i-tdesign-store w-6 h-6"></span> <span>${escape(stall.name)}</span></div> <span class="i-mdi-keyboard-arrow-down w-6 h-6"></span> `;
            }
          }
        )} ${validate_component(Button, "Button").$$render(
          $$result,
          {
            class: "cursor-pointer border border-gray font-bold",
            variant: "outline",
            size: "icon"
          },
          {},
          {
            default: () => {
              return `<span class="i-mdi-pencil-outline w-6 h-6"></span> `;
            }
          }
        )}</div> ${validate_component(Collapsible_content, "Collapsible.Content").$$render($$result, { class: "flex flex-col gap-4 py-4" }, {}, {
          default: () => {
            return `${validate_component(Stall_product_list, "StallProductList").$$render($$result, { stall }, {}, {})} `;
          }
        })} `;
      }
    })}`;
  })}` : ``}`}`}</div></div>`;
});
export {
  Page as default
};
