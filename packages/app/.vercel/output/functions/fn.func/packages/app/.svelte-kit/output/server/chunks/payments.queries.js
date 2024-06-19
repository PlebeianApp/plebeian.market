import { c as compute_rest_props, s as subscribe, g as get_store_value } from "./utils3.js";
import { c as create_ssr_component, s as spread, h as escape_object, a as add_attribute, v as validate_component } from "./ssr.js";
import { o as omit, m as makeElement, f as disabledAttr, a as addMeltEventListener, s as styleToString, c as createElHelpers } from "./create.js";
import { s as slide } from "./index4.js";
import { s as setContext, g as getContext } from "./lifecycle.js";
import { o as overridable } from "./overridable.js";
import { d as derived, w as writable } from "./index2.js";
import { t as toWritableStores, r as removeUndefined, g as getOptionUpdater } from "./updater.js";
import { c as createBitAttrs } from "./attrs.js";
import { c as createDispatcher } from "./events.js";
import { c as createMutation } from "./createMutation.js";
import { n as ndkStore } from "./ndk.js";
import { c as createRequest, q as queryClient } from "./client2.js";
import { c as createQuery } from "./createQuery.js";
import { s as stallsFilterSchema } from "./schema.js";
const defaults = {
  defaultOpen: false,
  disabled: false,
  forceVisible: false
};
const { name } = createElHelpers("collapsible");
function createCollapsible(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(withDefaults, "open", "defaultOpen", "onOpenChange"));
  const { disabled, forceVisible } = options;
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const root = makeElement(name(), {
    stores: [open, disabled],
    returned: ([$open, $disabled]) => ({
      "data-state": $open ? "open" : "closed",
      "data-disabled": disabledAttr($disabled)
    })
  });
  const trigger = makeElement(name("trigger"), {
    stores: [open, disabled],
    returned: ([$open, $disabled]) => ({
      "data-state": $open ? "open" : "closed",
      "data-disabled": disabledAttr($disabled),
      disabled: disabledAttr($disabled)
    }),
    action: (node) => {
      const unsub = addMeltEventListener(node, "click", () => {
        const disabled2 = node.dataset.disabled !== void 0;
        if (disabled2)
          return;
        open.update(($open) => !$open);
      });
      return {
        destroy: unsub
      };
    }
  });
  const isVisible = derived([open, forceVisible], ([$open, $forceVisible]) => $open || $forceVisible);
  const content = makeElement(name("content"), {
    stores: [isVisible, disabled],
    returned: ([$isVisible, $disabled]) => ({
      "data-state": $isVisible ? "open" : "closed",
      "data-disabled": disabledAttr($disabled),
      hidden: $isVisible ? void 0 : true,
      style: styleToString({
        display: $isVisible ? void 0 : "none"
      })
    })
  });
  return {
    elements: {
      root,
      trigger,
      content
    },
    states: {
      open
    },
    options
  };
}
function getCollapsibleData() {
  const NAME = "collapsible";
  const PARTS = ["root", "content", "trigger"];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getCollapsibleData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const collapsible = { ...createCollapsible(removeUndefined(props)), getAttrs };
  setContext(NAME, collapsible);
  return {
    ...collapsible,
    updateOption: getOptionUpdater(collapsible.options)
  };
}
function getCtx() {
  const { NAME } = getCollapsibleData();
  return getContext(NAME);
}
const Collapsible = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["disabled", "open", "onOpenChange", "asChild", "el"]);
  let $root, $$unsubscribe_root;
  let { disabled = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root }, states: { open: localOpen }, updateOption, getAttrs } = setCtx({
    disabled,
    forceVisible: true,
    defaultOpen: open,
    onOpenChange: ({ next }) => {
      if (open !== next) {
        onOpenChange?.(next);
        open = next;
      }
      return next;
    }
  });
  $$unsubscribe_root = subscribe(root, (value) => $root = value);
  const attrs = getAttrs("root");
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("disabled", disabled);
  }
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Collapsible_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "el"
  ]);
  let $content, $$unsubscribe_content;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, states: { open }, getAttrs } = getCtx();
  $$unsubscribe_content = subscribe(content, (value) => $content = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $content;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_content();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Collapsible_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, getAttrs } = getCtx();
  $$unsubscribe_trigger = subscribe(trigger, (value) => $trigger = value);
  createDispatcher();
  const attrs = getAttrs("trigger");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $trigger;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Collapsible_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["transition", "transitionConfig"]);
  let { transition = slide } = $$props;
  let { transitionConfig = { duration: 150 } } = $$props;
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Collapsible_content$1, "CollapsiblePrimitive.Content").$$render($$result, Object.assign({}, { transition }, { transitionConfig }, $$restProps), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Root = Collapsible;
const Trigger = Collapsible_trigger;
const persistPaymentMethodMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async ({ paymentDetails, paymentMethod, stallId, isDefault }) => {
      const $ndkStore = get_store_value(ndkStore);
      if ($ndkStore.activeUser?.pubkey) {
        const pd = await createRequest(`POST /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}`, {
          auth: true,
          body: {
            paymentDetails,
            paymentMethod,
            stallId,
            isDefault
          }
        });
        return pd;
      }
      return null;
    },
    onSuccess: () => {
      const $ndkStore = get_store_value(ndkStore);
      queryClient.invalidateQueries({ queryKey: ["paymentDetails", $ndkStore.activeUser?.pubkey] });
    }
  },
  queryClient
);
const updatePaymentMethodMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async ({ paymentDetails, paymentMethod, stallId, paymentDetailId, isDefault }) => {
      const $ndkStore = get_store_value(ndkStore);
      if ($ndkStore.activeUser?.pubkey) {
        const pd = await createRequest(`PUT /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}&paymentDetailId=${paymentDetailId}`, {
          auth: true,
          body: {
            paymentDetails,
            paymentMethod,
            stallId,
            isDefault
          }
        });
        return pd;
      }
      return null;
    },
    onSuccess: () => {
      const $ndkStore = get_store_value(ndkStore);
      queryClient.invalidateQueries({ queryKey: ["paymentDetails", $ndkStore.activeUser?.pubkey] });
    }
  },
  queryClient
);
const deletePaymentMethodMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async ({ paymentDetailId, userId }) => {
      const $ndkStore = get_store_value(ndkStore);
      if ($ndkStore.activeUser?.pubkey) {
        const pd = await createRequest(`DELETE /api/v1/payments/?paymentDetailId=${paymentDetailId}&userId=${userId}`, {
          auth: true
        });
        return pd;
      }
      return null;
    },
    onSuccess: () => {
      const $ndkStore = get_store_value(ndkStore);
      queryClient.invalidateQueries({ queryKey: ["paymentDetails", $ndkStore.activeUser?.pubkey] });
    }
  },
  queryClient
);
createMutation(
  {
    mutationKey: [],
    mutationFn: async ({ stallId, paymentDetailId }) => {
      const $ndkStore = get_store_value(ndkStore);
      if ($ndkStore.activeUser?.pubkey) {
        const pd = await createRequest(`POST /api/v1/payments/${stallId}/?paymentDetailId=${paymentDetailId}`, {
          auth: true
        });
        return pd;
      }
      return null;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["paymentDetails", data?.stallId] });
    }
  },
  queryClient
);
const createStallsByFilterQuery = (filter) => createQuery(
  {
    queryKey: ["stalls", ...Object.values(filter)],
    queryFn: async () => {
      const stalls = await createRequest("GET /api/v1/stalls", {
        params: stallsFilterSchema.parse(filter)
      });
      return stalls;
    }
  },
  queryClient
);
const paymentsQuery = createQuery(
  derived(ndkStore, ($ndkStore) => ({
    queryKey: ["paymentDetails", $ndkStore.activeUser?.pubkey],
    queryFn: async () => {
      if ($ndkStore.activeUser?.pubkey) {
        const user = await createRequest(`GET /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}`, {
          auth: true
        });
        return user;
      }
      return null;
    },
    enabled: !!$ndkStore.activeUser?.pubkey
  })),
  queryClient
);
export {
  Collapsible_content as C,
  Root as R,
  Trigger as T,
  paymentsQuery as a,
  createStallsByFilterQuery as c,
  deletePaymentMethodMutation as d,
  persistPaymentMethodMutation as p,
  updatePaymentMethodMutation as u
};
