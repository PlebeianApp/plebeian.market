import { q as isFunction, d as isHTMLElement, o as omit, m as makeElement, f as disabledAttr, e as executeCallbacks, a as addMeltEventListener, k as kbd, s as styleToString } from "./create.js";
import { t as tick } from "./scheduler.js";
import { s as sleep, C as Check } from "./check.js";
import { c as compute_rest_props, s as subscribe } from "./utils3.js";
import { c as create_ssr_component, s as spread, h as escape_object, a as add_attribute, v as validate_component } from "./ssr.js";
import { a as cn } from "./utils2.js";
import { s as setContext, g as getContext } from "./lifecycle.js";
import { o as overridable } from "./overridable.js";
import { d as derived, w as writable } from "./index2.js";
import { t as toWritableStores, r as removeUndefined, g as getOptionUpdater } from "./updater.js";
import { c as createBitAttrs } from "./attrs.js";
import { c as createDispatcher } from "./events.js";
import { I as Icon } from "./Icon.js";
async function handleFocus(args) {
  const { prop, defaultEl } = args;
  await Promise.all([sleep(1), tick]);
  if (prop === void 0) {
    defaultEl?.focus();
    return;
  }
  const returned = isFunction(prop) ? prop(defaultEl) : prop;
  if (typeof returned === "string") {
    const el = document.querySelector(returned);
    if (!isHTMLElement(el))
      return;
    el.focus();
  } else if (isHTMLElement(returned)) {
    returned.focus();
  }
}
const defaults = {
  disabled: false,
  required: false,
  name: void 0,
  value: "on",
  defaultChecked: false
};
function createCheckbox(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(withDefaults, "checked", "defaultChecked"));
  const { disabled, name, required, value } = options;
  const checkedWritable = withDefaults.checked ?? writable(withDefaults.defaultChecked);
  const checked = overridable(checkedWritable, withDefaults?.onCheckedChange);
  const root = makeElement("checkbox", {
    stores: [checked, disabled, required],
    returned: ([$checked, $disabled, $required]) => {
      return {
        "data-disabled": disabledAttr($disabled),
        disabled: disabledAttr($disabled),
        "data-state": $checked === "indeterminate" ? "indeterminate" : $checked ? "checked" : "unchecked",
        type: "button",
        role: "checkbox",
        "aria-checked": $checked === "indeterminate" ? "mixed" : $checked,
        "aria-required": $required
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "keydown", (e) => {
        if (e.key === kbd.ENTER)
          e.preventDefault();
      }), addMeltEventListener(node, "click", () => {
        if (disabled.get())
          return;
        checked.update((value2) => {
          if (value2 === "indeterminate")
            return true;
          return !value2;
        });
      }));
      return {
        destroy: unsub
      };
    }
  });
  const input = makeElement("checkbox-input", {
    stores: [checked, name, value, required, disabled],
    returned: ([$checked, $name, $value, $required, $disabled]) => {
      return {
        type: "checkbox",
        "aria-hidden": true,
        hidden: true,
        tabindex: -1,
        name: $name,
        value: $value,
        checked: $checked === "indeterminate" ? false : $checked,
        required: $required,
        disabled: disabledAttr($disabled),
        style: styleToString({
          position: "absolute",
          opacity: 0,
          "pointer-events": "none",
          margin: 0,
          transform: "translateX(-100%)"
        })
      };
    }
  });
  const isIndeterminate = derived(checked, ($checked) => $checked === "indeterminate");
  const isChecked = derived(checked, ($checked) => $checked === true);
  return {
    elements: {
      root,
      input
    },
    states: {
      checked
    },
    helpers: {
      isIndeterminate,
      isChecked
    },
    options
  };
}
function getCheckboxData() {
  const NAME = "checkbox";
  const PARTS = ["root", "input", "indicator"];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getCheckboxData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const checkbox = { ...createCheckbox(removeUndefined(props)), getAttrs };
  setContext(NAME, checkbox);
  return {
    ...checkbox,
    updateOption: getOptionUpdater(checkbox.options)
  };
}
function getCtx() {
  const { NAME } = getCheckboxData();
  return getContext(NAME);
}
const Checkbox$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let attrs;
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "checked",
    "disabled",
    "name",
    "required",
    "value",
    "onCheckedChange",
    "asChild",
    "el"
  ]);
  let $root, $$unsubscribe_root;
  let { checked = false } = $$props;
  let { disabled = void 0 } = $$props;
  let { name = void 0 } = $$props;
  let { required = void 0 } = $$props;
  let { value = void 0 } = $$props;
  let { onCheckedChange = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root }, states: { checked: localChecked }, updateOption, getAttrs } = setCtx({
    defaultChecked: checked,
    disabled,
    name,
    required,
    value,
    onCheckedChange: ({ next }) => {
      if (checked !== next) {
        onCheckedChange?.(next);
        checked = next;
      }
      return next;
    }
  });
  $$unsubscribe_root = subscribe(root, (value2) => $root = value2);
  createDispatcher();
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.onCheckedChange === void 0 && $$bindings.onCheckedChange && onCheckedChange !== void 0)
    $$bindings.onCheckedChange(onCheckedChange);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  attrs = {
    ...getAttrs("root"),
    disabled: disabled ? true : void 0
  };
  checked !== void 0 && localChecked.set(checked);
  {
    updateOption("disabled", disabled);
  }
  {
    updateOption("name", name);
  }
  {
    updateOption("required", required);
  }
  {
    updateOption("value", value);
  }
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
function getStateAttr(state) {
  if (state === "indeterminate")
    return "indeterminate";
  if (state)
    return "checked";
  return "unchecked";
}
const Checkbox_indicator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let attrs;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $checked, $$unsubscribe_checked;
  let $isChecked, $$unsubscribe_isChecked;
  let $isIndeterminate, $$unsubscribe_isIndeterminate;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { helpers: { isChecked, isIndeterminate }, states: { checked }, getAttrs } = getCtx();
  $$unsubscribe_isChecked = subscribe(isChecked, (value) => $isChecked = value);
  $$unsubscribe_isIndeterminate = subscribe(isIndeterminate, (value) => $isIndeterminate = value);
  $$unsubscribe_checked = subscribe(checked, (value) => $checked = value);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  attrs = {
    ...getAttrs("indicator"),
    "data-state": getStateAttr($checked)
  };
  $$unsubscribe_checked();
  $$unsubscribe_isChecked();
  $$unsubscribe_isIndeterminate();
  return `${asChild ? `${slots.default ? slots.default({
    attrs,
    isChecked: $isChecked,
    isIndeterminate: $isIndeterminate
  }) : ``}` : `<div${spread([escape_object($$restProps), escape_object(attrs)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({
    attrs,
    isChecked: $isChecked,
    isIndeterminate: $isIndeterminate
  }) : ``}</div>`}`;
});
const Minus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "M5 12h14" }]];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "minus" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Checkbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "checked"]);
  let { class: className = void 0 } = $$props;
  let { checked = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Checkbox$1, "CheckboxPrimitive.Root").$$render(
      $$result,
      Object.assign(
        {},
        {
          class: cn("peer box-content h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50", className)
        },
        $$restProps,
        { checked }
      ),
      {
        checked: ($$value) => {
          checked = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Checkbox_indicator, "CheckboxPrimitive.Indicator").$$render(
            $$result,
            {
              class: cn("flex h-4 w-4 items-center justify-center text-current")
            },
            {},
            {
              default: ({ isChecked, isIndeterminate }) => {
                return `${isChecked ? `${validate_component(Check, "Check").$$render($$result, { class: "h-3.5 w-3.5" }, {}, {})}` : `${isIndeterminate ? `${validate_component(Minus, "Minus").$$render($$result, { class: "h-3.5 w-3.5" }, {}, {})}` : ``}`}`;
              }
            }
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Checkbox as C,
  handleFocus as h
};
