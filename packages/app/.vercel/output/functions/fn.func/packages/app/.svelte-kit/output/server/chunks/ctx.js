import { g as get_store_value } from "./utils3.js";
import { t as tick } from "./scheduler.js";
import { o as onDestroy, g as getContext, s as setContext } from "./lifecycle.js";
import { w as writable, d as derived, r as readable } from "./index2.js";
import { n as nanoid } from "./index7.js";
const SCORE_CONTINUE_MATCH = 1, SCORE_SPACE_WORD_JUMP = 0.9, SCORE_NON_SPACE_WORD_JUMP = 0.8, SCORE_CHARACTER_JUMP = 0.17, SCORE_TRANSPOSITION = 0.1, PENALTY_SKIPPED = 0.999, PENALTY_CASE_MISMATCH = 0.9999, PENALTY_NOT_COMPLETE = 0.99;
const IS_GAP_REGEXP = /[\\/_+.#"@[({&]/, COUNT_GAPS_REGEXP = /[\\/_+.#"@[({&]/g, IS_SPACE_REGEXP = /[\s-]/, COUNT_SPACE_REGEXP = /[\s-]/g;
function commandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, stringIndex, abbreviationIndex, memoizedResults) {
  if (abbreviationIndex === abbreviation.length) {
    if (stringIndex === string.length) {
      return SCORE_CONTINUE_MATCH;
    }
    return PENALTY_NOT_COMPLETE;
  }
  const memoizeKey = `${stringIndex},${abbreviationIndex}`;
  if (memoizedResults[memoizeKey] !== void 0) {
    return memoizedResults[memoizeKey];
  }
  const abbreviationChar = lowerAbbreviation.charAt(abbreviationIndex);
  let index = lowerString.indexOf(abbreviationChar, stringIndex);
  let highScore = 0;
  let score, transposedScore, wordBreaks, spaceBreaks;
  while (index >= 0) {
    score = commandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, index + 1, abbreviationIndex + 1, memoizedResults);
    if (score > highScore) {
      if (index === stringIndex) {
        score *= SCORE_CONTINUE_MATCH;
      } else if (IS_GAP_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_NON_SPACE_WORD_JUMP;
        wordBreaks = string.slice(stringIndex, index - 1).match(COUNT_GAPS_REGEXP);
        if (wordBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, wordBreaks.length);
        }
      } else if (IS_SPACE_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_SPACE_WORD_JUMP;
        spaceBreaks = string.slice(stringIndex, index - 1).match(COUNT_SPACE_REGEXP);
        if (spaceBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, spaceBreaks.length);
        }
      } else {
        score *= SCORE_CHARACTER_JUMP;
        if (stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, index - stringIndex);
        }
      }
      if (string.charAt(index) !== abbreviation.charAt(abbreviationIndex)) {
        score *= PENALTY_CASE_MISMATCH;
      }
    }
    if (score < SCORE_TRANSPOSITION && lowerString.charAt(index - 1) === lowerAbbreviation.charAt(abbreviationIndex + 1) || lowerAbbreviation.charAt(abbreviationIndex + 1) === lowerAbbreviation.charAt(abbreviationIndex) && // allow duplicate letters. Ref #7428
    lowerString.charAt(index - 1) !== lowerAbbreviation.charAt(abbreviationIndex)) {
      transposedScore = commandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, index + 1, abbreviationIndex + 2, memoizedResults);
      if (transposedScore * SCORE_TRANSPOSITION > score) {
        score = transposedScore * SCORE_TRANSPOSITION;
      }
    }
    if (score > highScore) {
      highScore = score;
    }
    index = lowerString.indexOf(abbreviationChar, index + 1);
  }
  memoizedResults[memoizeKey] = highScore;
  return highScore;
}
function formatInput(string) {
  return string.toLowerCase().replace(COUNT_SPACE_REGEXP, " ");
}
function commandScore(string, abbreviation) {
  return commandScoreInner(string, abbreviation, formatInput(string), formatInput(abbreviation), 0, 0, {});
}
const isBrowser = typeof document !== "undefined";
function isUndefined(value) {
  return value === void 0;
}
function generateId() {
  return nanoid(10);
}
const kbd$1 = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*"
};
function omit(obj, ...keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
function removeUndefined(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function toWritableStores(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = writable(value);
  });
  return result;
}
function effect(stores, fn) {
  const unsub = derivedWithUnsubscribe(stores, (stores2, onUnsubscribe) => {
    return {
      stores: stores2,
      onUnsubscribe
    };
  }).subscribe(({ stores: stores2, onUnsubscribe }) => {
    const returned = fn(stores2);
    if (returned) {
      onUnsubscribe(returned);
    }
  });
  onDestroy(unsub);
  return unsub;
}
function derivedWithUnsubscribe(stores, fn) {
  let unsubscribers = [];
  const onUnsubscribe = (cb) => {
    unsubscribers.push(cb);
  };
  const unsubscribe = () => {
    unsubscribers.forEach((fn2) => fn2());
    unsubscribers = [];
  };
  const derivedStore = derived(stores, ($storeValues) => {
    unsubscribe();
    return fn($storeValues, onUnsubscribe);
  });
  onDestroy(unsubscribe);
  const subscribe = (...args) => {
    const unsub = derivedStore.subscribe(...args);
    return () => {
      unsub();
      unsubscribe();
    };
  };
  return {
    ...derivedStore,
    subscribe
  };
}
const NAME$m = "Command";
const STATE_NAME = "CommandState";
const GROUP_NAME = "CommandGroup";
const LIST_SELECTOR = `[data-cmdk-list-sizer]`;
const GROUP_SELECTOR = `[data-cmdk-group]`;
const GROUP_ITEMS_SELECTOR = `[data-cmdk-group-items]`;
const GROUP_HEADING_SELECTOR = `[data-cmdk-group-heading]`;
const ITEM_SELECTOR = `[data-cmdk-item]`;
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
const VALUE_ATTR = `data-value`;
const defaultFilter = (value, search) => commandScore(value, search);
function getCtx() {
  return getContext(NAME$m);
}
function getState() {
  return getContext(STATE_NAME);
}
function createGroup(alwaysRender) {
  const id = generateId();
  setContext(GROUP_NAME, {
    id,
    alwaysRender: isUndefined(alwaysRender) ? false : alwaysRender
  });
  return { id };
}
function getGroup() {
  const context = getContext(GROUP_NAME);
  if (!context)
    return void 0;
  return context;
}
function createState(initialValues) {
  const defaultState = {
    search: "",
    value: "",
    filtered: {
      count: 0,
      items: /* @__PURE__ */ new Map(),
      groups: /* @__PURE__ */ new Set()
    }
  };
  const state = writable(initialValues ? { ...defaultState, ...removeUndefined(initialValues) } : defaultState);
  return state;
}
const defaults = {
  label: "Command menu",
  shouldFilter: true,
  loop: false,
  onValueChange: void 0,
  value: void 0,
  filter: defaultFilter,
  ids: {
    root: generateId(),
    list: generateId(),
    label: generateId(),
    input: generateId()
  }
};
function createCommand(props) {
  const ids = {
    root: generateId(),
    list: generateId(),
    label: generateId(),
    input: generateId(),
    ...props.ids
  };
  const withDefaults = {
    ...defaults,
    ...removeUndefined(props)
  };
  const state = props.state ?? createState({
    value: withDefaults.value
  });
  const allItems = writable(/* @__PURE__ */ new Set());
  const allGroups = writable(/* @__PURE__ */ new Map());
  const allIds = writable(/* @__PURE__ */ new Map());
  const commandEl = writable(null);
  const options = toWritableStores(omit(withDefaults, "value", "ids"));
  let $allItems = get_store_value(allItems);
  let $allGroups = get_store_value(allGroups);
  let $allIds = get_store_value(allIds);
  let shouldFilter = get_store_value(options.shouldFilter);
  let loop = get_store_value(options.loop);
  let label = get_store_value(options.label);
  let filter = get_store_value(options.filter);
  effect(options.shouldFilter, ($shouldFilter) => {
    shouldFilter = $shouldFilter;
  });
  effect(options.loop, ($loop) => {
    loop = $loop;
  });
  effect(options.filter, ($filter) => {
    filter = $filter;
  });
  effect(options.label, ($label) => {
    label = $label;
  });
  effect(allItems, (v) => {
    $allItems = v;
  });
  effect(allGroups, (v) => {
    $allGroups = v;
  });
  effect(allIds, (v) => {
    $allIds = v;
  });
  const context = {
    value: (id, value) => {
      if (value !== $allIds.get(id)) {
        allIds.update(($allIds2) => {
          $allIds2.set(id, value);
          return $allIds2;
        });
        state.update(($state) => {
          $state.filtered.items.set(id, score(value, $state.search));
          return $state;
        });
      }
    },
    // Track item lifecycle (add/remove)
    item: (id, groupId) => {
      allItems.update(($allItems2) => $allItems2.add(id));
      if (groupId) {
        allGroups.update(($allGroups2) => {
          if (!$allGroups2.has(groupId)) {
            $allGroups2.set(groupId, /* @__PURE__ */ new Set([id]));
          } else {
            $allGroups2.get(groupId)?.add(id);
          }
          return $allGroups2;
        });
      }
      state.update(($state) => {
        const filteredState = filterItems($state, shouldFilter);
        if (!filteredState.value) {
          const value = selectFirstItem();
          filteredState.value = value ?? "";
        }
        return filteredState;
      });
      return () => {
        allIds.update(($allIds2) => {
          $allIds2.delete(id);
          return $allIds2;
        });
        allItems.update(($allItems2) => {
          $allItems2.delete(id);
          return $allItems2;
        });
        state.update(($state) => {
          $state.filtered.items.delete(id);
          const selectedItem = getSelectedItem();
          const filteredState = filterItems($state);
          if (selectedItem?.getAttribute("id") === id) {
            filteredState.value = selectFirstItem() ?? "";
          }
          return $state;
        });
      };
    },
    group: (id) => {
      allGroups.update(($allGroups2) => {
        if (!$allGroups2.has(id)) {
          $allGroups2.set(id, /* @__PURE__ */ new Set());
        }
        return $allGroups2;
      });
      return () => {
        allIds.update(($allIds2) => {
          $allIds2.delete(id);
          return $allIds2;
        });
        allGroups.update(($allGroups2) => {
          $allGroups2.delete(id);
          return $allGroups2;
        });
      };
    },
    filter: () => {
      return shouldFilter;
    },
    label: label || props["aria-label"] || "",
    commandEl,
    ids,
    updateState
  };
  function updateState(key, value, preventScroll) {
    state.update((curr) => {
      if (Object.is(curr[key], value))
        return curr;
      curr[key] = value;
      if (key === "search") {
        const filteredState = filterItems(curr, shouldFilter);
        curr = filteredState;
        const sortedState = sort(curr, shouldFilter);
        curr = sortedState;
        tick().then(() => state.update((curr2) => {
          curr2.value = selectFirstItem() ?? "";
          return curr2;
        }));
      } else if (key === "value") {
        props.onValueChange?.(curr.value);
        if (!preventScroll) {
          tick().then(() => scrollSelectedIntoView());
        }
      }
      return curr;
    });
  }
  function filterItems(state2, shouldFilterVal) {
    const $shouldFilter = shouldFilterVal ?? shouldFilter;
    if (!state2.search || !$shouldFilter) {
      state2.filtered.count = $allItems.size;
      return state2;
    }
    state2.filtered.groups = /* @__PURE__ */ new Set();
    let itemCount = 0;
    for (const id of $allItems) {
      const value = $allIds.get(id);
      const rank = score(value, state2.search);
      state2.filtered.items.set(id, rank);
      if (rank > 0) {
        itemCount++;
      }
    }
    for (const [groupId, group] of $allGroups) {
      for (const itemId of group) {
        const rank = state2.filtered.items.get(itemId);
        if (rank && rank > 0) {
          state2.filtered.groups.add(groupId);
        }
      }
    }
    state2.filtered.count = itemCount;
    return state2;
  }
  function sort(state2, shouldFilterVal) {
    const $shouldFilter = shouldFilterVal ?? shouldFilter;
    if (!state2.search || !$shouldFilter) {
      return state2;
    }
    const scores = state2.filtered.items;
    const groups = [];
    for (const value of state2.filtered.groups) {
      const items = $allGroups.get(value);
      if (!items)
        continue;
      let max = 0;
      for (const item of items) {
        const score2 = scores.get(item);
        if (isUndefined(score2))
          continue;
        max = Math.max(score2, max);
      }
      groups.push([value, max]);
    }
    const rootEl = document.getElementById(ids.root);
    if (!rootEl)
      return state2;
    const list = rootEl.querySelector(LIST_SELECTOR);
    const validItems = getValidItems(rootEl).sort((a, b) => {
      const valueA = a.getAttribute(VALUE_ATTR) ?? "";
      const valueB = b.getAttribute(VALUE_ATTR) ?? "";
      return (scores.get(valueA) ?? 0) - (scores.get(valueB) ?? 0);
    });
    for (const item of validItems) {
      const group = item.closest(GROUP_ITEMS_SELECTOR);
      const closest = item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
      if (group) {
        if (item.parentElement === group) {
          group.appendChild(item);
        } else {
          if (!closest)
            continue;
          group.appendChild(closest);
        }
      } else {
        if (item.parentElement === list) {
          list?.appendChild(item);
        } else {
          if (!closest)
            continue;
          list?.appendChild(closest);
        }
      }
    }
    groups.sort((a, b) => b[1] - a[1]);
    for (const group of groups) {
      const el = rootEl.querySelector(`${GROUP_SELECTOR}[${VALUE_ATTR}="${group[0]}"]`);
      el?.parentElement?.appendChild(el);
    }
    return state2;
  }
  function selectFirstItem() {
    const item = getValidItems().find((item2) => !item2.ariaDisabled);
    if (!item)
      return;
    const value = item.getAttribute(VALUE_ATTR);
    if (!value)
      return;
    return value;
  }
  function score(value, search) {
    const lowerCaseAndTrimmedValue = value?.toLowerCase().trim();
    const filterFn = filter;
    if (!filterFn) {
      return lowerCaseAndTrimmedValue ? defaultFilter(lowerCaseAndTrimmedValue, search) : 0;
    }
    return lowerCaseAndTrimmedValue ? filterFn(lowerCaseAndTrimmedValue, search) : 0;
  }
  function scrollSelectedIntoView() {
    const item = getSelectedItem();
    if (!item) {
      return;
    }
    if (item.parentElement?.firstChild === item) {
      tick().then(() => item.closest(GROUP_SELECTOR)?.querySelector(GROUP_HEADING_SELECTOR)?.scrollIntoView({
        block: "nearest"
      }));
    }
    tick().then(() => item.scrollIntoView({ block: "nearest" }));
  }
  function getValidItems(rootElement) {
    const rootEl = rootElement ?? document.getElementById(ids.root);
    if (!rootEl)
      return [];
    return Array.from(rootEl.querySelectorAll(VALID_ITEM_SELECTOR)).filter((el) => el ? true : false);
  }
  function getSelectedItem(rootElement) {
    const rootEl = document.getElementById(ids.root);
    if (!rootEl)
      return;
    const selectedEl = rootEl.querySelector(`${VALID_ITEM_SELECTOR}[aria-selected="true"]`);
    if (!selectedEl)
      return;
    return selectedEl;
  }
  function updateSelectedToIndex(index) {
    const rootEl = document.getElementById(ids.root);
    if (!rootEl)
      return;
    const items = getValidItems(rootEl);
    const item = items[index];
    if (!item)
      return;
  }
  function updateSelectedByChange(change) {
    const selected = getSelectedItem();
    const items = getValidItems();
    const index = items.findIndex((item) => item === selected);
    let newSelected = items[index + change];
    if (loop) {
      if (index + change < 0) {
        newSelected = items[items.length - 1];
      } else if (index + change === items.length) {
        newSelected = items[0];
      } else {
        newSelected = items[index + change];
      }
    }
    if (newSelected) {
      updateState("value", newSelected.getAttribute(VALUE_ATTR) ?? "");
    }
  }
  function updateSelectedToGroup(change) {
    const selected = getSelectedItem();
    let group = selected?.closest(GROUP_SELECTOR);
    let item = void 0;
    while (group && !item) {
      group = change > 0 ? findNextSibling(group, GROUP_SELECTOR) : findPreviousSibling(group, GROUP_SELECTOR);
      item = group?.querySelector(VALID_ITEM_SELECTOR);
    }
    if (item) {
      updateState("value", item.getAttribute(VALUE_ATTR) ?? "");
    } else {
      updateSelectedByChange(change);
    }
  }
  function last() {
    return updateSelectedToIndex(getValidItems().length - 1);
  }
  function next(e) {
    e.preventDefault();
    if (e.metaKey) {
      last();
    } else if (e.altKey) {
      updateSelectedToGroup(1);
    } else {
      updateSelectedByChange(1);
    }
  }
  function prev(e) {
    e.preventDefault();
    if (e.metaKey) {
      updateSelectedToIndex(0);
    } else if (e.altKey) {
      updateSelectedToGroup(-1);
    } else {
      updateSelectedByChange(-1);
    }
  }
  function handleRootKeydown(e) {
    switch (e.key) {
      case kbd$1.ARROW_DOWN:
        next(e);
        break;
      case kbd$1.ARROW_UP:
        prev(e);
        break;
      case kbd$1.HOME:
        e.preventDefault();
        updateSelectedToIndex(0);
        break;
      case kbd$1.END:
        e.preventDefault();
        last();
        break;
      case kbd$1.ENTER: {
        e.preventDefault();
        const item = getSelectedItem();
        if (item) {
          item?.click();
        }
      }
    }
  }
  setContext(NAME$m, context);
  const stateStore = {
    subscribe: state.subscribe,
    update: state.update,
    set: state.set,
    updateState
  };
  setContext(STATE_NAME, stateStore);
  return {
    state: stateStore,
    handleRootKeydown,
    commandEl,
    ids
  };
}
function findNextSibling(el, selector) {
  let sibling = el.nextElementSibling;
  while (sibling) {
    if (sibling.matches(selector))
      return sibling;
    sibling = sibling.nextElementSibling;
  }
}
function findPreviousSibling(el, selector) {
  let sibling = el.previousElementSibling;
  while (sibling) {
    if (sibling.matches(selector))
      return sibling;
    sibling = sibling.previousElementSibling;
  }
}
function styleToString$1(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
({
  type: "hidden",
  "aria-hidden": true,
  hidden: true,
  tabIndex: -1,
  style: styleToString$1({
    position: "absolute",
    opacity: 0,
    "pointer-events": "none",
    margin: 0,
    transform: "translateX(-100%)"
  })
});
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
const kbd = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*",
  A: "a",
  P: "p"
};
readable(void 0, (set) => {
  function clicked(event) {
    set(event);
    set(void 0);
  }
  const unsubscribe = addEventListener(document, "pointerup", clicked, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
readable(void 0, (set) => {
  function keydown(event) {
    if (event && event.key === kbd.ESCAPE) {
      set(event);
    }
    set(void 0);
  }
  const unsubscribe = addEventListener(document, "keydown", keydown, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
function createBitAttrs(bit, parts) {
  const attrs = {};
  parts.forEach((part) => {
    attrs[part] = {
      [`data-bits-${bit}-${part}`]: ""
    };
  });
  return (part) => attrs[part];
}
function styleToString(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
styleToString({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0"
});
styleToString({
  position: "absolute",
  width: "25px",
  height: "25px",
  opacity: "0",
  margin: "0px",
  pointerEvents: "none",
  transform: "translateX(-100%)"
});
const NAME$l = "accordion";
const PARTS$l = ["root", "content", "header", "item", "trigger"];
createBitAttrs(NAME$l, PARTS$l);
const NAME$k = "alert-dialog";
const PARTS$k = [
  "action",
  "cancel",
  "content",
  "description",
  "overlay",
  "portal",
  "title",
  "trigger"
];
createBitAttrs(NAME$k, PARTS$k);
const NAME$j = "avatar";
const PARTS$j = ["root", "image", "fallback"];
createBitAttrs(NAME$j, PARTS$j);
const NAME$i = "checkbox";
const PARTS$i = ["root", "input", "indicator"];
createBitAttrs(NAME$i, PARTS$i);
const NAME$h = "collapsible";
const PARTS$h = ["root", "content", "trigger"];
createBitAttrs(NAME$h, PARTS$h);
const NAME$g = "context-menu";
const PARTS$g = [
  "arrow",
  "checkbox-indicator",
  "checkbox-item",
  "content",
  "group",
  "item",
  "label",
  "radio-group",
  "radio-item",
  "separator",
  "sub-content",
  "sub-trigger",
  "trigger"
];
createBitAttrs(NAME$g, PARTS$g);
const NAME$f = "dialog";
const PARTS$f = ["close", "content", "description", "overlay", "portal", "title", "trigger"];
createBitAttrs(NAME$f, PARTS$f);
const NAME$e = "dropdown-menu";
const PARTS$e = [
  "arrow",
  "checkbox-indicator",
  "checkbox-item",
  "content",
  "group",
  "item",
  "label",
  "radio-group",
  "radio-item",
  "separator",
  "sub-content",
  "sub-trigger",
  "trigger"
];
createBitAttrs(NAME$e, PARTS$e);
const NAME$d = "link-preview";
const PARTS$d = ["arrow", "content", "trigger"];
createBitAttrs(NAME$d, PARTS$d);
const NAME$c = "label";
const PARTS$c = ["root"];
createBitAttrs(NAME$c, PARTS$c);
const NAME$b = "menubar";
const PARTS$b = [
  "root",
  "arrow",
  "checkbox-indicator",
  "checkbox-item",
  "content",
  "group",
  "item",
  "label",
  "radio-group",
  "radio-item",
  "separator",
  "sub-content",
  "sub-trigger",
  "trigger"
];
createBitAttrs(NAME$b, PARTS$b);
const NAME$a = "popover";
const PARTS$a = ["arrow", "close", "content", "trigger"];
createBitAttrs(NAME$a, PARTS$a);
const NAME$9 = "progress";
const PARTS$9 = ["root"];
createBitAttrs(NAME$9, PARTS$9);
const NAME$8 = "radio-group";
const PARTS$8 = ["root", "item", "input"];
createBitAttrs(NAME$8, PARTS$8);
const NAME$7 = "select";
const PARTS$7 = ["arrow", "content", "group", "item", "input", "label", "trigger", "value"];
createBitAttrs(NAME$7, PARTS$7);
const NAME$6 = "separator";
const PARTS$6 = ["root"];
createBitAttrs(NAME$6, PARTS$6);
const NAME$5 = "slider";
const PARTS$5 = ["root", "input", "range", "thumb", "tick"];
createBitAttrs(NAME$5, PARTS$5);
const NAME$4 = "switch";
const PARTS$4 = ["root", "input", "thumb"];
createBitAttrs(NAME$4, PARTS$4);
const NAME$3 = "tabs";
const PARTS$3 = ["root", "content", "list", "trigger"];
createBitAttrs(NAME$3, PARTS$3);
const NAME$2 = "toggle";
const PARTS$2 = ["root", "input"];
createBitAttrs(NAME$2, PARTS$2);
const NAME$1 = "toggle-group";
const PARTS$1 = ["root", "item"];
createBitAttrs(NAME$1, PARTS$1);
const NAME = "tooltip";
const PARTS = ["arrow", "content", "trigger"];
createBitAttrs(NAME, PARTS);
export {
  ITEM_SELECTOR as I,
  VALUE_ATTR as V,
  createGroup as a,
  getState as b,
  createCommand as c,
  generateId as d,
  getGroup as e,
  isUndefined as f,
  getCtx as g,
  isBrowser as i
};
