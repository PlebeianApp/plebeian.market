import { s as subscribe } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, f as escape, e as each, a as add_attribute } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { A as Alert, a as Alert_description } from "../../../../../chunks/index8.js";
import { B as Button } from "../../../../../chunks/index3.js";
import { n as ndkStore, d as defaulRelaysUrls } from "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import "../../../../../chunks/constants2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let relayUrls;
  let $page, $$unsubscribe_page;
  let $ndkStore, $$unsubscribe_ndkStore;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_ndkStore = subscribe(ndkStore, (value) => $ndkStore = value);
  let { data } = $$props;
  const linkDetails = data.menuItems.find((item) => item.value === "account-settings")?.links.find((item) => item.href === $page.url.pathname);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  relayUrls = [
    .../* @__PURE__ */ new Set([...$ndkStore.activeUser?.relayUrls ?? [], ...defaulRelaysUrls])
  ].map((u) => new URL(u));
  $$unsubscribe_page();
  $$unsubscribe_ndkStore();
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
  )} <section><h3 class="text-lg font-bold">${escape(linkDetails?.title)}</h3> <p class="text-gray-600">${escape(linkDetails?.description)}</p></section></div> ${validate_component(Alert, "Alert.Root").$$render($$result, { class: "bg-[var(--neo-blue)]" }, {}, {
    default: () => {
      return `${validate_component(Alert_description, "Alert.Description").$$render($$result, {}, {}, {
        default: () => {
          return `Your products are published to these relays (servers). You cannot modify this setting for now. Please let us know if you’d like to
			add a relay.`;
        }
      })}`;
    }
  })} <h4 class="text-lg font-bold" data-svelte-h="svelte-13f1lxz">Relays</h4> <ul class="flex flex-col gap-2">${each(relayUrls, (url) => {
    return `<li class="flex flex-col"><a${add_attribute("href", url.href, 0)} class="font-bold text-md">${escape(url.hostname)}</a> <code class="text-sm">${escape(url.href)}</code> </li>`;
  })}</ul></div>`;
});
export {
  Page as default
};
