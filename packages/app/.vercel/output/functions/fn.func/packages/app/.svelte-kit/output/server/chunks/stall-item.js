import { c as create_ssr_component, s as spread, g as escape_attribute_value, h as escape_object, a as add_attribute, v as validate_component, f as escape } from "./ssr.js";
import { c as compute_rest_props } from "./utils3.js";
import { a as cn } from "./utils2.js";
import "./ndk.js";
import "clsx";
import "./constants2.js";
import { C as Card, a as Card_footer } from "./card.js";
const Card_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("p-6 pt-0", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Card_header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col space-y-1.5 p-6", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Stall_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stall } = $$props;
  const { name, createDate, description, userName, currency, productCount, orderCount, userNip05, identifier, id } = stall;
  if ($$props.stall === void 0 && $$bindings.stall && stall !== void 0)
    $$bindings.stall(stall);
  return `<a${add_attribute(
    "href",
    userNip05 ? `/stalls/${userNip05}/${identifier}` : `/stalls/${id}`,
    0
  )}>${validate_component(Card, "Card.Root").$$render(
    $$result,
    {
      class: "flex h-[34vh] cursor-pointer flex-col gap-4 border-4 border-black bg-transparent text-black"
    },
    {},
    {
      default: () => {
        return `${validate_component(Card_header, "Card.Header").$$render($$result, { class: "flex flex-col justify-between" }, {}, {
          default: () => {
            return `<span class="truncate text-2xl font-bold">${escape(name)}</span> <span class="font-red font-bold">Since: ${escape(createDate)}</span>`;
          }
        })} ${validate_component(Card_content, "Card.Content").$$render(
          $$result,
          {
            class: "max-h-[33%] flex-grow overflow-hidden"
          },
          {},
          {
            default: () => {
              return `${escape(description)}`;
            }
          }
        )} ${validate_component(Card_footer, "Card.Footer").$$render(
          $$result,
          {
            class: "flex flex-col items-start font-bold"
          },
          {},
          {
            default: () => {
              return `<span>Owner: ${escape(userName)}</span> <span>Currency: ${escape(currency)}</span> <span>${escape(productCount)} products</span>`;
            }
          }
        )}`;
      }
    }
  )}</a>`;
});
export {
  Stall_item as S
};
