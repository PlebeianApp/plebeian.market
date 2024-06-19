import { s as subscribe, n as noop, c as compute_rest_props, g as get_store_value } from "../../chunks/utils3.js";
import { c as create_ssr_component, a as add_attribute, e as each, b as add_styles, d as merge_ssr_styles, f as escape, v as validate_component, m as missing_component, s as spread, g as escape_attribute_value, h as escape_object } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import { B as Button } from "../../chunks/index3.js";
import { h as handleFocus, C as Checkbox } from "../../chunks/checkbox.js";
import { o as omit, w as withGet, m as makeElement, e as executeCallbacks, a as addMeltEventListener, k as kbd, s as styleToString, u as useEscapeKeydown, b as effect, n as noop$1, p as portalAttr, i as isBrowser$1, c as createElHelpers, d as isHTMLElement, f as disabledAttr, g as getDirectionalKeys } from "../../chunks/create.js";
import { w as writable, d as derived } from "../../chunks/index2.js";
import { o as onDestroy, s as setContext, g as getContext } from "../../chunks/lifecycle.js";
import { t as tick } from "../../chunks/scheduler.js";
import { o as overridable } from "../../chunks/overridable.js";
import { g as generateIds } from "../../chunks/id.js";
import { u as useModal, c as createFocusTrap, g as getPortalDestination, a as usePortal, r as removeScroll, n as next, p as prev, l as last } from "../../chunks/check.js";
import { t as toWritableStores, r as removeUndefined, g as getOptionUpdater } from "../../chunks/updater.js";
import { c as createBitAttrs } from "../../chunks/attrs.js";
import { c as createDispatcher } from "../../chunks/events.js";
import { n as ndkStore } from "../../chunks/ndk.js";
import "clsx";
import { c as cn, t as toastState, u as useEffect, a as cn$1, b as flyAndScale } from "../../chunks/utils2.js";
import { s as standardDisplayDateFormat } from "../../chunks/constants2.js";
import { I as Input } from "../../chunks/input.js";
import { L as Label } from "../../chunks/label.js";
import { S as Separator } from "../../chunks/separator.js";
import "@nostr-dev-kit/ndk";
import "../../chunks/client.js";
import "../../chunks/session.js";
import "../../chunks/nostr-events.js";
import { Q as QueryClient, s as setQueryClientContext, q as queryClient } from "../../chunks/client2.js";
import { c as createUserByIdQuery } from "../../chunks/users.queries.js";
import { P as Pattern_1 } from "../../chunks/Pattern.js";
import { I as Icon$1 } from "../../chunks/Icon.js";
import { f as fade } from "../../chunks/index4.js";
import { i as is_void } from "../../chunks/names.js";
import { S as Skeleton } from "../../chunks/skeleton.js";
import { npubEncode } from "nostr-tools/nip19";
import { format } from "date-fns";
import { A as Avatar, a as Avatar_image, b as Avatar_fallback } from "../../chunks/avatar.js";
import { g as getGroupLabel, a as getCtx$2, R as Root$2, T as Trigger$1, D as Dropdown_menu_content, G as Group, b as Dropdown_menu_item } from "../../chunks/index5.js";
import { c as createCategoriesByFilterQuery } from "../../chunks/category.queries.js";
const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "success" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  return `${type === "success" ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>` : `${type === "error" ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>` : `${type === "info" ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>` : `${type === "warning" ? `<svg viewBox="0 0 64 64" fill="currentColor" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M32.427,7.987c2.183,0.124 4,1.165 5.096,3.281l17.936,36.208c1.739,3.66 -0.954,8.585 -5.373,8.656l-36.119,0c-4.022,-0.064 -7.322,-4.631 -5.352,-8.696l18.271,-36.207c0.342,-0.65 0.498,-0.838 0.793,-1.179c1.186,-1.375 2.483,-2.111 4.748,-2.063Zm-0.295,3.997c-0.687,0.034 -1.316,0.419 -1.659,1.017c-6.312,11.979 -12.397,24.081 -18.301,36.267c-0.546,1.225 0.391,2.797 1.762,2.863c12.06,0.195 24.125,0.195 36.185,0c1.325,-0.064 2.321,-1.584 1.769,-2.85c-5.793,-12.184 -11.765,-24.286 -17.966,-36.267c-0.366,-0.651 -0.903,-1.042 -1.79,-1.03Z"></path><path d="M33.631,40.581l-3.348,0l-0.368,-16.449l4.1,0l-0.384,16.449Zm-3.828,5.03c0,-0.609 0.197,-1.113 0.592,-1.514c0.396,-0.4 0.935,-0.601 1.618,-0.601c0.684,0 1.223,0.201 1.618,0.601c0.395,0.401 0.593,0.905 0.593,1.514c0,0.587 -0.193,1.078 -0.577,1.473c-0.385,0.395 -0.929,0.593 -1.634,0.593c-0.705,0 -1.249,-0.198 -1.634,-0.593c-0.384,-0.395 -0.576,-0.886 -0.576,-1.473Z"></path></svg>` : ``}`}`}`}`;
});
const Loader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { visible } = $$props;
  const bars = Array(12).fill(0);
  if ($$props.visible === void 0 && $$bindings.visible && visible !== void 0)
    $$bindings.visible(visible);
  return `<div class="sonner-loading-wrapper"${add_attribute("data-visible", visible, 0)}><div class="sonner-spinner">${each(bars, (_, i) => {
    return `<div class="sonner-loading-bar"></div>`;
  })}</div></div>`;
});
const TOAST_LIFETIME = 4e3;
const GAP$1 = 14;
const TIME_BEFORE_UNMOUNT = 200;
const Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isFront;
  let isVisible;
  let toastType;
  let toastClass;
  let toastDescriptionClass;
  let heightIndex;
  let coords;
  let toastsHeightBefore;
  let disabled;
  let isPromiseLoadingOrInfiniteDuration;
  let $$unsubscribe_effect = noop, $$subscribe_effect = () => ($$unsubscribe_effect(), $$unsubscribe_effect = subscribe(effect2, ($$value) => $$value), effect2);
  let $heights, $$unsubscribe_heights;
  let $toasts, $$unsubscribe_toasts;
  const defaultClasses = {
    toast: "",
    title: "",
    description: "",
    loader: "",
    closeButton: "",
    cancelButton: "",
    actionButton: "",
    action: "",
    warning: "",
    error: "",
    success: "",
    default: "",
    info: "",
    loading: ""
  };
  const { toasts, heights, removeHeight, setHeight, remove } = toastState;
  $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
  $$unsubscribe_heights = subscribe(heights, (value) => $heights = value);
  let { toast } = $$props;
  let { index } = $$props;
  let { expanded } = $$props;
  let { invert } = $$props;
  let { position } = $$props;
  let { visibleToasts } = $$props;
  let { expandByDefault } = $$props;
  let { closeButton } = $$props;
  let { interacting } = $$props;
  let { cancelButtonStyle = "" } = $$props;
  let { actionButtonStyle = "" } = $$props;
  let { duration = 4e3 } = $$props;
  let { descriptionClass = "" } = $$props;
  let { classes = {} } = $$props;
  let { unstyled = false } = $$props;
  let mounted = false;
  let removed = false;
  let swiping = false;
  let swipeOut = false;
  let offsetBeforeRemove = 0;
  let initialHeight = 0;
  let toastRef;
  let offset = 0;
  let closeTimerStartTimeRef = 0;
  let lastCloseTimerStartTimeRef = 0;
  async function updateHeights() {
    {
      return;
    }
  }
  function deleteToast() {
    removed = true;
    offsetBeforeRemove = offset;
    removeHeight(toast.id);
    setTimeout(
      () => {
        remove(toast.id);
      },
      TIME_BEFORE_UNMOUNT
    );
  }
  let timeoutId;
  let remainingTime = toast.duration || duration || TOAST_LIFETIME;
  function pauseTimer() {
    if (lastCloseTimerStartTimeRef < closeTimerStartTimeRef) {
      const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef;
      remainingTime = remainingTime - elapsedTime;
    }
    lastCloseTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
  }
  function startTimer() {
    closeTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
    timeoutId = setTimeout(
      () => {
        toast.onAutoClose?.(toast);
        deleteToast();
      },
      remainingTime
    );
  }
  let effect2;
  if ($$props.toast === void 0 && $$bindings.toast && toast !== void 0)
    $$bindings.toast(toast);
  if ($$props.index === void 0 && $$bindings.index && index !== void 0)
    $$bindings.index(index);
  if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0)
    $$bindings.expanded(expanded);
  if ($$props.invert === void 0 && $$bindings.invert && invert !== void 0)
    $$bindings.invert(invert);
  if ($$props.position === void 0 && $$bindings.position && position !== void 0)
    $$bindings.position(position);
  if ($$props.visibleToasts === void 0 && $$bindings.visibleToasts && visibleToasts !== void 0)
    $$bindings.visibleToasts(visibleToasts);
  if ($$props.expandByDefault === void 0 && $$bindings.expandByDefault && expandByDefault !== void 0)
    $$bindings.expandByDefault(expandByDefault);
  if ($$props.closeButton === void 0 && $$bindings.closeButton && closeButton !== void 0)
    $$bindings.closeButton(closeButton);
  if ($$props.interacting === void 0 && $$bindings.interacting && interacting !== void 0)
    $$bindings.interacting(interacting);
  if ($$props.cancelButtonStyle === void 0 && $$bindings.cancelButtonStyle && cancelButtonStyle !== void 0)
    $$bindings.cancelButtonStyle(cancelButtonStyle);
  if ($$props.actionButtonStyle === void 0 && $$bindings.actionButtonStyle && actionButtonStyle !== void 0)
    $$bindings.actionButtonStyle(actionButtonStyle);
  if ($$props.duration === void 0 && $$bindings.duration && duration !== void 0)
    $$bindings.duration(duration);
  if ($$props.descriptionClass === void 0 && $$bindings.descriptionClass && descriptionClass !== void 0)
    $$bindings.descriptionClass(descriptionClass);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  if ($$props.unstyled === void 0 && $$bindings.unstyled && unstyled !== void 0)
    $$bindings.unstyled(unstyled);
  classes = { ...defaultClasses, ...classes };
  isFront = index === 0;
  isVisible = index + 1 <= visibleToasts;
  toast.title;
  toast.description;
  toastType = toast.type;
  toastClass = toast.class || "";
  toastDescriptionClass = toast.descriptionClass || "";
  heightIndex = $heights.findIndex((height) => height.toastId === toast.id) || 0;
  coords = position.split("-");
  toastsHeightBefore = $heights.reduce(
    (prev2, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex)
        return prev2;
      return prev2 + curr.height;
    },
    0
  );
  invert = toast.invert || invert;
  disabled = toastType === "loading";
  offset = Math.round(heightIndex * GAP$1 + toastsHeightBefore);
  {
    updateHeights();
  }
  {
    if (toast.updated) {
      clearTimeout(timeoutId);
      remainingTime = toast.duration || duration || TOAST_LIFETIME;
      startTimer();
    }
  }
  isPromiseLoadingOrInfiniteDuration = toast.promise && toastType === "loading" || toast.duration === Number.POSITIVE_INFINITY;
  $$subscribe_effect(effect2 = useEffect(() => {
    if (!isPromiseLoadingOrInfiniteDuration) {
      if (expanded || interacting) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
    return () => clearTimeout(timeoutId);
  }));
  {
    if (toast.delete) {
      deleteToast();
    }
  }
  $$unsubscribe_effect();
  $$unsubscribe_heights();
  $$unsubscribe_toasts();
  return `   <li${add_attribute("aria-live", toast.important ? "assertive" : "polite", 0)} aria-atomic="true" role="status"${add_attribute("tabindex", 0, 0)}${add_attribute("class", cn($$props.class, toastClass, classes?.toast, toast?.classes?.toast, classes?.[toastType], toast?.classes?.[toastType]), 0)} data-sonner-toast=""${add_attribute("data-styled", !(toast.component || toast?.unstyled || unstyled), 0)}${add_attribute("data-mounted", mounted, 0)}${add_attribute("data-promise", Boolean(toast.promise), 0)}${add_attribute("data-removed", removed, 0)}${add_attribute("data-visible", isVisible, 0)}${add_attribute("data-y-position", coords[0], 0)}${add_attribute("data-x-position", coords[1], 0)}${add_attribute("data-index", index, 0)}${add_attribute("data-front", isFront, 0)}${add_attribute("data-swiping", swiping, 0)}${add_attribute("data-type", toastType, 0)}${add_attribute("data-invert", invert, 0)}${add_attribute("data-swipe-out", swipeOut, 0)}${add_attribute("data-expanded", Boolean(expanded || expandByDefault && mounted), 0)}${add_styles(merge_ssr_styles(escape(`${$$props.style} ${toast.style}`, true), {
    "--index": index,
    "--toasts-before": index,
    "--z-index": $toasts.length - index,
    "--offset": `${removed ? offsetBeforeRemove : offset}px`,
    "--initial-height": `${initialHeight}px`
  }))}${add_attribute("this", toastRef, 0)}>${closeButton && !toast.component ? `<button aria-label="Close toast"${add_attribute("data-disabled", disabled, 0)} data-close-button${add_attribute("class", cn(classes?.closeButton, toast?.classes?.closeButton), 0)}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>` : ``} ${toast.component ? `${validate_component(toast.component || missing_component, "svelte:component").$$render($$result, Object.assign({}, toast.componentProps), {}, {})}` : `${toastType !== "default" || toast.icon || toast.promise ? `<div data-icon="">${(toast.promise || toastType === "loading") && !toast.icon ? `${slots["loading-icon"] ? slots["loading-icon"]({}) : ``}` : ``} ${toast.icon ? `${validate_component(toast.icon || missing_component, "svelte:component").$$render($$result, {}, {}, {})}` : `${toastType === "success" ? `${slots["success-icon"] ? slots["success-icon"]({}) : ``}` : `${toastType === "error" ? `${slots["error-icon"] ? slots["error-icon"]({}) : ``}` : `${toastType === "warning" ? `${slots["warning-icon"] ? slots["warning-icon"]({}) : ``}` : `${toastType === "info" ? `${slots["info-icon"] ? slots["info-icon"]({}) : ``}` : ``}`}`}`}`}</div>` : ``} <div data-content="">${toast.title ? `<div data-title=""${add_attribute("class", cn(classes?.title, toast?.classes?.title), 0)}>${typeof toast.title !== "string" ? `${validate_component(toast.title || missing_component, "svelte:component").$$render($$result, Object.assign({}, toast.componentProps), {}, {})}` : `${escape(toast.title)}`}</div>` : ``} ${toast.description ? `<div data-description=""${add_attribute("class", cn(descriptionClass, toastDescriptionClass, classes?.description, toast.classes?.description), 0)}>${typeof toast.description !== "string" ? `${validate_component(toast.description || missing_component, "svelte:component").$$render($$result, Object.assign({}, toast.componentProps), {}, {})}` : `${escape(toast.description)}`}</div>` : ``}</div> ${toast.cancel ? `<button data-button data-cancel${add_attribute("style", cancelButtonStyle, 0)}${add_attribute("class", cn(classes?.cancelButton, toast?.classes?.cancelButton), 0)}>${escape(toast.cancel.label)}</button>` : ``} ${toast.action ? `<button data-button=""${add_attribute("style", actionButtonStyle, 0)}${add_attribute("class", cn(classes?.actionButton, toast?.classes?.actionButton), 0)}>${escape(toast.action.label)}</button>` : ``}`}</li>`;
});
const css = {
  code: ":where(html[dir='ltr']),:where([data-sonner-toaster][dir='ltr']){--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}:where(html[dir='rtl']),:where([data-sonner-toaster][dir='rtl']){--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,\n			system-ui,\n			-apple-system,\n			BlinkMacSystemFont,\n			Segoe UI,\n			Roboto,\n			Helvetica Neue,\n			Arial,\n			Noto Sans,\n			sans-serif,\n			Apple Color Emoji,\n			Segoe UI Emoji,\n			Segoe UI Symbol,\n			Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999}:where([data-sonner-toaster][data-x-position='right']){right:max(var(--offset), env(safe-area-inset-right))}:where([data-sonner-toaster][data-x-position='left']){left:max(var(--offset), env(safe-area-inset-left))}:where([data-sonner-toaster][data-x-position='center']){left:50%;transform:translateX(-50%)}:where([data-sonner-toaster][data-y-position='top']){top:max(var(--offset), env(safe-area-inset-top))}:where([data-sonner-toaster][data-y-position='bottom']){bottom:max(var(--offset), env(safe-area-inset-bottom))}:where([data-sonner-toast]){--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform 400ms,\n			opacity 400ms,\n			height 400ms,\n			box-shadow 200ms;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled='true']){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0px 4px 12px rgba(0, 0, 0, 0.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0px 4px 12px rgba(0, 0, 0, 0.1),\n			0 0 0 2px rgba(0, 0, 0, 0.2)}:where([data-sonner-toast][data-y-position='top']){top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position='bottom']){bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise='true']) :where([data-icon])>svg{opacity:0;transform:scale(0.8);transform-origin:center;animation:sonner-fade-in 300ms ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled='true'] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity 400ms,\n			box-shadow 200ms}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px rgba(0, 0, 0, 0.4)}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0, 0, 0, 0.08)}:where([data-sonner-toast][data-theme='dark']) :where([data-cancel]){background:rgba(255, 255, 255, 0.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;background:var(--gray1);color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity 100ms,\n			background 200ms,\n			border-color 200ms}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0px 4px 12px rgba(0, 0, 0, 0.1),\n			0 0 0 2px rgba(0, 0, 0, 0.2)}:where([data-sonner-toast]) :where([data-disabled='true']){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping='true'])::before{content:'';position:absolute;left:0;right:0;height:100%;z-index:-1}:where(\n			[data-sonner-toast][data-y-position='top'][data-swiping='true']\n		)::before{bottom:50%;transform:scaleY(3) translateY(50%)}:where(\n			[data-sonner-toast][data-y-position='bottom'][data-swiping='true']\n		)::before{top:50%;transform:scaleY(3) translateY(-50%)}:where(\n			[data-sonner-toast][data-swiping='false'][data-removed='true']\n		)::before{content:'';position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast])::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted='true']){--y:translateY(0);opacity:1}:where([data-sonner-toast][data-expanded='false'][data-front='false']){--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before)))\n			scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity 400ms}:where(\n			[data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true']\n		)\n		>*{opacity:0}:where([data-sonner-toast][data-visible='false']){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted='true'][data-expanded='true']){--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where(\n			[data-sonner-toast][data-removed='true'][data-front='true'][data-swipe-out='false']\n		){--y:translateY(calc(var(--lift) * -100%));opacity:0}:where(\n			[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='true']\n		){--y:translateY(\n			calc(var(--lift) * var(--offset) + var(--lift) * -100%)\n		);opacity:0}:where(\n			[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='false']\n		){--y:translateY(40%);opacity:0;transition:transform 500ms,\n			opacity 200ms}:where(\n			[data-sonner-toast][data-removed='true'][data-front='false']\n		)::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping='true']{transform:var(--y) translateY(var(--swipe-amount, 0px));transition:none}[data-sonner-toast][data-swipe-out='true'][data-y-position='bottom'],[data-sonner-toast][data-swipe-out='true'][data-y-position='top']{animation:swipe-out 200ms ease-out forwards}@keyframes swipe-out{from{transform:translateY(\n				calc(var(--lift) * var(--offset) + var(--swipe-amount))\n			);opacity:1}to{transform:translateY(\n				calc(\n					var(--lift) * var(--offset) + var(--swipe-amount) +\n						var(--lift) * -100%\n				)\n			);opacity:0}}@media(max-width: 600px){[data-sonner-toaster]{position:fixed;--mobile-offset:16px;right:var(--mobile-offset);left:var(--mobile-offset);width:100%}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset) * 2)}[data-sonner-toaster][data-x-position='left']{left:var(--mobile-offset)}[data-sonner-toaster][data-y-position='bottom']{bottom:20px}[data-sonner-toaster][data-y-position='top']{top:20px}[data-sonner-toaster][data-x-position='center']{left:var(--mobile-offset);right:var(--mobile-offset);transform:none}}[data-sonner-toaster][data-theme='light']{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 91%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 91%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 91%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme='light']\n		[data-sonner-toast][data-invert='true']{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-theme='dark']\n		[data-sonner-toast][data-invert='true']{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-theme='dark']{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 100%, 12%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 12%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-rich-colors='true'] [data-sonner-toast][data-type='success']{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-theme='dark']\n		[data-sonner-toast][data-type='default']\n		[data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-rich-colors='true']\n		[data-sonner-toast][data-type='success']\n		[data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors='true'] [data-sonner-toast][data-type='info']{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors='true']\n		[data-sonner-toast][data-type='info']\n		[data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors='true'] [data-sonner-toast][data-type='warning']{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors='true']\n		[data-sonner-toast][data-type='warning']\n		[data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors='true'] [data-sonner-toast][data-type='error']{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors='true']\n		[data-sonner-toast][data-type='error']\n		[data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible='false']{transform-origin:center;animation:sonner-fade-out 0.2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(0.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-0.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-0.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-0.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-0.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-0.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-0.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-0.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-0.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-0.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(0.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:0.15}}@media(prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none !important;animation:none !important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);transform-origin:center;transition:opacity 200ms,\n			transform 200ms}.sonner-loader[data-visible='false']{opacity:0;transform:scale(0.8) translate(-50%, -50%)}",
  map: `{"version":3,"file":"Toaster.svelte","sources":["Toaster.svelte"],"sourcesContent":["<script>import { onDestroy, onMount } from 'svelte';\\nimport { toastState } from './state.js';\\nimport Toast from './Toast.svelte';\\nimport Loader from './Loader.svelte';\\nimport Icon from './Icon.svelte';\\n// Visible toasts amount\\nconst VISIBLE_TOASTS_AMOUNT = 3;\\n// Viewport padding\\nconst VIEWPORT_OFFSET = '32px';\\n// Default toast width\\nconst TOAST_WIDTH = 356;\\n// Default gap between toasts\\nconst GAP = 14;\\nconst DARK = 'dark';\\nconst LIGHT = 'light';\\nfunction getInitialTheme(t) {\\n    if (t !== 'system') {\\n        return t;\\n    }\\n    if (typeof window !== 'undefined') {\\n        if (window.matchMedia &&\\n            window.matchMedia('(prefers-color-scheme: dark)').matches) {\\n            return DARK;\\n        }\\n        return LIGHT;\\n    }\\n    return LIGHT;\\n}\\nfunction getDocumentDirection() {\\n    if (typeof window === 'undefined')\\n        return 'ltr';\\n    if (typeof document === 'undefined')\\n        return 'ltr'; // For Fresh purpose\\n    const dirAttribute = document.documentElement.getAttribute('dir');\\n    if (dirAttribute === 'auto' || !dirAttribute) {\\n        return window.getComputedStyle(document.documentElement)\\n            .direction;\\n    }\\n    return dirAttribute;\\n}\\nexport let invert = false;\\nexport let theme = 'light';\\nexport let position = 'bottom-right';\\nexport let hotkey = ['altKey', 'KeyT'];\\nexport let richColors = false;\\nexport let expand = false;\\nexport let duration = 4000;\\nexport let visibleToasts = VISIBLE_TOASTS_AMOUNT;\\nexport let closeButton = false;\\nexport let toastOptions = {};\\nexport let offset = null;\\nexport let dir = getDocumentDirection();\\nconst { toasts, heights, reset } = toastState;\\n$: possiblePositions = Array.from(new Set([\\n    position,\\n    ...$toasts\\n        .filter((toast) => toast.position)\\n        .map((toast) => toast.position)\\n].filter(Boolean)));\\nlet expanded = false;\\nlet interacting = false;\\nlet actualTheme = getInitialTheme(theme);\\nlet listRef;\\nlet lastFocusedElementRef = null;\\nlet isFocusWithinRef = false;\\n$: hotkeyLabel = hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '');\\n$: if ($toasts.length <= 1) {\\n    expanded = false;\\n}\\n// Check for dismissed toasts and remove them. We need to do this to have dismiss animation.\\n$: {\\n    const toastsToDismiss = $toasts.filter((toast) => toast.dismiss && !toast.delete);\\n    if (toastsToDismiss.length > 0) {\\n        const updatedToasts = $toasts.map((toast) => {\\n            const matchingToast = toastsToDismiss.find((dismissToast) => dismissToast.id === toast.id);\\n            if (matchingToast) {\\n                return { ...toast, delete: true };\\n            }\\n            return toast;\\n        });\\n        toasts.set(updatedToasts);\\n    }\\n}\\nonDestroy(() => {\\n    if (listRef && lastFocusedElementRef) {\\n        lastFocusedElementRef.focus({ preventScroll: true });\\n        lastFocusedElementRef = null;\\n        isFocusWithinRef = false;\\n    }\\n});\\nonMount(() => {\\n    reset();\\n    const handleKeydown = (event) => {\\n        const isHotkeyPressed = hotkey.every((key) => \\n        // eslint-disable-next-line @typescript-eslint/no-explicit-any\\n        event[key] || event.code === key);\\n        if (isHotkeyPressed) {\\n            expanded = true;\\n            listRef?.focus();\\n        }\\n        if (event.code === 'Escape' &&\\n            (document.activeElement === listRef ||\\n                listRef?.contains(document.activeElement))) {\\n            expanded = false;\\n        }\\n    };\\n    document.addEventListener('keydown', handleKeydown);\\n    return () => {\\n        document.removeEventListener('keydown', handleKeydown);\\n    };\\n});\\n$: {\\n    if (theme !== 'system') {\\n        actualTheme = theme;\\n    }\\n    if (typeof window !== 'undefined') {\\n        if (theme === 'system') {\\n            // check if current preference is dark\\n            if (window.matchMedia &&\\n                window.matchMedia('(prefers-color-scheme: dark)').matches) {\\n                // it's currently dark\\n                actualTheme = DARK;\\n            }\\n            else {\\n                // it's not dark\\n                actualTheme = LIGHT;\\n            }\\n        }\\n        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');\\n        const changeHandler = ({ matches }) => {\\n            actualTheme = matches ? DARK : LIGHT;\\n        };\\n        if ('addEventListener' in mediaQueryList) {\\n            mediaQueryList.addEventListener('change', changeHandler);\\n        }\\n        else {\\n            // @ts-expect-error deprecated API\\n            mediaQueryList.addListener(changeHandler);\\n        }\\n    }\\n}\\nfunction handleBlur(event) {\\n    if (isFocusWithinRef &&\\n        !event.currentTarget.contains(event.relatedTarget)) {\\n        isFocusWithinRef = false;\\n        if (lastFocusedElementRef) {\\n            lastFocusedElementRef.focus({ preventScroll: true });\\n            lastFocusedElementRef = null;\\n        }\\n    }\\n}\\nfunction handleFocus(event) {\\n    if (!isFocusWithinRef) {\\n        isFocusWithinRef = true;\\n        lastFocusedElementRef = event.relatedTarget;\\n    }\\n}\\n<\/script>\\n\\n{#if $toasts.length > 0}\\n\\t<section aria-label={\`Notifications \${hotkeyLabel}\`} tabIndex={-1}>\\n\\t\\t{#each possiblePositions as position, index}\\n\\t\\t\\t<ol\\n\\t\\t\\t\\ttabIndex={-1}\\n\\t\\t\\t\\tbind:this={listRef}\\n\\t\\t\\t\\tclass={$$props.class}\\n\\t\\t\\t\\tdata-sonner-toaster\\n\\t\\t\\t\\tdata-theme={actualTheme}\\n\\t\\t\\t\\tdata-rich-colors={richColors}\\n\\t\\t\\t\\tdir={dir === 'auto' ? getDocumentDirection() : dir}\\n\\t\\t\\t\\tdata-y-position={position.split('-')[0]}\\n\\t\\t\\t\\tdata-x-position={position.split('-')[1]}\\n\\t\\t\\t\\ton:blur={handleBlur}\\n\\t\\t\\t\\ton:focus={handleFocus}\\n\\t\\t\\t\\ton:mouseenter={() => (expanded = true)}\\n\\t\\t\\t\\ton:mousemove={() => (expanded = true)}\\n\\t\\t\\t\\ton:mouseleave={() => {\\n\\t\\t\\t\\t\\tif (!interacting) {\\n\\t\\t\\t\\t\\t\\texpanded = false;\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t}}\\n\\t\\t\\t\\ton:pointerdown={() => (interacting = true)}\\n\\t\\t\\t\\ton:pointerup={() => (interacting = false)}\\n\\t\\t\\t\\tstyle:--front-toast-height={\`\${$heights[0]?.height}px\`}\\n\\t\\t\\t\\tstyle:--offset={typeof offset === 'number'\\n\\t\\t\\t\\t\\t? \`\${offset}px\`\\n\\t\\t\\t\\t\\t: offset || VIEWPORT_OFFSET}\\n\\t\\t\\t\\tstyle:--width={\`\${TOAST_WIDTH}px\`}\\n\\t\\t\\t\\tstyle:--gap={\`\${GAP}px\`}\\n\\t\\t\\t\\tstyle={$$props.style}\\n\\t\\t\\t\\t{...$$restProps}\\n\\t\\t\\t>\\n\\t\\t\\t\\t{#each $toasts.filter((toast) => (!toast.position && index === 0) || toast.position === position) as toast, index (toast.id)}\\n\\t\\t\\t\\t\\t<Toast\\n\\t\\t\\t\\t\\t\\t{index}\\n\\t\\t\\t\\t\\t\\t{toast}\\n\\t\\t\\t\\t\\t\\t{invert}\\n\\t\\t\\t\\t\\t\\t{visibleToasts}\\n\\t\\t\\t\\t\\t\\t{closeButton}\\n\\t\\t\\t\\t\\t\\t{interacting}\\n\\t\\t\\t\\t\\t\\t{position}\\n\\t\\t\\t\\t\\t\\texpandByDefault={expand}\\n\\t\\t\\t\\t\\t\\t{expanded}\\n\\t\\t\\t\\t\\t\\tactionButtonStyle={toastOptions?.actionButtonStyle ||\\n\\t\\t\\t\\t\\t\\t\\t''}\\n\\t\\t\\t\\t\\t\\tcancelButtonStyle={toastOptions?.cancelButtonStyle ||\\n\\t\\t\\t\\t\\t\\t\\t''}\\n\\t\\t\\t\\t\\t\\tclass={toastOptions?.class || ''}\\n\\t\\t\\t\\t\\t\\tdescriptionClass={toastOptions?.descriptionClass || ''}\\n\\t\\t\\t\\t\\t\\tclasses={toastOptions.classes || {}}\\n\\t\\t\\t\\t\\t\\tduration={toastOptions?.duration ?? duration}\\n\\t\\t\\t\\t\\t\\tunstyled={toastOptions.unstyled || false}\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t<slot name=\\"loading-icon\\" slot=\\"loading-icon\\">\\n\\t\\t\\t\\t\\t\\t\\t<Loader visible={toast.type === 'loading'} />\\n\\t\\t\\t\\t\\t\\t</slot>\\n\\t\\t\\t\\t\\t\\t<slot name=\\"success-icon\\" slot=\\"success-icon\\">\\n\\t\\t\\t\\t\\t\\t\\t<Icon type=\\"success\\" />\\n\\t\\t\\t\\t\\t\\t</slot>\\n\\t\\t\\t\\t\\t\\t<slot name=\\"error-icon\\" slot=\\"error-icon\\">\\n\\t\\t\\t\\t\\t\\t\\t<Icon type=\\"error\\" />\\n\\t\\t\\t\\t\\t\\t</slot>\\n\\t\\t\\t\\t\\t\\t<slot name=\\"warning-icon\\" slot=\\"warning-icon\\">\\n\\t\\t\\t\\t\\t\\t\\t<Icon type=\\"warning\\" />\\n\\t\\t\\t\\t\\t\\t</slot>\\n\\t\\t\\t\\t\\t\\t<slot name=\\"info-icon\\" slot=\\"info-icon\\">\\n\\t\\t\\t\\t\\t\\t\\t<Icon type=\\"info\\" />\\n\\t\\t\\t\\t\\t\\t</slot>\\n\\t\\t\\t\\t\\t</Toast>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t</ol>\\n\\t\\t{/each}\\n\\t</section>\\n{/if}\\n\\n<style global>\\n\\t:global(:where(html[dir='ltr'])),\\n\\t:global(:where([data-sonner-toaster][dir='ltr'])) {\\n\\t\\t--toast-icon-margin-start: -3px;\\n\\t\\t--toast-icon-margin-end: 4px;\\n\\t\\t--toast-svg-margin-start: -1px;\\n\\t\\t--toast-svg-margin-end: 0px;\\n\\t\\t--toast-button-margin-start: auto;\\n\\t\\t--toast-button-margin-end: 0;\\n\\t\\t--toast-close-button-start: 0;\\n\\t\\t--toast-close-button-end: unset;\\n\\t\\t--toast-close-button-transform: translate(-35%, -35%);\\n\\t}\\n\\n\\t:global(:where(html[dir='rtl'])),\\n\\t:global(:where([data-sonner-toaster][dir='rtl'])) {\\n\\t\\t--toast-icon-margin-start: 4px;\\n\\t\\t--toast-icon-margin-end: -3px;\\n\\t\\t--toast-svg-margin-start: 0px;\\n\\t\\t--toast-svg-margin-end: -1px;\\n\\t\\t--toast-button-margin-start: 0;\\n\\t\\t--toast-button-margin-end: auto;\\n\\t\\t--toast-close-button-start: unset;\\n\\t\\t--toast-close-button-end: 0;\\n\\t\\t--toast-close-button-transform: translate(35%, -35%);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toaster])) {\\n\\t\\tposition: fixed;\\n\\t\\twidth: var(--width);\\n\\t\\tfont-family:\\n\\t\\t\\tui-sans-serif,\\n\\t\\t\\tsystem-ui,\\n\\t\\t\\t-apple-system,\\n\\t\\t\\tBlinkMacSystemFont,\\n\\t\\t\\tSegoe UI,\\n\\t\\t\\tRoboto,\\n\\t\\t\\tHelvetica Neue,\\n\\t\\t\\tArial,\\n\\t\\t\\tNoto Sans,\\n\\t\\t\\tsans-serif,\\n\\t\\t\\tApple Color Emoji,\\n\\t\\t\\tSegoe UI Emoji,\\n\\t\\t\\tSegoe UI Symbol,\\n\\t\\t\\tNoto Color Emoji;\\n\\t\\t--gray1: hsl(0, 0%, 99%);\\n\\t\\t--gray2: hsl(0, 0%, 97.3%);\\n\\t\\t--gray3: hsl(0, 0%, 95.1%);\\n\\t\\t--gray4: hsl(0, 0%, 93%);\\n\\t\\t--gray5: hsl(0, 0%, 90.9%);\\n\\t\\t--gray6: hsl(0, 0%, 88.7%);\\n\\t\\t--gray7: hsl(0, 0%, 85.8%);\\n\\t\\t--gray8: hsl(0, 0%, 78%);\\n\\t\\t--gray9: hsl(0, 0%, 56.1%);\\n\\t\\t--gray10: hsl(0, 0%, 52.3%);\\n\\t\\t--gray11: hsl(0, 0%, 43.5%);\\n\\t\\t--gray12: hsl(0, 0%, 9%);\\n\\t\\t--border-radius: 8px;\\n\\t\\tbox-sizing: border-box;\\n\\t\\tpadding: 0;\\n\\t\\tmargin: 0;\\n\\t\\tlist-style: none;\\n\\t\\toutline: none;\\n\\t\\tz-index: 999999999;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toaster][data-x-position='right'])) {\\n\\t\\tright: max(var(--offset), env(safe-area-inset-right));\\n\\t}\\n\\n\\t:global(:where([data-sonner-toaster][data-x-position='left'])) {\\n\\t\\tleft: max(var(--offset), env(safe-area-inset-left));\\n\\t}\\n\\n\\t:global(:where([data-sonner-toaster][data-x-position='center'])) {\\n\\t\\tleft: 50%;\\n\\t\\ttransform: translateX(-50%);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toaster][data-y-position='top'])) {\\n\\t\\ttop: max(var(--offset), env(safe-area-inset-top));\\n\\t}\\n\\n\\t:global(:where([data-sonner-toaster][data-y-position='bottom'])) {\\n\\t\\tbottom: max(var(--offset), env(safe-area-inset-bottom));\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) {\\n\\t\\t--y: translateY(100%);\\n\\t\\t--lift-amount: calc(var(--lift) * var(--gap));\\n\\t\\tz-index: var(--z-index);\\n\\t\\tposition: absolute;\\n\\t\\topacity: 0;\\n\\t\\ttransform: var(--y);\\n\\t\\tfilter: blur(0);\\n\\t\\t/* https://stackoverflow.com/questions/48124372/pointermove-event-not-working-with-touch-why-not */\\n\\t\\ttouch-action: none;\\n\\t\\ttransition:\\n\\t\\t\\ttransform 400ms,\\n\\t\\t\\topacity 400ms,\\n\\t\\t\\theight 400ms,\\n\\t\\t\\tbox-shadow 200ms;\\n\\t\\tbox-sizing: border-box;\\n\\t\\toutline: none;\\n\\t\\toverflow-wrap: anywhere;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-styled='true'])) {\\n\\t\\tpadding: 16px;\\n\\t\\tbackground: var(--normal-bg);\\n\\t\\tborder: 1px solid var(--normal-border);\\n\\t\\tcolor: var(--normal-text);\\n\\t\\tborder-radius: var(--border-radius);\\n\\t\\tbox-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);\\n\\t\\twidth: var(--width);\\n\\t\\tfont-size: 13px;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tgap: 6px;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast]:focus-visible)) {\\n\\t\\tbox-shadow:\\n\\t\\t\\t0px 4px 12px rgba(0, 0, 0, 0.1),\\n\\t\\t\\t0 0 0 2px rgba(0, 0, 0, 0.2);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-y-position='top'])) {\\n\\t\\ttop: 0;\\n\\t\\t--y: translateY(-100%);\\n\\t\\t--lift: 1;\\n\\t\\t--lift-amount: calc(1 * var(--gap));\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-y-position='bottom'])) {\\n\\t\\tbottom: 0;\\n\\t\\t--y: translateY(100%);\\n\\t\\t--lift: -1;\\n\\t\\t--lift-amount: calc(var(--lift) * var(--gap));\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-description])) {\\n\\t\\tfont-weight: 400;\\n\\t\\tline-height: 1.4;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-title])) {\\n\\t\\tfont-weight: 500;\\n\\t\\tline-height: 1.5;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-icon])) {\\n\\t\\tdisplay: flex;\\n\\t\\theight: 16px;\\n\\t\\twidth: 16px;\\n\\t\\tposition: relative;\\n\\t\\tjustify-content: flex-start;\\n\\t\\talign-items: center;\\n\\t\\tflex-shrink: 0;\\n\\t\\tmargin-left: var(--toast-icon-margin-start);\\n\\t\\tmargin-right: var(--toast-icon-margin-end);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-promise='true'])) :global(:where([data-icon])) > :global(svg) {\\n\\t\\topacity: 0;\\n\\t\\ttransform: scale(0.8);\\n\\t\\ttransform-origin: center;\\n\\t\\tanimation: sonner-fade-in 300ms ease forwards;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-icon])) > :global(*) {\\n\\t\\tflex-shrink: 0;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-icon])) :global(svg) {\\n\\t\\tmargin-left: var(--toast-svg-margin-start);\\n\\t\\tmargin-right: var(--toast-svg-margin-end);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-content])) {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tgap: 2px;\\n\\t}\\n\\n\\t:global([data-sonner-toast][data-styled='true']) :global([data-button]) {\\n\\t\\tborder-radius: 4px;\\n\\t\\tpadding-left: 8px;\\n\\t\\tpadding-right: 8px;\\n\\t\\theight: 24px;\\n\\t\\tfont-size: 12px;\\n\\t\\tcolor: var(--normal-bg);\\n\\t\\tbackground: var(--normal-text);\\n\\t\\tmargin-left: var(--toast-button-margin-start);\\n\\t\\tmargin-right: var(--toast-button-margin-end);\\n\\t\\tborder: none;\\n\\t\\tcursor: pointer;\\n\\t\\toutline: none;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tflex-shrink: 0;\\n\\t\\ttransition:\\n\\t\\t\\topacity 400ms,\\n\\t\\t\\tbox-shadow 200ms;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-button]):focus-visible) {\\n\\t\\tbox-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-button]):first-of-type) {\\n\\t\\tmargin-left: var(--toast-button-margin-start);\\n\\t\\tmargin-right: var(--toast-button-margin-end);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-cancel])) {\\n\\t\\tcolor: var(--normal-text);\\n\\t\\tbackground: rgba(0, 0, 0, 0.08);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-theme='dark'])) :global(:where([data-cancel])) {\\n\\t\\tbackground: rgba(255, 255, 255, 0.3);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-close-button])) {\\n\\t\\tposition: absolute;\\n\\t\\tleft: var(--toast-close-button-start);\\n\\t\\tright: var(--toast-close-button-end);\\n\\t\\ttop: 0;\\n\\t\\theight: 20px;\\n\\t\\twidth: 20px;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tpadding: 0;\\n\\t\\tbackground: var(--gray1);\\n\\t\\tcolor: var(--gray12);\\n\\t\\tborder: 1px solid var(--gray4);\\n\\t\\ttransform: var(--toast-close-button-transform);\\n\\t\\tborder-radius: 50%;\\n\\t\\tcursor: pointer;\\n\\t\\tz-index: 1;\\n\\t\\ttransition:\\n\\t\\t\\topacity 100ms,\\n\\t\\t\\tbackground 200ms,\\n\\t\\t\\tborder-color 200ms;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-close-button]):focus-visible) {\\n\\t\\tbox-shadow:\\n\\t\\t\\t0px 4px 12px rgba(0, 0, 0, 0.1),\\n\\t\\t\\t0 0 0 2px rgba(0, 0, 0, 0.2);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) :global(:where([data-disabled='true'])) {\\n\\t\\tcursor: not-allowed;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast]):hover) :global(:where([data-close-button]):hover) {\\n\\t\\tbackground: var(--gray2);\\n\\t\\tborder-color: var(--gray5);\\n\\t}\\n\\n\\t/* Leave a ghost div to avoid setting hover to false when swiping out */\\n\\t:global(:where([data-sonner-toast][data-swiping='true'])::before) {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\tright: 0;\\n\\t\\theight: 100%;\\n\\t\\tz-index: -1;\\n\\t}\\n\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-y-position='top'][data-swiping='true']\\n\\t\\t)::before) {\\n\\t\\t/* y 50% needed to distribute height additional height evenly */\\n\\t\\tbottom: 50%;\\n\\t\\ttransform: scaleY(3) translateY(50%);\\n\\t}\\n\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-y-position='bottom'][data-swiping='true']\\n\\t\\t)::before) {\\n\\t\\t/* y -50% needed to distribute height additional height evenly */\\n\\t\\ttop: 50%;\\n\\t\\ttransform: scaleY(3) translateY(-50%);\\n\\t}\\n\\n\\t/* Leave a ghost div to avoid setting hover to false when transitioning out */\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-swiping='false'][data-removed='true']\\n\\t\\t)::before) {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\tinset: 0;\\n\\t\\ttransform: scaleY(2);\\n\\t}\\n\\n\\t/* Needed to avoid setting hover to false when inbetween toasts */\\n\\t:global(:where([data-sonner-toast])::after) {\\n\\t\\tcontent: '';\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\theight: calc(var(--gap) + 1px);\\n\\t\\tbottom: 100%;\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-mounted='true'])) {\\n\\t\\t--y: translateY(0);\\n\\t\\topacity: 1;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-expanded='false'][data-front='false'])) {\\n\\t\\t--scale: var(--toasts-before) * 0.05 + 1;\\n\\t\\t--y: translateY(calc(var(--lift-amount) * var(--toasts-before)))\\n\\t\\t\\tscale(calc(-1 * var(--scale)));\\n\\t\\theight: var(--front-toast-height);\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast])) > :global(*) {\\n\\t\\ttransition: opacity 400ms;\\n\\t}\\n\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true']\\n\\t\\t)\\n\\t\\t)> :global(*) {\\n\\t\\topacity: 0;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-visible='false'])) {\\n\\t\\topacity: 0;\\n\\t\\tpointer-events: none;\\n\\t}\\n\\n\\t:global(:where([data-sonner-toast][data-mounted='true'][data-expanded='true'])) {\\n\\t\\t--y: translateY(calc(var(--lift) * var(--offset)));\\n\\t\\theight: var(--initial-height);\\n\\t}\\n\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-removed='true'][data-front='true'][data-swipe-out='false']\\n\\t\\t)) {\\n\\t\\t--y: translateY(calc(var(--lift) * -100%));\\n\\t\\topacity: 0;\\n\\t}\\n\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='true']\\n\\t\\t)) {\\n\\t\\t--y: translateY(\\n\\t\\t\\tcalc(var(--lift) * var(--offset) + var(--lift) * -100%)\\n\\t\\t);\\n\\t\\topacity: 0;\\n\\t}\\n\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='false']\\n\\t\\t)) {\\n\\t\\t--y: translateY(40%);\\n\\t\\topacity: 0;\\n\\t\\ttransition:\\n\\t\\t\\ttransform 500ms,\\n\\t\\t\\topacity 200ms;\\n\\t}\\n\\n\\t/* Bump up the height to make sure hover state doesn't get set to false */\\n\\t:global(:where(\\n\\t\\t\\t[data-sonner-toast][data-removed='true'][data-front='false']\\n\\t\\t)::before) {\\n\\t\\theight: calc(var(--initial-height) + 20%);\\n\\t}\\n\\n\\t:global([data-sonner-toast][data-swiping='true']) {\\n\\t\\ttransform: var(--y) translateY(var(--swipe-amount, 0px));\\n\\t\\ttransition: none;\\n\\t}\\n\\n\\t:global([data-sonner-toast][data-swipe-out='true'][data-y-position='bottom']),\\n\\t:global([data-sonner-toast][data-swipe-out='true'][data-y-position='top']) {\\n\\t\\tanimation: swipe-out 200ms ease-out forwards;\\n\\t}\\n\\n\\t@keyframes -global-swipe-out {\\n\\t\\tfrom {\\n\\t\\t\\ttransform: translateY(\\n\\t\\t\\t\\tcalc(var(--lift) * var(--offset) + var(--swipe-amount))\\n\\t\\t\\t);\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\n\\t\\tto {\\n\\t\\t\\ttransform: translateY(\\n\\t\\t\\t\\tcalc(\\n\\t\\t\\t\\t\\tvar(--lift) * var(--offset) + var(--swipe-amount) +\\n\\t\\t\\t\\t\\t\\tvar(--lift) * -100%\\n\\t\\t\\t\\t)\\n\\t\\t\\t);\\n\\t\\t\\topacity: 0;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (max-width: 600px) {\\n\\t\\t:global([data-sonner-toaster]) {\\n\\t\\t\\tposition: fixed;\\n\\t\\t\\t--mobile-offset: 16px;\\n\\t\\t\\tright: var(--mobile-offset);\\n\\t\\t\\tleft: var(--mobile-offset);\\n\\t\\t\\twidth: 100%;\\n\\t\\t}\\n\\n\\t\\t:global([data-sonner-toaster]) :global([data-sonner-toast]) {\\n\\t\\t\\tleft: 0;\\n\\t\\t\\tright: 0;\\n\\t\\t\\twidth: calc(100% - var(--mobile-offset) * 2);\\n\\t\\t}\\n\\n\\t\\t:global([data-sonner-toaster][data-x-position='left']) {\\n\\t\\t\\tleft: var(--mobile-offset);\\n\\t\\t}\\n\\n\\t\\t:global([data-sonner-toaster][data-y-position='bottom']) {\\n\\t\\t\\tbottom: 20px;\\n\\t\\t}\\n\\n\\t\\t:global([data-sonner-toaster][data-y-position='top']) {\\n\\t\\t\\ttop: 20px;\\n\\t\\t}\\n\\n\\t\\t:global([data-sonner-toaster][data-x-position='center']) {\\n\\t\\t\\tleft: var(--mobile-offset);\\n\\t\\t\\tright: var(--mobile-offset);\\n\\t\\t\\ttransform: none;\\n\\t\\t}\\n\\t}\\n\\n\\t:global([data-sonner-toaster][data-theme='light']) {\\n\\t\\t--normal-bg: #fff;\\n\\t\\t--normal-border: var(--gray4);\\n\\t\\t--normal-text: var(--gray12);\\n\\n\\t\\t--success-bg: hsl(143, 85%, 96%);\\n\\t\\t--success-border: hsl(145, 92%, 91%);\\n\\t\\t--success-text: hsl(140, 100%, 27%);\\n\\n\\t\\t--info-bg: hsl(208, 100%, 97%);\\n\\t\\t--info-border: hsl(221, 91%, 91%);\\n\\t\\t--info-text: hsl(210, 92%, 45%);\\n\\n\\t\\t--warning-bg: hsl(49, 100%, 97%);\\n\\t\\t--warning-border: hsl(49, 91%, 91%);\\n\\t\\t--warning-text: hsl(31, 92%, 45%);\\n\\n\\t\\t--error-bg: hsl(359, 100%, 97%);\\n\\t\\t--error-border: hsl(359, 100%, 94%);\\n\\t\\t--error-text: hsl(360, 100%, 45%);\\n\\t}\\n\\n\\t:global([data-sonner-toaster][data-theme='light']\\n\\t\\t[data-sonner-toast][data-invert='true']) {\\n\\t\\t--normal-bg: #000;\\n\\t\\t--normal-border: hsl(0, 0%, 20%);\\n\\t\\t--normal-text: var(--gray1);\\n\\t}\\n\\n\\t:global([data-sonner-toaster][data-theme='dark']\\n\\t\\t[data-sonner-toast][data-invert='true']) {\\n\\t\\t--normal-bg: #fff;\\n\\t\\t--normal-border: var(--gray3);\\n\\t\\t--normal-text: var(--gray12);\\n\\t}\\n\\n\\t:global([data-sonner-toaster][data-theme='dark']) {\\n\\t\\t--normal-bg: #000;\\n\\t\\t--normal-border: hsl(0, 0%, 20%);\\n\\t\\t--normal-text: var(--gray1);\\n\\n\\t\\t--success-bg: hsl(150, 100%, 6%);\\n\\t\\t--success-border: hsl(147, 100%, 12%);\\n\\t\\t--success-text: hsl(150, 86%, 65%);\\n\\n\\t\\t--info-bg: hsl(215, 100%, 6%);\\n\\t\\t--info-border: hsl(223, 100%, 12%);\\n\\t\\t--info-text: hsl(216, 87%, 65%);\\n\\n\\t\\t--warning-bg: hsl(64, 100%, 6%);\\n\\t\\t--warning-border: hsl(60, 100%, 12%);\\n\\t\\t--warning-text: hsl(46, 87%, 65%);\\n\\n\\t\\t--error-bg: hsl(358, 76%, 10%);\\n\\t\\t--error-border: hsl(357, 89%, 16%);\\n\\t\\t--error-text: hsl(358, 100%, 81%);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']) :global([data-sonner-toast][data-type='success']) {\\n\\t\\tbackground: var(--success-bg);\\n\\t\\tborder-color: var(--success-border);\\n\\t\\tcolor: var(--success-text);\\n\\t}\\n\\n\\t:global([data-theme='dark']\\n\\t\\t[data-sonner-toast][data-type='default']\\n\\t\\t[data-close-button]) {\\n\\t\\tbackground: var(--normal-bg);\\n\\t\\tborder-color: var(--normal-border);\\n\\t\\tcolor: var(--normal-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']\\n\\t\\t[data-sonner-toast][data-type='success']\\n\\t\\t[data-close-button]) {\\n\\t\\tbackground: var(--success-bg);\\n\\t\\tborder-color: var(--success-border);\\n\\t\\tcolor: var(--success-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']) :global([data-sonner-toast][data-type='info']) {\\n\\t\\tbackground: var(--info-bg);\\n\\t\\tborder-color: var(--info-border);\\n\\t\\tcolor: var(--info-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']\\n\\t\\t[data-sonner-toast][data-type='info']\\n\\t\\t[data-close-button]) {\\n\\t\\tbackground: var(--info-bg);\\n\\t\\tborder-color: var(--info-border);\\n\\t\\tcolor: var(--info-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']) :global([data-sonner-toast][data-type='warning']) {\\n\\t\\tbackground: var(--warning-bg);\\n\\t\\tborder-color: var(--warning-border);\\n\\t\\tcolor: var(--warning-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']\\n\\t\\t[data-sonner-toast][data-type='warning']\\n\\t\\t[data-close-button]) {\\n\\t\\tbackground: var(--warning-bg);\\n\\t\\tborder-color: var(--warning-border);\\n\\t\\tcolor: var(--warning-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']) :global([data-sonner-toast][data-type='error']) {\\n\\t\\tbackground: var(--error-bg);\\n\\t\\tborder-color: var(--error-border);\\n\\t\\tcolor: var(--error-text);\\n\\t}\\n\\n\\t:global([data-rich-colors='true']\\n\\t\\t[data-sonner-toast][data-type='error']\\n\\t\\t[data-close-button]) {\\n\\t\\tbackground: var(--error-bg);\\n\\t\\tborder-color: var(--error-border);\\n\\t\\tcolor: var(--error-text);\\n\\t}\\n\\n\\t:global(.sonner-loading-wrapper) {\\n\\t\\t--size: 16px;\\n\\t\\theight: var(--size);\\n\\t\\twidth: var(--size);\\n\\t\\tposition: absolute;\\n\\t\\tinset: 0;\\n\\t\\tz-index: 10;\\n\\t}\\n\\n\\t:global(.sonner-loading-wrapper[data-visible='false']) {\\n\\t\\ttransform-origin: center;\\n\\t\\tanimation: sonner-fade-out 0.2s ease forwards;\\n\\t}\\n\\n\\t:global(.sonner-spinner) {\\n\\t\\tposition: relative;\\n\\t\\ttop: 50%;\\n\\t\\tleft: 50%;\\n\\t\\theight: var(--size);\\n\\t\\twidth: var(--size);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar) {\\n\\t\\tanimation: sonner-spin 1.2s linear infinite;\\n\\t\\tbackground: var(--gray11);\\n\\t\\tborder-radius: 6px;\\n\\t\\theight: 8%;\\n\\t\\tleft: -10%;\\n\\t\\tposition: absolute;\\n\\t\\ttop: -3.9%;\\n\\t\\twidth: 24%;\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(1)) {\\n\\t\\tanimation-delay: -1.2s;\\n\\t\\ttransform: rotate(0.0001deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(2)) {\\n\\t\\tanimation-delay: -1.1s;\\n\\t\\ttransform: rotate(30deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(3)) {\\n\\t\\tanimation-delay: -1s;\\n\\t\\ttransform: rotate(60deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(4)) {\\n\\t\\tanimation-delay: -0.9s;\\n\\t\\ttransform: rotate(90deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(5)) {\\n\\t\\tanimation-delay: -0.8s;\\n\\t\\ttransform: rotate(120deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(6)) {\\n\\t\\tanimation-delay: -0.7s;\\n\\t\\ttransform: rotate(150deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(7)) {\\n\\t\\tanimation-delay: -0.6s;\\n\\t\\ttransform: rotate(180deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(8)) {\\n\\t\\tanimation-delay: -0.5s;\\n\\t\\ttransform: rotate(210deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(9)) {\\n\\t\\tanimation-delay: -0.4s;\\n\\t\\ttransform: rotate(240deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(10)) {\\n\\t\\tanimation-delay: -0.3s;\\n\\t\\ttransform: rotate(270deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(11)) {\\n\\t\\tanimation-delay: -0.2s;\\n\\t\\ttransform: rotate(300deg) translate(146%);\\n\\t}\\n\\n\\t:global(.sonner-loading-bar:nth-child(12)) {\\n\\t\\tanimation-delay: -0.1s;\\n\\t\\ttransform: rotate(330deg) translate(146%);\\n\\t}\\n\\n\\t@keyframes -global-sonner-fade-in {\\n\\t\\t0% {\\n\\t\\t\\topacity: 0;\\n\\t\\t\\ttransform: scale(0.8);\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\ttransform: scale(1);\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes -global-sonner-fade-out {\\n\\t\\t0% {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\ttransform: scale(1);\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 0;\\n\\t\\t\\ttransform: scale(0.8);\\n\\t\\t}\\n\\t}\\n\\n\\t@keyframes -global-sonner-spin {\\n\\t\\t0% {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t\\t100% {\\n\\t\\t\\topacity: 0.15;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (prefers-reduced-motion) {\\n\\t\\t:global([data-sonner-toast]),\\n\\t\\t:global([data-sonner-toast]) > :global(*),\\n\\t\\t:global(.sonner-loading-bar) {\\n\\t\\t\\ttransition: none !important;\\n\\t\\t\\tanimation: none !important;\\n\\t\\t}\\n\\t}\\n\\n\\t:global(.sonner-loader) {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 50%;\\n\\t\\tleft: 50%;\\n\\t\\ttransform: translate(-50%, -50%);\\n\\t\\ttransform-origin: center;\\n\\t\\ttransition:\\n\\t\\t\\topacity 200ms,\\n\\t\\t\\ttransform 200ms;\\n\\t}\\n\\n\\t:global(.sonner-loader[data-visible='false']) {\\n\\t\\topacity: 0;\\n\\t\\ttransform: scale(0.8) translate(-50%, -50%);\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}`
};
const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = "32px";
const TOAST_WIDTH = 356;
const GAP = 14;
const DARK = "dark";
const LIGHT = "light";
function getInitialTheme(t) {
  if (t !== "system") {
    return t;
  }
  if (typeof window !== "undefined") {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return DARK;
    }
    return LIGHT;
  }
  return LIGHT;
}
function getDocumentDirection() {
  if (typeof window === "undefined")
    return "ltr";
  if (typeof document === "undefined")
    return "ltr";
  const dirAttribute = document.documentElement.getAttribute("dir");
  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction;
  }
  return dirAttribute;
}
const Toaster = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let possiblePositions;
  let hotkeyLabel;
  let $$restProps = compute_rest_props($$props, [
    "invert",
    "theme",
    "position",
    "hotkey",
    "richColors",
    "expand",
    "duration",
    "visibleToasts",
    "closeButton",
    "toastOptions",
    "offset",
    "dir"
  ]);
  let $toasts, $$unsubscribe_toasts;
  let $heights, $$unsubscribe_heights;
  let { invert = false } = $$props;
  let { theme = "light" } = $$props;
  let { position = "bottom-right" } = $$props;
  let { hotkey = ["altKey", "KeyT"] } = $$props;
  let { richColors = false } = $$props;
  let { expand = false } = $$props;
  let { duration = 4e3 } = $$props;
  let { visibleToasts = VISIBLE_TOASTS_AMOUNT } = $$props;
  let { closeButton = false } = $$props;
  let { toastOptions = {} } = $$props;
  let { offset = null } = $$props;
  let { dir = getDocumentDirection() } = $$props;
  const { toasts, heights, reset } = toastState;
  $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
  $$unsubscribe_heights = subscribe(heights, (value) => $heights = value);
  let expanded = false;
  let interacting = false;
  let actualTheme = getInitialTheme(theme);
  let listRef;
  onDestroy(() => {
  });
  if ($$props.invert === void 0 && $$bindings.invert && invert !== void 0)
    $$bindings.invert(invert);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  if ($$props.position === void 0 && $$bindings.position && position !== void 0)
    $$bindings.position(position);
  if ($$props.hotkey === void 0 && $$bindings.hotkey && hotkey !== void 0)
    $$bindings.hotkey(hotkey);
  if ($$props.richColors === void 0 && $$bindings.richColors && richColors !== void 0)
    $$bindings.richColors(richColors);
  if ($$props.expand === void 0 && $$bindings.expand && expand !== void 0)
    $$bindings.expand(expand);
  if ($$props.duration === void 0 && $$bindings.duration && duration !== void 0)
    $$bindings.duration(duration);
  if ($$props.visibleToasts === void 0 && $$bindings.visibleToasts && visibleToasts !== void 0)
    $$bindings.visibleToasts(visibleToasts);
  if ($$props.closeButton === void 0 && $$bindings.closeButton && closeButton !== void 0)
    $$bindings.closeButton(closeButton);
  if ($$props.toastOptions === void 0 && $$bindings.toastOptions && toastOptions !== void 0)
    $$bindings.toastOptions(toastOptions);
  if ($$props.offset === void 0 && $$bindings.offset && offset !== void 0)
    $$bindings.offset(offset);
  if ($$props.dir === void 0 && $$bindings.dir && dir !== void 0)
    $$bindings.dir(dir);
  $$result.css.add(css);
  possiblePositions = Array.from(new Set([
    position,
    ...$toasts.filter((toast) => toast.position).map((toast) => toast.position)
  ].filter(Boolean)));
  hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
  {
    if ($toasts.length <= 1) {
      expanded = false;
    }
  }
  {
    {
      const toastsToDismiss = $toasts.filter((toast) => toast.dismiss && !toast.delete);
      if (toastsToDismiss.length > 0) {
        const updatedToasts = $toasts.map((toast) => {
          const matchingToast = toastsToDismiss.find((dismissToast) => dismissToast.id === toast.id);
          if (matchingToast) {
            return { ...toast, delete: true };
          }
          return toast;
        });
        toasts.set(updatedToasts);
      }
    }
  }
  {
    {
      if (theme !== "system") {
        actualTheme = theme;
      }
      if (typeof window !== "undefined") {
        if (theme === "system") {
          if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            actualTheme = DARK;
          } else {
            actualTheme = LIGHT;
          }
        }
        const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        const changeHandler = ({ matches }) => {
          actualTheme = matches ? DARK : LIGHT;
        };
        if ("addEventListener" in mediaQueryList) {
          mediaQueryList.addEventListener("change", changeHandler);
        } else {
          mediaQueryList.addListener(changeHandler);
        }
      }
    }
  }
  $$unsubscribe_toasts();
  $$unsubscribe_heights();
  return `${$toasts.length > 0 ? `<section${add_attribute("aria-label", `Notifications ${hotkeyLabel}`, 0)}${add_attribute("tabindex", -1, 0)}>${each(possiblePositions, (position2, index) => {
    return `<ol${spread(
      [
        { tabindex: escape_attribute_value(-1) },
        {
          class: escape_attribute_value($$props.class)
        },
        { "data-sonner-toaster": true },
        {
          "data-theme": escape_attribute_value(actualTheme)
        },
        {
          "data-rich-colors": escape_attribute_value(richColors)
        },
        {
          dir: escape_attribute_value(dir === "auto" ? getDocumentDirection() : dir)
        },
        {
          "data-y-position": escape_attribute_value(position2.split("-")[0])
        },
        {
          "data-x-position": escape_attribute_value(position2.split("-")[1])
        },
        {
          style: escape_attribute_value($$props.style)
        },
        escape_object($$restProps)
      ],
      {
        styles: {
          "--front-toast-height": `${$heights[0]?.height}px`,
          "--offset": typeof offset === "number" ? `${offset}px` : offset || VIEWPORT_OFFSET,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${GAP}px`
        }
      }
    )}${add_attribute("this", listRef, 0)}>${each($toasts.filter((toast) => !toast.position && index === 0 || toast.position === position2), (toast, index2) => {
      return `${validate_component(Toast, "Toast").$$render(
        $$result,
        {
          index: index2,
          toast,
          invert,
          visibleToasts,
          closeButton,
          interacting,
          position: position2,
          expandByDefault: expand,
          expanded,
          actionButtonStyle: toastOptions?.actionButtonStyle || "",
          cancelButtonStyle: toastOptions?.cancelButtonStyle || "",
          class: toastOptions?.class || "",
          descriptionClass: toastOptions?.descriptionClass || "",
          classes: toastOptions.classes || {},
          duration: toastOptions?.duration ?? duration,
          unstyled: toastOptions.unstyled || false
        },
        {},
        {
          "info-icon": () => {
            return `${slots["info-icon"] ? slots["info-icon"]({ slot: "info-icon" }) : ` ${validate_component(Icon, "Icon").$$render($$result, { type: "info" }, {}, {})} `}`;
          },
          "warning-icon": () => {
            return `${slots["warning-icon"] ? slots["warning-icon"]({ slot: "warning-icon" }) : ` ${validate_component(Icon, "Icon").$$render($$result, { type: "warning" }, {}, {})} `}`;
          },
          "error-icon": () => {
            return `${slots["error-icon"] ? slots["error-icon"]({ slot: "error-icon" }) : ` ${validate_component(Icon, "Icon").$$render($$result, { type: "error" }, {}, {})} `}`;
          },
          "success-icon": () => {
            return `${slots["success-icon"] ? slots["success-icon"]({ slot: "success-icon" }) : ` ${validate_component(Icon, "Icon").$$render($$result, { type: "success" }, {}, {})} `}`;
          },
          "loading-icon": () => {
            return `${slots["loading-icon"] ? slots["loading-icon"]({ slot: "loading-icon" }) : ` ${validate_component(Loader, "Loader").$$render($$result, { visible: toast.type === "loading" }, {}, {})} `}`;
          }
        }
      )}`;
    })} </ol>`;
  })}</section>` : ``}`;
});
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<footer class="sticky top-0 bg-black p-4 font-bold text-white lg:px-12" data-svelte-h="svelte-13anfgr"><div class="container flex justify-between items-center flex-col gap-4 md:gap-0 md:flex-row"><div class="flex gap-4 flex-col md:flex-row items-center"><span>Plug into the bitcoin economy. Powered by Nostr.</span> <div class="flex gap-4"><a class="underline" href="/">About</a> <a class="underline" href="/">FAQ</a> <a class="underline" href="/">Contact</a></div></div> <div class="text-right flex justify-between items-center gap-6"><a class="border-2 border-white p-1 inline-flex justify-center items-center" href="https://snort.social/p/npub1market6g3zl4mxwx5ugw56hfg0f7dy7jnnw8t380788mvdyrnwuqgep7hd"><span class="i-game-icons-ostrich text-white w-6 h-6"></span></a> <a href="https://twitter.com/PlebeianMarket" class="border-2 border-white p-1 inline-flex justify-center items-center"><span class="i-ion-logo-x text-white w-6 h-6"></span></a> <a class="border-2 border-white p-1 inline-flex justify-center items-center" href="https://plebeianmarket.substack.com/"><span class="i-simple-icons-substack text-white w-6 h-6"></span></a> <a class="border-2 border-white p-1 inline-flex justify-center items-center" href="https://t.me/PlebeianMarket"><span class="i-mingcute-telegram-line text-white w-6 h-6"></span></a> <a class="border-2 border-white p-1 inline-flex justify-center items-center" href="https://github.com/PlebeianTech/plebeian-market"><span class="i-tdesign-logo-github text-white w-6 h-6"></span></a></div></div></footer>`;
});
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue("direction");
  return direction;
}
const { name: name$1 } = createElHelpers("dialog");
const defaults$1 = {
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  role: "dialog",
  defaultOpen: false,
  portal: void 0,
  forceVisible: false,
  openFocus: void 0,
  closeFocus: void 0,
  onOutsideClick: void 0
};
const dialogIdParts = ["content", "title", "description"];
function createDialog(props) {
  const withDefaults = { ...defaults$1, ...props };
  const options = toWritableStores(omit(withDefaults, "ids"));
  const { preventScroll, closeOnEscape, closeOnOutsideClick, role, portal, forceVisible, openFocus, closeFocus, onOutsideClick } = options;
  const activeTrigger = withGet.writable(null);
  const ids = toWritableStores({
    ...generateIds(dialogIdParts),
    ...withDefaults.ids
  });
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const isVisible = derived([open, forceVisible], ([$open, $forceVisible]) => {
    return $open || $forceVisible;
  });
  let unsubScroll = noop$1;
  function handleOpen(e) {
    const el = e.currentTarget;
    const triggerEl = e.currentTarget;
    if (!isHTMLElement(el) || !isHTMLElement(triggerEl))
      return;
    open.set(true);
    activeTrigger.set(triggerEl);
  }
  function handleClose() {
    open.set(false);
    handleFocus({
      prop: closeFocus.get(),
      defaultEl: activeTrigger.get()
    });
  }
  const trigger = makeElement(name$1("trigger"), {
    stores: [open],
    returned: ([$open]) => {
      return {
        "aria-haspopup": "dialog",
        "aria-expanded": $open,
        type: "button"
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", (e) => {
        handleOpen(e);
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.ENTER && e.key !== kbd.SPACE)
          return;
        e.preventDefault();
        handleOpen(e);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const overlay = makeElement(name$1("overlay"), {
    stores: [isVisible, open],
    returned: ([$isVisible, $open]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": true,
        "data-state": $open ? "open" : "closed"
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop$1;
      if (closeOnEscape.get()) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      return {
        destroy() {
          unsubEscapeKeydown();
        }
      };
    }
  });
  const content = makeElement(name$1("content"), {
    stores: [isVisible, ids.content, ids.description, ids.title, open],
    returned: ([$isVisible, $contentId, $descriptionId, $titleId, $open]) => {
      return {
        id: $contentId,
        role: role.get(),
        "aria-describedby": $descriptionId,
        "aria-labelledby": $titleId,
        "aria-modal": $isVisible ? "true" : void 0,
        "data-state": $open ? "open" : "closed",
        tabindex: -1,
        hidden: $isVisible ? void 0 : true,
        style: styleToString({
          display: $isVisible ? void 0 : "none"
        })
      };
    },
    action: (node) => {
      let activate = noop$1;
      let deactivate = noop$1;
      const destroy = executeCallbacks(effect([open, closeOnOutsideClick, closeOnEscape], ([$open, $closeOnOutsideClick, $closeOnEscape]) => {
        if (!$open)
          return;
        const focusTrap = createFocusTrap({
          immediate: false,
          escapeDeactivates: $closeOnEscape,
          clickOutsideDeactivates: $closeOnOutsideClick,
          allowOutsideClick: true,
          returnFocusOnDeactivate: false,
          fallbackFocus: node
        });
        activate = focusTrap.activate;
        deactivate = focusTrap.deactivate;
        const ac = focusTrap.useFocusTrap(node);
        if (ac && ac.destroy) {
          return ac.destroy;
        } else {
          return focusTrap.deactivate;
        }
      }), effect([closeOnOutsideClick, open], ([$closeOnOutsideClick, $open]) => {
        return useModal(node, {
          open: $open,
          closeOnInteractOutside: $closeOnOutsideClick,
          onClose() {
            handleClose();
          },
          shouldCloseOnInteractOutside(e) {
            onOutsideClick.get()?.(e);
            if (e.defaultPrevented)
              return false;
            return true;
          }
        }).destroy;
      }), effect([closeOnEscape], ([$closeOnEscape]) => {
        if (!$closeOnEscape)
          return noop$1;
        return useEscapeKeydown(node, { handler: handleClose }).destroy;
      }), effect([isVisible], ([$isVisible]) => {
        tick().then(() => {
          if (!$isVisible) {
            deactivate();
          } else {
            activate();
          }
        });
      }));
      return {
        destroy: () => {
          unsubScroll();
          destroy();
        }
      };
    }
  });
  const portalled = makeElement(name$1("portalled"), {
    stores: portal,
    returned: ($portal) => ({
      "data-portal": portalAttr($portal)
    }),
    action: (node) => {
      const unsubPortal = effect([portal], ([$portal]) => {
        if ($portal === null)
          return noop$1;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return noop$1;
        return usePortal(node, portalDestination).destroy;
      });
      return {
        destroy() {
          unsubPortal();
        }
      };
    }
  });
  const title = makeElement(name$1("title"), {
    stores: [ids.title],
    returned: ([$titleId]) => ({
      id: $titleId
    })
  });
  const description = makeElement(name$1("description"), {
    stores: [ids.description],
    returned: ([$descriptionId]) => ({
      id: $descriptionId
    })
  });
  const close = makeElement(name$1("close"), {
    returned: () => ({
      type: "button"
    }),
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", () => {
        handleClose();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.SPACE && e.key !== kbd.ENTER)
          return;
        e.preventDefault();
        handleClose();
      }));
      return {
        destroy: unsub
      };
    }
  });
  effect([open, preventScroll], ([$open, $preventScroll]) => {
    if (!isBrowser$1)
      return;
    if ($preventScroll && $open)
      unsubScroll = removeScroll();
    if ($open) {
      const contentEl = document.getElementById(ids.content.get());
      handleFocus({ prop: openFocus.get(), defaultEl: contentEl });
    }
    return () => {
      if (!forceVisible.get()) {
        unsubScroll();
      }
    };
  });
  return {
    ids,
    elements: {
      content,
      trigger,
      title,
      description,
      overlay,
      close,
      portalled
    },
    states: {
      open
    },
    options
  };
}
const defaults = {
  orientation: "horizontal",
  activateOnFocus: true,
  loop: true,
  autoSet: true
};
const { name, selector } = createElHelpers("tabs");
function createTabs(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(withDefaults, "defaultValue", "value", "onValueChange", "autoSet"));
  const { orientation, activateOnFocus, loop } = options;
  const valueWritable = withDefaults.value ?? writable(withDefaults.defaultValue);
  const value = overridable(valueWritable, withDefaults?.onValueChange);
  let ssrValue = withDefaults.defaultValue ?? value.get();
  const root = makeElement(name(), {
    stores: orientation,
    returned: ($orientation) => {
      return {
        "data-orientation": $orientation
      };
    }
  });
  const list = makeElement(name("list"), {
    stores: orientation,
    returned: ($orientation) => {
      return {
        role: "tablist",
        "aria-orientation": $orientation,
        "data-orientation": $orientation
      };
    }
  });
  const parseTriggerProps = (props2) => {
    if (typeof props2 === "string") {
      return { value: props2 };
    } else {
      return props2;
    }
  };
  const trigger = makeElement(name("trigger"), {
    stores: [value, orientation],
    returned: ([$value, $orientation]) => {
      return (props2) => {
        const { value: tabValue, disabled } = parseTriggerProps(props2);
        if (!$value && !ssrValue && withDefaults.autoSet) {
          ssrValue = tabValue;
          $value = tabValue;
          value.set(tabValue);
        }
        const sourceOfTruth = isBrowser$1 ? $value : ssrValue;
        const isActive = sourceOfTruth === tabValue;
        return {
          type: "button",
          role: "tab",
          "data-state": isActive ? "active" : "inactive",
          tabindex: isActive ? 0 : -1,
          "data-value": tabValue,
          "data-orientation": $orientation,
          "data-disabled": disabledAttr(disabled),
          disabled: disabledAttr(disabled)
        };
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "focus", () => {
        const disabled = node.dataset.disabled === "true";
        const tabValue = node.dataset.value;
        if (activateOnFocus.get() && !disabled && tabValue !== void 0) {
          value.set(tabValue);
        }
      }), addMeltEventListener(node, "click", (e) => {
        node.focus();
        e.preventDefault();
        const disabled = node.dataset.disabled === "true";
        if (disabled)
          return;
        const tabValue = node.dataset.value;
        node.focus();
        if (tabValue !== void 0) {
          value.set(tabValue);
        }
      }), addMeltEventListener(node, "keydown", (e) => {
        const tabValue = node.dataset.value;
        if (!tabValue)
          return;
        const el = e.currentTarget;
        if (!isHTMLElement(el))
          return;
        const rootEl = el.closest(selector());
        if (!isHTMLElement(rootEl))
          return;
        const $loop = loop.get();
        const triggers = Array.from(rootEl.querySelectorAll('[role="tab"]')).filter((trigger2) => isHTMLElement(trigger2));
        const enabledTriggers = triggers.filter((el2) => !el2.hasAttribute("data-disabled"));
        const triggerIdx = enabledTriggers.findIndex((el2) => el2 === e.target);
        const dir = getElemDirection(rootEl);
        const { nextKey, prevKey } = getDirectionalKeys(dir, orientation.get());
        if (e.key === nextKey) {
          e.preventDefault();
          const nextEl = next(enabledTriggers, triggerIdx, $loop);
          nextEl.focus();
        } else if (e.key === prevKey) {
          e.preventDefault();
          const prevEl = prev(enabledTriggers, triggerIdx, $loop);
          prevEl.focus();
        } else if (e.key === kbd.ENTER || e.key === kbd.SPACE) {
          e.preventDefault();
          value.set(tabValue);
        } else if (e.key === kbd.HOME) {
          e.preventDefault();
          const firstTrigger = enabledTriggers[0];
          firstTrigger.focus();
        } else if (e.key === kbd.END) {
          e.preventDefault();
          const lastTrigger = last(enabledTriggers);
          lastTrigger.focus();
        }
      }));
      return {
        destroy: unsub
      };
    }
  });
  const content = makeElement(name("content"), {
    stores: value,
    returned: ($value) => {
      return (tabValue) => {
        return {
          role: "tabpanel",
          // TODO: improve
          "aria-labelledby": tabValue,
          hidden: isBrowser$1 ? $value === tabValue ? void 0 : true : ssrValue === tabValue ? void 0 : true,
          tabindex: 0
        };
      };
    }
  });
  return {
    elements: {
      root,
      list,
      trigger,
      content
    },
    states: {
      value
    },
    options
  };
}
const Menu_label = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $groupLabel, $$unsubscribe_groupLabel;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { groupLabel, id, getAttrs } = getGroupLabel();
  $$unsubscribe_groupLabel = subscribe(groupLabel, (value) => $groupLabel = value);
  const attrs = getAttrs("label");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $groupLabel(id);
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_groupLabel();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Menu_separator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $separator, $$unsubscribe_separator;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { separator }, getAttrs } = getCtx$2();
  $$unsubscribe_separator = subscribe(separator, (value) => $separator = value);
  const attrs = getAttrs("separator");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $separator;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_separator();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object($separator), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>`}`;
});
function getDialogData() {
  const NAME = "dialog";
  const PARTS = [
    "close",
    "content",
    "description",
    "overlay",
    "portal",
    "title",
    "trigger"
  ];
  return {
    NAME,
    PARTS
  };
}
function setCtx$1(props) {
  const { NAME, PARTS } = getDialogData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const dialog = {
    ...createDialog({ ...removeUndefined(props), role: "dialog", forceVisible: true }),
    getAttrs
  };
  setContext(NAME, dialog);
  return {
    ...dialog,
    updateOption: getOptionUpdater(dialog.options)
  };
}
function getCtx$1() {
  const { NAME } = getDialogData();
  return getContext(NAME);
}
const Dialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { preventScroll = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { openFocus = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen }, updateOption, ids } = setCtx$1({
    closeOnEscape,
    preventScroll,
    closeOnOutsideClick,
    portal,
    forceVisible: true,
    defaultOpen: open,
    openFocus,
    closeFocus,
    onOutsideClick,
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    }
  });
  const idValues = derived([ids.content, ids.description, ids.title], ([$contentId, $descriptionId, $titleId]) => ({
    content: $contentId,
    description: $descriptionId,
    title: $titleId
  }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.openFocus === void 0 && $$bindings.openFocus && openFocus !== void 0)
    $$bindings.openFocus(openFocus);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0)
    $$bindings.closeFocus(closeFocus);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("openFocus", openFocus);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Dialog_title$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["level", "asChild", "id", "el"]);
  let $title, $$unsubscribe_title;
  let { level = "h2" } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { title }, ids, getAttrs } = getCtx$1();
  $$unsubscribe_title = subscribe(title, (value) => $title = value);
  const attrs = getAttrs("title");
  if ($$props.level === void 0 && $$bindings.level && level !== void 0)
    $$bindings.level(level);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.title.set(id);
    }
  }
  builder = $title;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_title();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `${((tag) => {
    return tag ? `<${level}${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({ builder }) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(level)}`}`;
});
const Dialog_close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $close, $$unsubscribe_close;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { close }, getAttrs } = getCtx$1();
  $$unsubscribe_close = subscribe(close, (value) => $close = value);
  createDispatcher();
  const attrs = getAttrs("close");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $close;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_close();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Dialog_portal$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $portalled, $$unsubscribe_portalled;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { portalled }, getAttrs } = getCtx$1();
  $$unsubscribe_portalled = subscribe(portalled, (value) => $portalled = value);
  const attrs = getAttrs("portal");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $portalled;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_portalled();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Dialog_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
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
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, states: { open }, ids, getAttrs } = getCtx$1();
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
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.content.set(id);
    }
  }
  builder = $content;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_content();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Dialog_overlay$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  let $overlay, $$unsubscribe_overlay;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { overlay }, states: { open }, getAttrs } = getCtx$1();
  $$unsubscribe_overlay = subscribe(overlay, (value) => $overlay = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs("overlay");
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
  builder = $overlay;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_overlay();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && outTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${outTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${$open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : ``}`}`}`}`}`}`;
});
const Dialog_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, getAttrs } = getCtx$1();
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
const Dialog_description$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $description, $$unsubscribe_description;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { description }, ids, getAttrs } = getCtx$1();
  $$unsubscribe_description = subscribe(description, (value) => $description = value);
  const attrs = getAttrs("description");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.description.set(id);
    }
  }
  builder = $description;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_description();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
function getTabsData() {
  const NAME = "tabs";
  const PARTS = ["root", "content", "list", "trigger"];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getTabsData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const tabs = { ...createTabs(removeUndefined(props)), getAttrs };
  setContext(NAME, tabs);
  return {
    ...tabs,
    updateOption: getOptionUpdater(tabs.options)
  };
}
function getCtx() {
  const { NAME } = getTabsData();
  return getContext(NAME);
}
const Tabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "orientation",
    "activateOnFocus",
    "loop",
    "autoSet",
    "value",
    "onValueChange",
    "asChild",
    "el"
  ]);
  let $root, $$unsubscribe_root;
  let $localValue, $$unsubscribe_localValue;
  let { orientation = void 0 } = $$props;
  let { activateOnFocus = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { autoSet = void 0 } = $$props;
  let { value = void 0 } = $$props;
  let { onValueChange = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root }, states: { value: localValue }, updateOption, getAttrs } = setCtx({
    orientation,
    activateOnFocus,
    loop,
    autoSet,
    defaultValue: value,
    onValueChange: ({ next: next2 }) => {
      if (value !== next2) {
        onValueChange?.(next2);
        value = next2;
      }
      return next2;
    }
  });
  $$unsubscribe_root = subscribe(root, (value2) => $root = value2);
  $$unsubscribe_localValue = subscribe(localValue, (value2) => $localValue = value2);
  const attrs = getAttrs("root");
  if ($$props.orientation === void 0 && $$bindings.orientation && orientation !== void 0)
    $$bindings.orientation(orientation);
  if ($$props.activateOnFocus === void 0 && $$bindings.activateOnFocus && activateOnFocus !== void 0)
    $$bindings.activateOnFocus(activateOnFocus);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.autoSet === void 0 && $$bindings.autoSet && autoSet !== void 0)
    $$bindings.autoSet(autoSet);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.onValueChange === void 0 && $$bindings.onValueChange && onValueChange !== void 0)
    $$bindings.onValueChange(onValueChange);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  value !== void 0 && localValue.set(value);
  {
    updateOption("orientation", orientation);
  }
  {
    updateOption("activateOnFocus", activateOnFocus);
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("autoSet", autoSet);
  }
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  $$unsubscribe_localValue();
  return `${asChild ? `${slots.default ? slots.default({ builder, value: $localValue }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder, value: $localValue }) : ``}</div>`}`;
});
const Tabs_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["value", "asChild", "el"]);
  let $content, $$unsubscribe_content;
  let { value } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, getAttrs } = getCtx();
  $$unsubscribe_content = subscribe(content, (value2) => $content = value2);
  const attrs = getAttrs("content");
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $content(value);
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_content();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Tabs_list$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $list, $$unsubscribe_list;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { list }, getAttrs } = getCtx();
  $$unsubscribe_list = subscribe(list, (value) => $list = value);
  const attrs = getAttrs("list");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $list;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_list();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Tabs_trigger$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["value", "disabled", "asChild", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { value } = $$props;
  let { disabled = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, getAttrs } = getCtx();
  $$unsubscribe_trigger = subscribe(trigger, (value2) => $trigger = value2);
  createDispatcher();
  const attrs = getAttrs("trigger");
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $trigger({ value, disabled });
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const X = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]];
  return `${validate_component(Icon$1, "Icon").$$render($$result, Object.assign({}, { name: "x" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dialog_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = { duration: 200 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_portal, "Dialog.Portal").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Dialog_overlay, "Dialog.Overlay").$$render($$result, {}, {}, {})} ${validate_component(Dialog_content$1, "DialogPrimitive.Content").$$render(
        $$result,
        Object.assign(
          {},
          { transition },
          { transitionConfig },
          {
            class: cn$1("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full", className)
          },
          $$restProps
        ),
        {},
        {
          default: () => {
            return `${slots.default ? slots.default({}) : ``} ${validate_component(Dialog_close, "DialogPrimitive.Close").$$render(
              $$result,
              {
                class: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              },
              {},
              {
                default: () => {
                  return `${validate_component(X, "X").$$render($$result, { class: "h-4 w-4" }, {}, {})} <span class="sr-only" data-svelte-h="svelte-1pewzs3">Close</span>`;
                }
              }
            )}`;
          }
        }
      )}`;
    }
  })}`;
});
const Dialog_description = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Dialog_description$1, "DialogPrimitive.Description").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("text-sm text-muted-foreground", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Dialog_header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn$1("flex flex-col space-y-1.5 text-center sm:text-left", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Dialog_overlay = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = fade } = $$props;
  let { transitionConfig = { duration: 150 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_overlay$1, "DialogPrimitive.Overlay").$$render(
    $$result,
    Object.assign(
      {},
      { transition },
      { transitionConfig },
      {
        class: cn$1("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Dialog_portal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `${validate_component(Dialog_portal$1, "DialogPrimitive.Portal").$$render($$result, Object.assign({}, $$restProps), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dialog_title = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Dialog_title$1, "DialogPrimitive.Title").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("text-lg font-semibold leading-none tracking-tight", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Root$1 = Dialog;
const Trigger = Dialog_trigger;
const Tabs_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value"]);
  let { class: className = void 0 } = $$props;
  let { value } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `${validate_component(Tabs_content$1, "TabsPrimitive.Content").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)
      },
      { value },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Tabs_list = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Tabs_list$1, "TabsPrimitive.List").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Tabs_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value"]);
  let { class: className = void 0 } = $$props;
  let { value } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  return `${validate_component(Tabs_trigger$1, "TabsPrimitive.Trigger").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)
      },
      { value },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Root = Tabs;
const QueryClientProvider = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { client = new QueryClient() } = $$props;
  setQueryClientContext(client);
  onDestroy(() => {
    client.unmount();
  });
  if ($$props.client === void 0 && $$bindings.client && client !== void 0)
    $$bindings.client(client);
  return `${slots.default ? slots.default({}) : ``}`;
});
const activeTab = "w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary";
const Auth = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $ndkStore, $$unsubscribe_ndkStore;
  $$unsubscribe_ndkStore = subscribe(ndkStore, (value) => $ndkStore = value);
  let checked = false;
  let authDialogOpen = false;
  let createDialogOpen = false;
  let nsec = null;
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${!$ndkStore.activeUser ? `${validate_component(Root$1, "Dialog.Root").$$render(
      $$result,
      { open: authDialogOpen },
      {
        open: ($$value) => {
          authDialogOpen = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Trigger, "Dialog.Trigger").$$render(
            $$result,
            {
              class: "flex items-center cursor-pointer gap-2 w-full"
            },
            {},
            {
              default: () => {
                return `<span class="i-tdesign-user-1"></span>Log in`;
              }
            }
          )} ${validate_component(Dialog_content, "Dialog.Content").$$render(
            $$result,
            {
              class: "max-w-[425px] gap-0 p-0 text-black"
            },
            {},
            {
              default: () => {
                return `${validate_component(Dialog_header, "Dialog.Header").$$render(
                  $$result,
                  {
                    class: "relative w-full bg-black text-center text-white py-8 flex items-center"
                  },
                  {},
                  {
                    default: () => {
                      return `${validate_component(Pattern_1, "Pattern").$$render($$result, {}, {}, {})} <div class="flex flex-row gap-2 items-center" data-svelte-h="svelte-fbogq3"><a href="/"><img src="/logo.svg" alt="logo" class="w-16"></a> <span class="relative z-10 text-left text-lg font-bold text-primary">plebeian<br>market</span></div>`;
                    }
                  }
                )} ${validate_component(Root, "Tabs.Root").$$render($$result, { value: "nip07", class: "p-4" }, {}, {
                  default: () => {
                    return `${validate_component(Tabs_list, "Tabs.List").$$render(
                      $$result,
                      {
                        class: "w-full justify-around bg-transparent"
                      },
                      {},
                      {
                        default: () => {
                          return `${validate_component(Tabs_trigger, "Tabs.Trigger").$$render($$result, { value: "nip07", class: activeTab }, {}, {
                            default: () => {
                              return `Extension`;
                            }
                          })} ${validate_component(Tabs_trigger, "Tabs.Trigger").$$render($$result, { value: "sk", class: activeTab }, {}, {
                            default: () => {
                              return `Private Key`;
                            }
                          })} ${validate_component(Tabs_trigger, "Tabs.Trigger").$$render(
                            $$result,
                            {
                              disabled: true,
                              value: "nip46",
                              class: activeTab
                            },
                            {},
                            {
                              default: () => {
                                return `Advanced`;
                              }
                            }
                          )} ${validate_component(Tabs_trigger, "Tabs.Trigger").$$render($$result, { value: "create", class: activeTab }, {}, {
                            default: () => {
                              return `Sign up`;
                            }
                          })}`;
                        }
                      }
                    )} ${validate_component(Tabs_content, "Tabs.Content").$$render(
                      $$result,
                      {
                        value: "nip07",
                        class: "flex flex-col gap-2"
                      },
                      {},
                      {
                        default: () => {
                          return `${validate_component(Button, "Button").$$render(
                            $$result,
                            {
                              variant: "outline",
                              class: "w-full border-black border-2 font-bold flex items-center gap-1"
                            },
                            {},
                            {
                              default: () => {
                                return `<span class="text-black text-md" data-svelte-h="svelte-iab4bw">Sign in with extension</span> <span class="i-mdi-puzzle-outline text-black w-6 h-6" data-svelte-h="svelte-gzwkmz"></span>`;
                              }
                            }
                          )} <span data-svelte-h="svelte-1wpw063">Recommended method. Use <a class="underline" href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp">nos2x</a>,
						<a class="underline" href="https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj">nostrconnect</a>,
						<a class="underline" href="https://getalby.com/">alby</a> or similar.</span>`;
                        }
                      }
                    )} ${validate_component(Tabs_content, "Tabs.Content").$$render(
                      $$result,
                      {
                        value: "sk",
                        class: "flex flex-col gap-2"
                      },
                      {},
                      {
                        default: () => {
                          return `<form class="flex flex-col gap-2">${validate_component(Input, "Input").$$render(
                            $$result,
                            {
                              required: true,
                              class: "border-black border-2",
                              name: "key",
                              placeholder: "Private key (nsec1...)",
                              id: "signInSk",
                              type: "password"
                            },
                            {},
                            {}
                          )} ${validate_component(Input, "Input").$$render(
                            $$result,
                            {
                              required: true,
                              class: "border-black border-2",
                              name: "password",
                              placeholder: "Password",
                              id: "signInPass",
                              type: "password"
                            },
                            {},
                            {}
                          )} ${validate_component(Button, "Button").$$render($$result, { id: "signInSubmit", type: "submit" }, {}, {
                            default: () => {
                              return `Sign in`;
                            }
                          })}</form>`;
                        }
                      }
                    )} ${validate_component(Tabs_content, "Tabs.Content").$$render(
                      $$result,
                      {
                        value: "nip46",
                        class: "flex flex-col gap-2"
                      },
                      {},
                      {
                        default: () => {
                          return `<form class="flex flex-col gap-2">${validate_component(Input, "Input").$$render(
                            $$result,
                            {
                              required: true,
                              class: "border-black border-2",
                              name: "key",
                              placeholder: "Private key (nsec1...)",
                              id: "remoteSignIn",
                              type: "password"
                            },
                            {},
                            {}
                          )} ${validate_component(Input, "Input").$$render(
                            $$result,
                            {
                              required: true,
                              class: "border-black border-2",
                              name: "password",
                              placeholder: "Password",
                              id: "remoteSignInPass",
                              type: "password"
                            },
                            {},
                            {}
                          )} ${validate_component(Button, "Button").$$render($$result, { id: "remoteSignInSubmit", type: "submit" }, {}, {
                            default: () => {
                              return `Sign in`;
                            }
                          })}</form>`;
                        }
                      }
                    )} ${validate_component(Tabs_content, "Tabs.Content").$$render(
                      $$result,
                      {
                        value: "create",
                        class: "flex flex-col gap-2"
                      },
                      {},
                      {
                        default: () => {
                          return `<span data-svelte-h="svelte-6sianl">We use nostr’s private/public key pair system to generate accounts (keys). They act as your username and password. <a href="/" class="underline">Learn more</a>.</span> <form class="flex flex-col gap-2">${validate_component(Input, "Input").$$render(
                            $$result,
                            {
                              id: "signUpPassword",
                              required: true,
                              class: "border-black border-2",
                              name: "password",
                              placeholder: "Password",
                              type: "password"
                            },
                            {},
                            {}
                          )} ${validate_component(Button, "Button").$$render(
                            $$result,
                            {
                              id: "signUpSubmit",
                              type: "submit",
                              class: "w-full"
                            },
                            {},
                            {
                              default: () => {
                                return `Generate an account`;
                              }
                            }
                          )}</form> <p class="w-full text-center">Already have an account?
						${validate_component(Tabs_trigger, "Tabs.Trigger").$$render(
                            $$result,
                            {
                              value: "join",
                              class: "underline cursor-pointer p-0"
                            },
                            {},
                            {
                              default: () => {
                                return `Sign in`;
                              }
                            }
                          )}</p>`;
                        }
                      }
                    )} <div class="flex flex-col gap-2 items-center">${validate_component(Separator, "Separator").$$render($$result, {}, {}, {})} <div class="flex items-center gap-2">${validate_component(Checkbox, "Checkbox").$$render(
                      $$result,
                      {
                        id: "terms",
                        "aria-labelledby": "terms-label",
                        checked
                      },
                      {
                        checked: ($$value) => {
                          checked = $$value;
                          $$settled = false;
                        }
                      },
                      {}
                    )} ${validate_component(Label, "Label").$$render(
                      $$result,
                      {
                        id: "terms-label",
                        for: "terms",
                        class: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      },
                      {},
                      {
                        default: () => {
                          return `Remember me`;
                        }
                      }
                    )}</div> <p class="text-center">Don’t have an account?
						${validate_component(Tabs_trigger, "Tabs.Trigger").$$render(
                      $$result,
                      {
                        value: "create",
                        class: "underline cursor-pointer p-0"
                      },
                      {},
                      {
                        default: () => {
                          return `Sign up`;
                        }
                      }
                    )}</p></div>`;
                  }
                })}`;
              }
            }
          )}`;
        }
      }
    )}` : ``} ${validate_component(Root$1, "Dialog.Root").$$render(
      $$result,
      { open: createDialogOpen },
      {
        open: ($$value) => {
          createDialogOpen = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Dialog_content, "Dialog.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Dialog_header, "Dialog.Header").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Dialog_title, "Dialog.Title").$$render($$result, {}, {}, {
                    default: () => {
                      return `Save your account key`;
                    }
                  })} ${validate_component(Dialog_description, "Dialog.Description").$$render($$result, { class: "text-black" }, {}, {
                    default: () => {
                      return `Here is your newly generated account key. It allows you to purchase anonymously, and is stored in your browser on this device only. <span class="font-bold" data-svelte-h="svelte-1n04rb5">Be sure to save it, or you’ll lose access to your account</span>`;
                    }
                  })}`;
                }
              })} ${validate_component(Button, "Button").$$render(
                $$result,
                {
                  variant: "secondary",
                  class: "relative overflow-auto flex flex-row gap-2 bg-transparent"
                },
                {},
                {
                  default: () => {
                    return `<code class="truncate w-3/4">${escape(nsec)}</code> <span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;"></span>`;
                  }
                }
              )} ${validate_component(Button, "Button").$$render($$result, { class: "w-full font-bold" }, {}, {
                default: () => {
                  return `I understand, and I saved my key`;
                }
              })}`;
            }
          })}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_ndkStore();
  return $$rendered;
});
const PassPromt = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let userQuery;
  let $userQuery, $$unsubscribe_userQuery = noop, $$subscribe_userQuery = () => ($$unsubscribe_userQuery(), $$unsubscribe_userQuery = subscribe(userQuery, ($$value) => $userQuery = $$value), userQuery);
  let { dialogOpen = false } = $$props;
  let { accointInfo } = $$props;
  let checked;
  if ($$props.dialogOpen === void 0 && $$bindings.dialogOpen && dialogOpen !== void 0)
    $$bindings.dialogOpen(dialogOpen);
  if ($$props.accointInfo === void 0 && $$bindings.accointInfo && accointInfo !== void 0)
    $$bindings.accointInfo(accointInfo);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$subscribe_userQuery(userQuery = createUserByIdQuery(accointInfo?.hexPubKey));
    $$rendered = `${validate_component(Root$1, "Dialog.Root").$$render(
      $$result,
      { open: dialogOpen },
      {
        open: ($$value) => {
          dialogOpen = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Dialog_content, "Dialog.Content").$$render(
            $$result,
            {
              class: "max-w-[425px] gap-0 p-0 text-black"
            },
            {},
            {
              default: () => {
                return `${validate_component(Dialog_header, "Dialog.Header").$$render(
                  $$result,
                  {
                    class: "relative w-full bg-black text-center text-white py-8 flex items-center"
                  },
                  {},
                  {
                    default: () => {
                      return `${validate_component(Pattern_1, "Pattern").$$render($$result, {}, {}, {})} <div class="flex flex-row gap-2 items-center" data-svelte-h="svelte-d0esz8"><a href="/"><img src="/logo.svg" alt="logo" class="w-16"></a> <span class="relative z-10 text-left text-lg font-bold text-primary">plebeian<br>market</span></div>`;
                    }
                  }
                )} <section class="p-4 flex flex-col gap-2"><span data-svelte-h="svelte-1kremgq">Log with your last account</span> <div class="inline-flex w-full items-center gap-2">${$userQuery.isLoading ? `<div class="flex items-center space-x-4">${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-12 w-12 rounded-full" }, {}, {})} <div class="space-y-2">${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-4 w-[250px]" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: "h-4 w-[200px]" }, {}, {})}</div></div>` : `${$userQuery?.data ? `${validate_component(Avatar, "Avatar").$$render($$result, {}, {}, {
                  default: () => {
                    return `${validate_component(Avatar_image, "AvatarImage").$$render($$result, { src: $userQuery.data?.image, alt: "pfp" }, {}, {})} ${validate_component(Avatar_fallback, "AvatarFallback").$$render($$result, {}, {}, {
                      default: () => {
                        return `${escape($userQuery.data?.name ?? $userQuery.data?.displayName ?? "")}`;
                      }
                    })}`;
                  }
                })} <section class="flex flex-col"><span class="font-bold">${escape($userQuery.data?.name ?? $userQuery.data?.displayName ?? "")}</span> <span>${escape(npubEncode(accointInfo.hexPubKey).substring(0, 16))}...</span></section>` : ``}`}</div> <small>Last logged: ${escape(format(accointInfo.lastLogged, standardDisplayDateFormat))}</small>  <form class="flex flex-col gap-2">${validate_component(Input, "Input").$$render(
                  $$result,
                  {
                    required: true,
                    class: "border-black border-2 hidden",
                    name: "key",
                    placeholder: "Private key (nsec1...)",
                    type: "password",
                    value: accointInfo.cSk
                  },
                  {},
                  {}
                )} ${validate_component(Input, "Input").$$render(
                  $$result,
                  {
                    required: true,
                    class: "border-black border-2",
                    name: "password",
                    placeholder: "Password",
                    type: "password"
                  },
                  {},
                  {}
                )} ${validate_component(Button, "Button").$$render($$result, { type: "submit" }, {}, {
                  default: () => {
                    return `Sign in`;
                  }
                })}</form> <div class="flex items-center space-x-2">${validate_component(Checkbox, "Checkbox").$$render(
                  $$result,
                  {
                    id: "terms",
                    "aria-labelledby": "terms-label",
                    checked
                  },
                  {
                    checked: ($$value) => {
                      checked = $$value;
                      $$settled = false;
                    }
                  },
                  {}
                )} ${validate_component(Label, "Label").$$render(
                  $$result,
                  {
                    id: "terms-label",
                    for: "terms",
                    class: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  },
                  {},
                  {
                    default: () => {
                      return `Remember me`;
                    }
                  }
                )}</div></section>`;
              }
            }
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_userQuery();
  return $$rendered;
});
const Dropdown_menu_label = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "inset"]);
  let { class: className = void 0 } = $$props;
  let { inset = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.inset === void 0 && $$bindings.inset && inset !== void 0)
    $$bindings.inset(inset);
  return `${validate_component(Menu_label, "DropdownMenuPrimitive.Label").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Dropdown_menu_separator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Menu_separator, "DropdownMenuPrimitive.Separator").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn$1("-mx-1 my-1 h-px bg-muted", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let appSettings;
  let $page, $$unsubscribe_page;
  let $ndkStore, $$unsubscribe_ndkStore;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_ndkStore = subscribe(ndkStore, (value) => $ndkStore = value);
  let showPassPromt = false;
  let nsecAccInfo;
  ({ appSettings } = $page.data);
  $$unsubscribe_page();
  $$unsubscribe_ndkStore();
  return `${validate_component(PassPromt, "PassPromt").$$render(
    $$result,
    {
      dialogOpen: showPassPromt,
      accointInfo: nsecAccInfo
    },
    {},
    {}
  )} <header class="sticky top-0 z-30 bg-black px-4 py-4 text-white lg:px-12"><div class="container flex h-full w-full items-center justify-between"><section class="inline-flex items-center"><a href="/"><div class="flex items-center"><img${add_attribute("src", appSettings.logoUrl, 0)} alt="logo" class="w-16 px-2"> <span class="font-semibold text-2xl">${escape(appSettings.instanceName)}</span></div></a> <div class="hidden lg:flex mx-8 gap-8" data-svelte-h="svelte-1vf3ihq"><a class="hover:underline font-semibold" href="/stalls/">Stall Browser</a>  <a class="hover:underline font-semibold" href="/">Market Square</a> <a class="hover:underline font-semibold" href="/">Plebeian Planet</a></div></section> <div class="flex items-center gap-4">${validate_component(Button, "Button").$$render(
    $$result,
    {
      class: "hidden sm:flex p-2 bg-[var(--neo-yellow)]",
      href: "/"
    },
    {},
    {
      default: () => {
        return `<span class="i-tdesign-mail text-black w-6 h-6"></span>`;
      }
    }
  )} ${validate_component(Button, "Button").$$render($$result, { class: "p-2 hidden sm:flex", href: "/" }, {}, {
    default: () => {
      return `<span class="i-tdesign-cart text-black w-6 h-6"></span>`;
    }
  })} ${validate_component(Root$2, "DropdownMenu.Root").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Trigger$1, "DropdownMenu.Trigger").$$render($$result, { id: "menuButton" }, {}, {
        default: () => {
          return `${validate_component(Button, "Button").$$render($$result, { class: "p-2 bg-white" }, {}, {
            default: () => {
              return `<span class="i-tdesign-view-list text-black w-6 h-6"></span>`;
            }
          })}`;
        }
      })} ${validate_component(Dropdown_menu_content, "DropdownMenu.Content").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(Group, "DropdownMenu.Group").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Dropdown_menu_label, "DropdownMenu.Label").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Auth, "Auth").$$render($$result, {}, {}, {})} ${$ndkStore.activeUser ? `My account` : ``}`;
                }
              })} ${$ndkStore.activeUser ? `${validate_component(Dropdown_menu_separator, "DropdownMenu.Separator").$$render($$result, {}, {}, {})} ${validate_component(Dropdown_menu_item, "DropdownMenu.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `<a${add_attribute(
                    "href",
                    `/p/${$ndkStore.activeUser.profile?.nip05 ? $ndkStore.activeUser.profile?.nip05 : $ndkStore.activeUser.pubkey}`,
                    0
                  )} class="inline-flex items-center gap-2 w-full"><span class="i-tdesign-user-1"></span>Profile</a>`;
                }
              })} ${validate_component(Dropdown_menu_item, "DropdownMenu.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `<a href="/settings" class="inline-flex items-center gap-2 w-full" data-svelte-h="svelte-11jwame"><span class="i-tdesign-user-setting"></span>Settings</a>`;
                }
              })} ${validate_component(Dropdown_menu_item, "DropdownMenu.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Button, "Button").$$render(
                    $$result,
                    {
                      variant: "destructive",
                      class: "inline-flex items-center gap-2"
                    },
                    {},
                    {
                      default: () => {
                        return `<span class="i-tdesign-user-arrow-right"></span>Log out`;
                      }
                    }
                  )}`;
                }
              })}` : ``}`;
            }
          })}`;
        }
      })}`;
    }
  })} ${$ndkStore.activeUser ? `${validate_component(Avatar, "Avatar").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Avatar_image, "AvatarImage").$$render(
        $$result,
        {
          src: $ndkStore.activeUser.profile?.image,
          alt: "pfp"
        },
        {},
        {}
      )} ${validate_component(Avatar_fallback, "AvatarFallback").$$render($$result, {}, {}, {
        default: () => {
          return `${escape($ndkStore.activeUser.profile?.name ?? $ndkStore.activeUser.profile?.displayName ?? "")}`;
        }
      })}`;
    }
  })}` : ``}</div></div></header>`;
});
let timeoutAction;
let timeoutEnable;
function withoutTransition(action) {
  if (typeof document === "undefined")
    return;
  clearTimeout(timeoutAction);
  clearTimeout(timeoutEnable);
  const style = document.createElement("style");
  const css2 = document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);
  style.appendChild(css2);
  const disable = () => document.head.appendChild(style);
  const enable = () => document.head.removeChild(style);
  if (typeof window.getComputedStyle !== "undefined") {
    disable();
    action();
    window.getComputedStyle(style).opacity;
    enable();
    return;
  }
  if (typeof window.requestAnimationFrame !== "undefined") {
    disable();
    action();
    window.requestAnimationFrame(enable);
    return;
  }
  disable();
  timeoutAction = window.setTimeout(() => {
    action();
    timeoutEnable = window.setTimeout(enable, 120);
  }, 120);
}
const noopStorage = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getItem: (_key) => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setItem: (_key, _value) => {
  }
};
const isBrowser = typeof document !== "undefined";
const modes = ["dark", "light", "system"];
const localStorageKey = "mode-watcher-mode";
const userPrefersMode = createUserPrefersMode();
const systemPrefersMode = createSystemMode();
const themeColors = writable(void 0);
const disableTransitions = writable(true);
const derivedMode = createDerivedMode();
function createUserPrefersMode() {
  const defaultValue = "system";
  const storage = isBrowser ? localStorage : noopStorage;
  const initialValue = storage.getItem(localStorageKey);
  let value = isValidMode(initialValue) ? initialValue : defaultValue;
  const { subscribe: subscribe2, set: _set } = writable(value, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (e.key !== localStorageKey)
        return;
      const newValue = e.newValue;
      if (isValidMode(newValue)) {
        _set(value = newValue);
      } else {
        _set(value = defaultValue);
      }
    };
    addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  });
  function set(v) {
    _set(value = v);
    storage.setItem(localStorageKey, value);
  }
  return {
    subscribe: subscribe2,
    set
  };
}
function createSystemMode() {
  const defaultValue = void 0;
  let track = true;
  const { subscribe: subscribe2, set } = writable(defaultValue, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (!track)
        return;
      set(e.matches ? "light" : "dark");
    };
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    mediaQueryState.addEventListener("change", handler);
    return () => mediaQueryState.removeEventListener("change", handler);
  });
  function query() {
    if (!isBrowser)
      return;
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    set(mediaQueryState.matches ? "light" : "dark");
  }
  function tracking(active) {
    track = active;
  }
  return {
    subscribe: subscribe2,
    query,
    tracking
  };
}
function createDerivedMode() {
  const { subscribe: subscribe2 } = derived([userPrefersMode, systemPrefersMode, themeColors, disableTransitions], ([$userPrefersMode, $systemPrefersMode, $themeColors, $disableTransitions]) => {
    if (!isBrowser)
      return void 0;
    const derivedMode2 = $userPrefersMode === "system" ? $systemPrefersMode : $userPrefersMode;
    function update() {
      const htmlEl = document.documentElement;
      const themeColorEl = document.querySelector('meta[name="theme-color"]');
      if (derivedMode2 === "light") {
        htmlEl.classList.remove("dark");
        htmlEl.style.colorScheme = "light";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.light);
        }
      } else {
        htmlEl.classList.add("dark");
        htmlEl.style.colorScheme = "dark";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.dark);
        }
      }
    }
    if ($disableTransitions) {
      withoutTransition(update);
    } else {
      update();
    }
    return derivedMode2;
  });
  return {
    subscribe: subscribe2
  };
}
function isValidMode(value) {
  if (typeof value !== "string")
    return false;
  return modes.includes(value);
}
const Sonner_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  let $mode, $$unsubscribe_mode;
  $$unsubscribe_mode = subscribe(derivedMode, (value) => $mode = value);
  $$unsubscribe_mode();
  return `${validate_component(Toaster, "Sonner").$$render(
    $$result,
    Object.assign(
      {},
      { theme: $mode },
      { class: "toaster group" },
      {
        toastOptions: {
          classes: {
            toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
          }
        }
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const pwaInfo = { "pwaInDevEnvironment": false, "webManifest": { "href": "/manifest.webmanifest", "useCredentials": false, "linkTag": '<link rel="manifest" href="/manifest.webmanifest">' } };
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let appSettings;
  let webManifestLink;
  let { data } = $$props;
  queryClient.setQueryDefaults(["categories"], {
    queryFn: async () => {
      const query = get_store_value(createCategoriesByFilterQuery({ pageSize: 30 }));
      const { data: categories } = await query.refetch();
      return categories ?? null;
    }
  });
  queryClient.prefetchQuery({ queryKey: ["categories"] });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ appSettings } = data);
  webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
  return `<link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""> <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet"> ${validate_component(Sonner_1, "Toaster").$$render($$result, { richColors: true }, {}, {})} ${$$result.head += `<!-- HEAD_svelte-blmxgf_START --><!-- HTML_TAG_START -->${webManifestLink}<!-- HTML_TAG_END --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png"><link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-splash-portrait-light-1536x2048.png"><link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-splash-landscape-light-2048x1536.png"><link rel="apple-touch-startup-image" media="screen and (prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/apple-splash-portrait-dark-1536x2048.png"><link rel="apple-touch-startup-image" media="screen and (prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/apple-splash-landscape-dark-2048x1536.png"><!-- HEAD_svelte-blmxgf_END -->`, ""} ${validate_component(QueryClientProvider, "QueryClientProvider").$$render($$result, { client: queryClient }, {}, {
    default: () => {
      return `${appSettings.isFirstTimeRunning ? `${slots.default ? slots.default({}) : ``}` : `<div class="min-h-screen flex flex-col">${validate_component(Header, "Header").$$render($$result, {}, {}, {})} <section class="flex-1">${slots.default ? slots.default({}) : ``}</section> ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</div>`}`;
    }
  })}`;
});
export {
  Layout as default
};
