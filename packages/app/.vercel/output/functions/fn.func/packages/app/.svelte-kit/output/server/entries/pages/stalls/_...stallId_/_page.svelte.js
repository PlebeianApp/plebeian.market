import { c as create_ssr_component, a as add_attribute, v as validate_component, f as escape, e as each } from "../../../../chunks/ssr.js";
import { P as Product_item } from "../../../../chunks/product-item.js";
import { R as Root, A as Accordion_item, a as Accordion_trigger, b as Accordion_content } from "../../../../chunks/index6.js";
import { A as Avatar, a as Avatar_image, b as Avatar_fallback } from "../../../../chunks/avatar.js";
import { B as Badge } from "../../../../chunks/badge.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let stall;
  let user;
  let zones;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ stall, user, zones } = data);
  return `<div class="flex min-h-screen w-full flex-col bg-muted/40"><div class="flex flex-col"><main class="text-black"><div class="flex w-full flex-col items-center bg-black py-20 text-center text-white"><section class="w-fit"><a${add_attribute("href", `/p/${user.nip05 ? user.nip05 : user.id}`, 0)} class="flex flex-col items-center">${validate_component(Avatar, "Avatar").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Avatar_image, "AvatarImage").$$render($$result, { src: user.image, alt: "@shadcn" }, {}, {})} ${validate_component(Avatar_fallback, "AvatarFallback").$$render($$result, {}, {}, {
        default: () => {
          return `${escape(user.name?.substring(0, 2))}`;
        }
      })}`;
    }
  })} <span>${escape(user.name)}</span></a></section> <h1>${escape(stall.name)}</h1> <p class="text-2xl">${escape(stall.description)}</p> ${validate_component(Root, "Accordion.Root").$$render($$result, { class: "w-full sm:max-w-sm" }, {}, {
    default: () => {
      return `${validate_component(Accordion_item, "Accordion.Item").$$render($$result, { value: "item-1" }, {}, {
        default: () => {
          return `${validate_component(Accordion_trigger, "Accordion.Trigger").$$render($$result, {}, {}, {
            default: () => {
              return `More info`;
            }
          })} ${validate_component(Accordion_content, "Accordion.Content").$$render($$result, {}, {}, {
            default: () => {
              return `<div class="flex flex-col gap-2 items-start"><span data-svelte-h="svelte-1p4sc7v">Shipping zones</span> <section class="flex gap-2 flex-wrap">${each(zones, (zone) => {
                return `${validate_component(Badge, "Badge").$$render($$result, { variant: "secondary" }, {}, {
                  default: () => {
                    return `${escape(zone.region)}`;
                  }
                })}`;
              })}</section></div>`;
            }
          })}`;
        }
      })}`;
    }
  })}</div> <div class="px-4 py-20 lg:px-12"><div class="container"><h2 data-svelte-h="svelte-k4te9i">Products</h2> <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each(stall.products, (item) => {
    return `${validate_component(Product_item, "ProductItem").$$render($$result, { product: item }, {}, {})}`;
  })}</div></div></div></main></div></div>`;
});
export {
  Page as default
};
