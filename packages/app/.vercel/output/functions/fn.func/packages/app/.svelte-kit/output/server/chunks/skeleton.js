import { c as compute_rest_props } from "./utils3.js";
import { c as create_ssr_component, s as spread, g as escape_attribute_value, h as escape_object } from "./ssr.js";
import { a as cn } from "./utils2.js";
const Skeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("animate-pulse rounded-md bg-muted", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}></div>`;
});
export {
  Skeleton as S
};
