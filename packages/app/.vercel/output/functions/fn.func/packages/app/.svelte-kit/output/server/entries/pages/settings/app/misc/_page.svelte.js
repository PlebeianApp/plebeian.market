import { s as subscribe } from "../../../../../chunks/utils3.js";
import { t as tick } from "../../../../../chunks/scheduler.js";
import { c as create_ssr_component, v as validate_component, f as escape, e as each, a as add_attribute } from "../../../../../chunks/ssr.js";
import "../../../../../chunks/client.js";
import { p as page } from "../../../../../chunks/stores.js";
import { B as Button } from "../../../../../chunks/index3.js";
import { C as Checkbox } from "../../../../../chunks/checkbox.js";
import "../../../../../chunks/ctx.js";
import "../../../../../chunks/create.js";
import "../../../../../chunks/ndk.js";
import "clsx";
import "../../../../../chunks/utils2.js";
import { c as availabeLogos } from "../../../../../chunks/constants2.js";
import { R as Root, T as Trigger, P as Popover_content, C as Command, a as Command_input, b as Command_group, c as Command_item } from "../../../../../chunks/index10.js";
import { I as Input } from "../../../../../chunks/input.js";
import { L as Label } from "../../../../../chunks/label.js";
import { R as Root$1, S as Select_trigger, V as Value, a as Select_content, b as Select_item } from "../../../../../chunks/index9.js";
import { S as Separator } from "../../../../../chunks/separator.js";
import { npubEncode } from "nostr-tools/nip19";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  const { adminUsers, currencies, appSettings } = data;
  const linkDetails = data.menuItems.find((item) => item.value === "app-settings")?.links.find((item) => item.href === $page.url.pathname);
  let checked = appSettings.allowRegister;
  let selectedCurrency = { value: "BTC", label: "BTC" };
  let adminsList = adminUsers.map((user) => npubEncode(user));
  let inputValue = "";
  let logoUrl = "";
  let open = false;
  function closeAndFocusTrigger(triggerId) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="pb-4 space-y-2 max-w-2xl"><div><div class="flex items-center gap-1">${validate_component(Button, "Button").$$render(
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
    )} <section><h3 class="text-lg font-bold">${escape(linkDetails?.title)}</h3> <p class="text-gray-600">${escape(linkDetails?.description)}</p></section></div></div> <div class="flex flex-col gap-2 overflow-auto"><main class="text-black"><div class=""><div class="container">${validate_component(Separator, "Separator").$$render($$result, { class: " my-2" }, {}, {})} <form class="max-w-2xl flex flex-col gap-3"><h3 data-svelte-h="svelte-p6voya">Identity</h3> ${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Instance npub`;
      }
    })} <div>${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "outline",
        class: "flex gap-1 p-2 border-black border-2"
      },
      {},
      {
        default: () => {
          return `<code class="truncate">${escape(npubEncode(appSettings.instancePk))}</code> <span class="i-tdesign-copy"></span>`;
        }
      }
    )}</div> ${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Owner npub`;
      }
    })} ${validate_component(Input, "Input").$$render(
      $$result,
      {
        value: appSettings.ownerPk ? npubEncode(appSettings.ownerPk) : "",
        class: " border-black border-2",
        name: "ownerPk",
        placeholder: "owner npub",
        type: "text"
      },
      {},
      {}
    )} <div class="flex-grow">${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Instance name`;
      }
    })} ${validate_component(Input, "Input").$$render(
      $$result,
      {
        value: appSettings.instanceName,
        class: "border-black border-2",
        name: "instanceName",
        placeholder: "instance name",
        type: "text"
      },
      {},
      {}
    )}</div> <div class="flex flex-col gap-2"><div>${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Logo url`;
      }
    })} ${validate_component(Root, "Popover.Root").$$render(
      $$result,
      { open },
      {
        open: ($$value) => {
          open = $$value;
          $$settled = false;
        }
      },
      {
        default: ({ ids }) => {
          return `${validate_component(Trigger, "Popover.Trigger").$$render($$result, { asChild: true }, {}, {
            default: ({ builder }) => {
              return `${validate_component(Button, "Button").$$render(
                $$result,
                {
                  builders: [builder],
                  variant: "outline",
                  role: "combobox",
                  "aria-expanded": open,
                  class: "w-full justify-between border-black border-2"
                },
                {},
                {
                  default: () => {
                    return `${appSettings.logoUrl ? `${escape(availabeLogos.find((logo) => logo.value === logoUrl)?.label || logoUrl)}` : `<span class="opacity-50" data-svelte-h="svelte-1ogezr9">Select logo</span>`}`;
                  }
                }
              )}`;
            }
          })} ${validate_component(Popover_content, "Popover.Content").$$render($$result, { class: " p-0" }, {}, {
            default: () => {
              return `${validate_component(Command, "Command.Root").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Command_input, "Command.Input").$$render(
                    $$result,
                    {
                      placeholder: "Select logo or introduce image url...",
                      value: logoUrl
                    },
                    {
                      value: ($$value) => {
                        logoUrl = $$value;
                        $$settled = false;
                      }
                    },
                    {}
                  )} ${validate_component(Command_group, "Command.Group").$$render($$result, {}, {}, {
                    default: () => {
                      return `${each(availabeLogos, (logo) => {
                        return `${validate_component(Command_item, "Command.Item").$$render(
                          $$result,
                          {
                            value: logo.value,
                            onSelect: (currentValue) => {
                              logoUrl = currentValue;
                              closeAndFocusTrigger(ids.trigger);
                            }
                          },
                          {},
                          {
                            default: () => {
                              return `+
														${escape(logo.label)} `;
                            }
                          }
                        )}`;
                      })}`;
                    }
                  })}`;
                }
              })}`;
            }
          })}`;
        }
      }
    )}</div> <div class="self-center">${logoUrl ? `<img class="max-w-28"${add_attribute("src", logoUrl, 0)} alt="logo preview">` : ``}</div></div> ${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Contact email`;
      }
    })} ${validate_component(Input, "Input").$$render(
      $$result,
      {
        value: appSettings.contactEmail,
        class: "border-black border-2",
        name: "contactEmail",
        placeholder: "contact email",
        type: "email"
      },
      {},
      {}
    )} ${validate_component(Separator, "Separator").$$render($$result, { class: " my-2" }, {}, {})} <h3 data-svelte-h="svelte-spejhp">Crew</h3> ${each(adminsList, (admin) => {
      return `${admin != npubEncode(appSettings.instancePk) ? `<div class="grid grid-cols-[1fr_auto] items-center"><span class="truncate">${escape(admin)}</span> ${validate_component(Button, "Button").$$render(
        $$result,
        {
          type: "button",
          size: "icon",
          variant: "outline",
          class: " bg-red-500"
        },
        {},
        {
          default: () => {
            return `<span class="i-mdi-trash-can"></span> `;
          }
        }
      )} </div>` : ``}`;
    })} <textarea name="adminsList" hidden>${escape(adminsList, false)}</textarea> ${validate_component(Input, "Input").$$render(
      $$result,
      { type: "text", value: inputValue },
      {
        value: ($$value) => {
          inputValue = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { type: "button" }, {}, {
      default: () => {
        return `Add Admin`;
      }
    })} ${validate_component(Separator, "Separator").$$render($$result, { class: " my-2" }, {}, {})} <h3 data-svelte-h="svelte-opwavo">Miscellanea</h3> <div class="flex flex-row items-center justify-center gap-4"><div class="flex-grow">${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Default currency`;
      }
    })} ${validate_component(Root$1, "Select").$$render(
      $$result,
      {
        name: "defaultCurrency",
        selected: selectedCurrency
      },
      {
        selected: ($$value) => {
          selectedCurrency = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Select_trigger, "SelectTrigger").$$render($$result, { class: "border-black border-2" }, {}, {
            default: () => {
              return `${validate_component(Value, "SelectValue").$$render($$result, { placeholder: "Currency" }, {}, {})}`;
            }
          })} ${validate_component(Select_content, "SelectContent").$$render(
            $$result,
            {
              class: "border-black border-2 max-h-[350px] overflow-y-auto"
            },
            {},
            {
              default: () => {
                return `${each(currencies, (currency) => {
                  return `${validate_component(Select_item, "SelectItem").$$render($$result, { value: currency }, {}, {
                    default: () => {
                      return `${escape(currency)}`;
                    }
                  })}`;
                })}`;
              }
            }
          )}`;
        }
      }
    )}</div> <div class="flex flex-col items-center justify-center gap-3">${validate_component(Label, "Label").$$render($$result, { class: "truncate font-bold" }, {}, {
      default: () => {
        return `Allow register`;
      }
    })} ${validate_component(Checkbox, "Checkbox").$$render(
      $$result,
      {
        required: true,
        class: "border-black border-2",
        name: "allowRegister",
        placeholder: "allow register",
        checked
      },
      {
        checked: ($$value) => {
          checked = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div> ${validate_component(Separator, "Separator").$$render($$result, { class: "max-w-2xl my-8" }, {}, {})} ${validate_component(Button, "Button").$$render($$result, { type: "submit", class: "w-full" }, {}, {
      default: () => {
        return `Submit`;
      }
    })}</form></div></div></main></div></div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
