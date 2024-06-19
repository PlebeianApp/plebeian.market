import { s as subscribe, n as noop } from "../../../../../chunks/utils3.js";
import { c as create_ssr_component, v as validate_component, f as escape, e as each } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { P as Pattern_1 } from "../../../../../chunks/Pattern.js";
import { P as Product_item } from "../../../../../chunks/product-item.js";
import { S as Stall_item } from "../../../../../chunks/stall-item.js";
import { c as createCategoriesByFilterQuery } from "../../../../../chunks/category.queries.js";
import { c as createProductsByFilterQuery } from "../../../../../chunks/spinner.svelte_svelte_type_style_lang.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let stalls;
  let categoriesQuery;
  let categoryData;
  let productsQuery;
  let $page, $$unsubscribe_page;
  let $categoriesQuery, $$unsubscribe_categoriesQuery = noop, $$subscribe_categoriesQuery = () => ($$unsubscribe_categoriesQuery(), $$unsubscribe_categoriesQuery = subscribe(categoriesQuery, ($$value) => $categoriesQuery = $$value), categoriesQuery);
  let $productsQuery, $$unsubscribe_productsQuery = noop, $$subscribe_productsQuery = () => ($$unsubscribe_productsQuery(), $$unsubscribe_productsQuery = subscribe(productsQuery, ($$value) => $productsQuery = $$value), productsQuery);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ stalls } = data);
  $$subscribe_categoriesQuery(categoriesQuery = createCategoriesByFilterQuery({ catName: $page.params.catName }));
  categoryData = $categoriesQuery.data?.[0];
  $$subscribe_productsQuery(productsQuery = createProductsByFilterQuery({
    catName: $page.params.catName,
    pageSize: 15
  }));
  $$unsubscribe_page();
  $$unsubscribe_categoriesQuery();
  $$unsubscribe_productsQuery();
  return `<div class="flex min-h-screen w-full flex-col bg-muted/40"><div class="flex flex-col"><main class="text-black"><div class="relative w-full bg-black py-20 text-center text-white">${validate_component(Pattern_1, "Pattern").$$render($$result, {}, {}, {})} <h2 class="relative z-10 flex gap-2 items-center justify-center" data-svelte-h="svelte-c8882"><span class="i-mdi-category-outline w-6 h-6"></span>Category</h2> <h1 class="relative z-10">${escape(categoryData?.name)}</h1> <p>${escape(categoryData?.description)}</p></div> ${stalls.length ? `<div class="px-4 py-20 lg:px-12"><div class="container"><h2 class="relative z-10 flex gap-2 items-center justify-center" data-svelte-h="svelte-1j571l4">Stalls</h2> <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each(stalls, (stall) => {
    return `${validate_component(Stall_item, "StallItem").$$render($$result, { stall }, {}, {})}`;
  })}</div></div></div>` : ``} ${$productsQuery.data ? `<div class="px-4 py-20 lg:px-12"><div class="container"><h2 class="relative z-10 flex gap-2 items-center justify-center" data-svelte-h="svelte-1xv7u75">Products</h2> <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each($productsQuery.data, (product) => {
    return `${validate_component(Product_item, "ProductItem").$$render($$result, { product }, {}, {})}`;
  })}</div></div></div>` : ``}</main></div></div>`;
});
export {
  Page as default
};
