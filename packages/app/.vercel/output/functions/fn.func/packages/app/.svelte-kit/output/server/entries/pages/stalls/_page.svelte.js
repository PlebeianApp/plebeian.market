import { c as create_ssr_component, v as validate_component, e as each } from "../../../chunks/ssr.js";
import { C as Cat_menu } from "../../../chunks/cat-menu.js";
import { S as Stall_item } from "../../../chunks/stall-item.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const { stalls } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<div class="flex min-h-screen w-full flex-col bg-muted/40"><div class="flex flex-col"><main class="text-black"><div class="px-4 py-20 lg:px-12"><div class="container"><h3 data-svelte-h="svelte-1oj0zvs">Categories</h3> ${validate_component(Cat_menu, "CatMenu").$$render($$result, {}, {}, {})} <h2 data-svelte-h="svelte-1jwde9t">Stalls</h2> <div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each(stalls, (item) => {
    return `${validate_component(Stall_item, "StallItem").$$render($$result, { stall: item }, {}, {})}`;
  })}</div></div></div></main></div></div>`;
});
export {
  Page as default
};
