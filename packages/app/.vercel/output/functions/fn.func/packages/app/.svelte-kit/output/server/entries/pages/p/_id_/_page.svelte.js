import { c as create_ssr_component, v as validate_component, f as escape, e as each } from "../../../../chunks/ssr.js";
import { C as Cat_compact_item } from "../../../../chunks/cat-compact-item.js";
import { P as Pattern_1 } from "../../../../chunks/Pattern.js";
import { P as Product_item } from "../../../../chunks/product-item.js";
import { S as Stall_item } from "../../../../chunks/stall-item.js";
import { A as Avatar, a as Avatar_image, b as Avatar_fallback } from "../../../../chunks/avatar.js";
import { B as Button } from "../../../../chunks/index3.js";
import "../../../../chunks/ndk.js";
import "clsx";
import "../../../../chunks/utils2.js";
import "../../../../chunks/constants2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let npub;
  let name;
  let image;
  let products;
  let stalls;
  let categories;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ npub, name, image, products, stalls, categories } = data);
  return `<div class="flex min-h-screen w-full flex-col bg-muted/40"><div class="flex flex-col"><main class="text-black"><div class="relative flex w-full flex-col items-center bg-black py-20 text-center text-white">${validate_component(Pattern_1, "Pattern").$$render($$result, {}, {}, {})} <div class="w-fit z-10 justify-center"><div class="flex justify-center">${validate_component(Avatar, "Avatar").$$render($$result, { class: "h-20 w-20" }, {}, {
    default: () => {
      return `${validate_component(Avatar_image, "AvatarImage").$$render($$result, { src: image, alt: "@shadcn" }, {}, {})} ${validate_component(Avatar_fallback, "AvatarFallback").$$render($$result, {}, {}, {
        default: () => {
          return `${escape(name)}`;
        }
      })}`;
    }
  })}</div> <h2>${escape(name)}</h2> <div class="flex items-center">${validate_component(Button, "Button").$$render(
    $$result,
    {
      variant: "secondary",
      class: "w-1/2 lg:w-auto"
    },
    {},
    {
      default: () => {
        return `<code class="truncate">${escape(npub)}</code>`;
      }
    }
  )} ${validate_component(Button, "Button").$$render($$result, {}, {}, {
    default: () => {
      return `Copy`;
    }
  })}</div></div></div> ${categories.length ? `<div class="py-5 lg:px-12"><div class="container"><h2 data-svelte-h="svelte-1v5ei8e">Categories</h2> <div class="grid grid-cols-4 gap-2">${each(categories.filter((cat) => (cat.productCount ?? 0) > 0), (cat) => {
    return `${validate_component(Cat_compact_item, "CatCompactItem").$$render($$result, { cat, isGlobal: false }, {}, {})}`;
  })}</div></div></div>` : ``} ${stalls.length ? `<div class="px-4 py-20 lg:px-12"><div class="container"><h2 data-svelte-h="svelte-1jwde9t">Stalls</h2> <div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each(stalls, (item) => {
    return `${validate_component(Stall_item, "StallItem").$$render($$result, { stall: item }, {}, {})}`;
  })}</div></div></div>` : ``} ${products.length ? `<div class="px-4 py-20 lg:px-12"><div class="container"><h2 data-svelte-h="svelte-k4te9i">Products</h2> <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each(products, (item) => {
    return `${validate_component(Product_item, "ProductItem").$$render($$result, { product: item }, {}, {})}`;
  })}</div></div></div>` : ``}</main></div></div>`;
});
export {
  Page as default
};
