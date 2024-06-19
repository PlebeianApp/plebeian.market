import { s as subscribe } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, f as escape } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { A as Alert, a as Alert_description } from "../../../../../chunks/index8.js";
import { B as Button } from "../../../../../chunks/index3.js";
import { I as Input } from "../../../../../chunks/input.js";
import { L as Label } from "../../../../../chunks/label.js";
import "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import "../../../../../chunks/constants2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  const linkDetails = data.menuItems.find((item) => item.value === "account-settings")?.links.find((item) => item.href === $page.url.pathname);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_page();
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
          return `All sales inquiries will go into your direct message inbox automatically. The email address helps ensure you don’t miss anything,
			just in case.`;
        }
      })}`;
    }
  })} <form class="flex flex-col gap-4"><div class="grid w-full items-center gap-1.5">${validate_component(Label, "Label").$$render($$result, { for: "email", class: "font-bold" }, {}, {
    default: () => {
      return `Email Address`;
    }
  })} ${validate_component(Input, "Input").$$render(
    $$result,
    {
      type: "email",
      id: "email",
      placeholder: "e.g. username@walletofsatoshi.com"
    },
    {},
    {}
  )}</div> ${validate_component(Button, "Button").$$render($$result, { class: "w-full font-bold" }, {}, {
    default: () => {
      return `Save`;
    }
  })}</form></div>`;
});
export {
  Page as default
};
