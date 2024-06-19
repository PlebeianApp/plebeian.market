import { s as subscribe } from "../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, e as each, a as add_attribute, f as escape } from "../../../chunks/ssr.js";
import "../../../chunks/client.js";
import { p as page } from "../../../chunks/stores.js";
import { R as Root, A as Accordion_item, a as Accordion_trigger, b as Accordion_content } from "../../../chunks/index6.js";
import { n as ndkStore } from "../../../chunks/ndk.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let menuItems;
  let activeUser;
  let $page, $$unsubscribe_page;
  let $ndkStore, $$unsubscribe_ndkStore;
  $$unsubscribe_page = subscribe(page, (value2) => $page = value2);
  $$unsubscribe_ndkStore = subscribe(ndkStore, (value2) => $ndkStore = value2);
  let { data } = $$props;
  let value;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    ({ menuItems, activeUser } = data);
    $$rendered = `${activeUser?.data && $ndkStore.signer ? `<div class="max-w-3xl mx-auto p-4"><div class="grid grid-cols-[200px_1fr] gap-2"><div class="w-full"><h2 data-svelte-h="svelte-14rx5kw"><a href="/settings">Settings</a></h2> ${validate_component(Root, "Accordion.Root").$$render(
      $$result,
      { value },
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${each(menuItems, (item) => {
            return `${activeUser.data.role === "admin" || item.value !== "app-settings" ? `${validate_component(Accordion_item, "Accordion.Item").$$render($$result, { value: item.value }, {}, {
              default: () => {
                return `${validate_component(Accordion_trigger, "Accordion.Trigger").$$render($$result, {}, {}, {
                  default: () => {
                    return `<span${add_attribute("id", item.value, 0)}>${escape(item.title)}</span> `;
                  }
                })} ${validate_component(Accordion_content, "Accordion.Content").$$render($$result, {}, {}, {
                  default: () => {
                    return `<ul class="pl-4 space-y-1">${each(item.links, (link) => {
                      return `<li><a${add_attribute("class", $page.url.pathname == link.href ? " font-bold" : "", 0)}${add_attribute("href", link.href, 0)}>${escape(link.title)}</a></li>`;
                    })}</ul> `;
                  }
                })} `;
              }
            })}` : ``}`;
          })}`;
        }
      }
    )}</div> <div class="w-full">${slots.default ? slots.default({}) : ``}</div></div></div>` : `you must login`}`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_ndkStore();
  return $$rendered;
});
export {
  Layout as default
};
