import { c as create_ssr_component, v as validate_component, f as escape, e as each, a as add_attribute } from "../../../../chunks/ssr.js";
import { B as Button } from "../../../../chunks/index3.js";
import { S as Separator } from "../../../../chunks/separator.js";
import "../../../../chunks/ndk.js";
import "clsx";
import "../../../../chunks/utils2.js";
import "../../../../chunks/constants2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const [{ title, description, links }] = data.menuItems.filter((item) => item.value === "app-settings");
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
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
  )} <section><h3 class="text-lg font-bold">${escape(title)}</h3> <p class="text-gray-600">${escape(description)}</p></section></div></div> <ul class="list-none">${each(links, (link) => {
    return `<li class="mb-2"><a${add_attribute("href", link.href, 0)}><p${add_attribute(
      "class",
      link.title == "Delete account" ? "text-[hsl(var(--destructive))]" : "",
      0
    )}>${escape(link.title)}</p> <p class="text-gray-600 text-sm">${escape(link.description)}</p></a> </li>`;
  })}</ul></div> ${validate_component(Separator, "Separator").$$render($$result, { class: "mb-2" }, {}, {})}`;
});
export {
  Page as default
};
