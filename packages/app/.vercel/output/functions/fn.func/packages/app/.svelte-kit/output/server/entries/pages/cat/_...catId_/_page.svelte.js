import { s as subscribe, n as noop } from "../../../../chunks/utils3.js";
import { c as create_ssr_component, a as add_attribute, v as validate_component, f as escape, e as each } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
import { P as Pattern_1 } from "../../../../chunks/Pattern.js";
import { P as Product_item } from "../../../../chunks/product-item.js";
import { A as Avatar, a as Avatar_image, b as Avatar_fallback } from "../../../../chunks/avatar.js";
import { c as createCategoriesByFilterQuery } from "../../../../chunks/category.queries.js";
import { c as createProductsByFilterQuery } from "../../../../chunks/spinner.svelte_svelte_type_style_lang.js";
import { c as createUserByIdQuery } from "../../../../chunks/users.queries.js";
const User_card_compact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user } = $$props;
  const { image, name } = user;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<a${add_attribute("href", `/p/${user.id}`, 0)}><div class="py-1 flex flex-col items-center gap-2">${validate_component(Avatar, "Avatar").$$render($$result, { class: "w-12 h-auto" }, {}, {
    default: () => {
      return `${validate_component(Avatar_image, "AvatarImage").$$render($$result, { src: image, alt: "@shadcn" }, {}, {})} ${validate_component(Avatar_fallback, "AvatarFallback").$$render($$result, {}, {}, {
        default: () => {
          return `${escape(name)}`;
        }
      })}`;
    }
  })} <span class="font-bold">${escape(name)}</span></div></a>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let categoriesQuery;
  let categoryData;
  let productsQuery;
  let userQuery;
  let $page, $$unsubscribe_page;
  let $categoriesQuery, $$unsubscribe_categoriesQuery = noop, $$subscribe_categoriesQuery = () => ($$unsubscribe_categoriesQuery(), $$unsubscribe_categoriesQuery = subscribe(categoriesQuery, ($$value) => $categoriesQuery = $$value), categoriesQuery);
  let $userQuery, $$unsubscribe_userQuery = noop, $$subscribe_userQuery = () => ($$unsubscribe_userQuery(), $$unsubscribe_userQuery = subscribe(userQuery, ($$value) => $userQuery = $$value), userQuery);
  let $productsQuery, $$unsubscribe_productsQuery = noop, $$subscribe_productsQuery = () => ($$unsubscribe_productsQuery(), $$unsubscribe_productsQuery = subscribe(productsQuery, ($$value) => $productsQuery = $$value), productsQuery);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$subscribe_categoriesQuery(categoriesQuery = createCategoriesByFilterQuery({ catId: $page.params.catId }));
  categoryData = $categoriesQuery.data?.[0];
  $$subscribe_productsQuery(productsQuery = createProductsByFilterQuery({ catId: $page.params.catId, pageSize: 15 }));
  $$subscribe_userQuery(userQuery = categoryData?.userId ? createUserByIdQuery(categoryData.userId) : null);
  $$unsubscribe_page();
  $$unsubscribe_categoriesQuery();
  $$unsubscribe_userQuery();
  $$unsubscribe_productsQuery();
  return `<div class="flex min-h-screen w-full flex-col bg-muted/40"><div class="flex flex-col"><main class="text-black"><div class="relative w-full bg-black py-20 text-center text-white">${validate_component(Pattern_1, "Pattern").$$render($$result, {}, {}, {})} <h2 class="relative z-10 flex gap-2 items-center justify-center" data-svelte-h="svelte-c8882"><span class="i-mdi-category-outline w-6 h-6"></span>Category</h2> <h1 class="relative z-10">${escape(categoryData?.name)}</h1> ${$userQuery?.data ? `${validate_component(User_card_compact, "UserCardCompact").$$render($$result, { user: $userQuery.data }, {}, {})}` : ``} <p>${escape(categoryData?.description)}</p></div> ${$productsQuery.data ? `<div class="px-4 py-20 lg:px-12"><div class="container"><h2 class="relative z-10 flex gap-2 items-center justify-center" data-svelte-h="svelte-1mq8h5y"><span></span>Products</h2> <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each($productsQuery.data, (product) => {
    return `${validate_component(Product_item, "ProductItem").$$render($$result, { product }, {}, {})}`;
  })}</div></div></div>` : ``}</main></div></div>`;
});
export {
  Page as default
};
