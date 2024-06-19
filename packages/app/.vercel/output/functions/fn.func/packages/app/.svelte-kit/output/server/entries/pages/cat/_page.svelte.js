import { s as subscribe } from "../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, e as each } from "../../../chunks/ssr.js";
import { C as Cat_compact_item } from "../../../chunks/cat-compact-item.js";
import { S as Skeleton } from "../../../chunks/skeleton.js";
import { a as categoriesQuery } from "../../../chunks/category.queries.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $categoriesQuery, $$unsubscribe_categoriesQuery;
  $$unsubscribe_categoriesQuery = subscribe(categoriesQuery, (value) => $categoriesQuery = value);
  $$unsubscribe_categoriesQuery();
  return `<div class="flex min-h-screen w-full flex-col bg-muted/40"><div class="flex flex-col"><main class="text-black"><div class="px-4 py-20 lg:px-12"><div class="container"><h2 data-svelte-h="svelte-1v5ei8e">Categories</h2> <div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${$categoriesQuery.isLoading ? `${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})} ${validate_component(Skeleton, "Skeleton").$$render($$result, { class: " h-96 w-full" }, {}, {})}` : `${$categoriesQuery.data ? `${each($categoriesQuery.data, (cat) => {
    return `${validate_component(Cat_compact_item, "CatCompactItem").$$render($$result, { cat }, {}, {})}`;
  })}` : ``}`}</div></div></div></main></div></div>`;
});
export {
  Page as default
};
