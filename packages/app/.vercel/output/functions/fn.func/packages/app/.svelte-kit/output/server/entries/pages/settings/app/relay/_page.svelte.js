import { s as subscribe } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, f as escape } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { B as Button } from "../../../../../chunks/index3.js";
import "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import "../../../../../chunks/constants2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  const linkDetails = data.menuItems.find((item) => item.value === "app-settings")?.links.find((item) => item.href === $page.url.pathname);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_page();
  return `<div class="pb-4 space-y-2"><div><div class="flex items-center gap-1">${validate_component(Button, "Button").$$render(
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
  )} <section><h3 class="text-lg font-bold">${escape(linkDetails?.title)}</h3> <p class="text-gray-600">${escape(linkDetails?.description)}</p></section></div></div> <div></div></div>`;
});
export {
  Page as default
};
