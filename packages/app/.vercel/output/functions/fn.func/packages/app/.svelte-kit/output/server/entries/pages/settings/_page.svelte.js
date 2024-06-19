import { c as create_ssr_component, e as each, a as add_attribute, f as escape, v as validate_component } from "../../../chunks/ssr.js";
import { S as Separator } from "../../../chunks/separator.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let menuItems;
  let activeUser;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ menuItems, activeUser } = data);
  return `${each(menuItems, (item) => {
    return `${activeUser?.data?.role === "admin" || item.value !== "app-settings" ? `<div class="pb-4 space-y-2"><section><a${add_attribute("href", item.root, 0)}><h3 class="text-lg font-bold">${escape(item.title)}</h3> <p class="opacity-70">${escape(item.description)}</p> </a></section> <ul>${each(item.links, (link) => {
      return `<li><a${add_attribute("href", link.href, 0)}><p${add_attribute(
        "class",
        link.title == "Delete account" ? "text-[hsl(var(--destructive))]" : "",
        0
      )}>${escape(link.title)}</p> <span class="opacity-50 text-sm">${escape(link.description)}</span></a> </li>`;
    })} </ul></div> ${validate_component(Separator, "Separator").$$render($$result, { class: "mb-2" }, {}, {})}` : ``}`;
  })}`;
});
export {
  Page as default
};
