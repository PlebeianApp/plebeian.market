import { c as create_ssr_component, v as validate_component, f as escape } from "./ssr.js";
import "./client.js";
import { B as Button } from "./index3.js";
const Cat_compact_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { cat } = $$props;
  let { isGlobal = true } = $$props;
  if ($$props.cat === void 0 && $$bindings.cat && cat !== void 0)
    $$bindings.cat(cat);
  if ($$props.isGlobal === void 0 && $$bindings.isGlobal && isGlobal !== void 0)
    $$bindings.isGlobal(isGlobal);
  return `${validate_component(Button, "Button").$$render(
    $$result,
    {
      class: "cursor-pointer border border-gray flex justify-start items-center p-4 font-bold",
      variant: "outline"
    },
    {},
    {
      default: () => {
        return `<div class="flex items-center gap-2 w-full justify-between"><section class="inline-flex items-center gap-2"><span class="i-mdi-category-outline w-6 h-6"></span> <span>${escape(cat.name)}</span></section> <span>${escape(cat.productCount)}</span></div>`;
      }
    }
  )}`;
});
export {
  Cat_compact_item as C
};
