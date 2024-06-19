import { s as subscribe } from "./utils3.js";
import { c as create_ssr_component, v as validate_component, e as each } from "./ssr.js";
import { a as categoriesQuery } from "./category.queries.js";
import { B as Button } from "./index3.js";
import { S as Skeleton } from "./skeleton.js";
import { C as Cat_compact_item } from "./cat-compact-item.js";
let pageSize = 4;
const Cat_menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $categoriesQuery, $$unsubscribe_categoriesQuery;
  $$unsubscribe_categoriesQuery = subscribe(categoriesQuery, (value) => $categoriesQuery = value);
  let { isExpanded = false } = $$props;
  let showMore = isExpanded;
  let filteredCategories = [];
  if ($$props.isExpanded === void 0 && $$bindings.isExpanded && isExpanded !== void 0)
    $$bindings.isExpanded(isExpanded);
  {
    if ($categoriesQuery.data)
      filteredCategories = $categoriesQuery.data?.filter((cat) => (cat.productCount ?? 0) > 0) || [];
  }
  $$unsubscribe_categoriesQuery();
  return `<div class="flex flex-col"><div class="flex flex-col"><main class="text-black"><div class="lg:px-12"><div class="container"><div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${$categoriesQuery.isLoading ? `${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})}` : `${$categoriesQuery.data ? `${each(filteredCategories.slice(0, showMore ? filteredCategories.length : pageSize), (cat) => {
    return `${validate_component(Cat_compact_item, "CatCompactItem").$$render($$result, { cat }, {}, {})}`;
  })}` : ``}`}</div> ${filteredCategories.length > pageSize ? `<div class="text-center py-1">${validate_component(Button, "Button").$$render(
    $$result,
    {
      size: "icon",
      class: "cursor-pointer border-0",
      variant: "ghost"
    },
    {},
    {
      default: () => {
        return `${showMore ? `<span class="i-tdesign-minus"></span>` : `<span class="i-tdesign-plus"></span>`}`;
      }
    }
  )}</div>` : ``}</div></div></main></div></div>`;
});
export {
  Cat_menu as C
};
