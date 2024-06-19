import { s as subscribe, n as noop } from "../../../../chunks/utils3.js";
import { c as create_ssr_component, e as each, a as add_attribute, v as validate_component, f as escape } from "../../../../chunks/ssr.js";
import { I as ImgPlaceHolder, S as Spinner } from "../../../../chunks/imgPlaceHolder.js";
import { P as Product_item } from "../../../../chunks/product-item.js";
import { B as Badge } from "../../../../chunks/badge.js";
import { B as Button } from "../../../../chunks/index3.js";
import { I as Input } from "../../../../chunks/input.js";
import { a as createProductPriceQuery } from "../../../../chunks/spinner.svelte_svelte_type_style_lang.js";
import { a as cn } from "../../../../chunks/utils2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let product;
  let seller;
  let products;
  let productCats;
  let priceQuery;
  let $priceQuery, $$unsubscribe_priceQuery = noop, $$subscribe_priceQuery = () => ($$unsubscribe_priceQuery(), $$unsubscribe_priceQuery = subscribe(priceQuery, ($$value) => $priceQuery = $$value), priceQuery);
  let { data } = $$props;
  let selectedImage = 0;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ product, seller, products, productCats } = data);
  $$subscribe_priceQuery(priceQuery = createProductPriceQuery(product));
  $$unsubscribe_priceQuery();
  return `<div class="container py-16"><div class="grid grid-cols-1 gap-6 md:grid-cols-2"><div class="grid grid-cols-3 gap-6"><ul class="grid gap-4 md:col-span-1">${product.galleryImages.length ? `${each(product.galleryImages, (item, i) => {
    return `<button${add_attribute("class", cn("cursor-pointer p-1", i === selectedImage ? "border border-primary" : null), 0)}><img${add_attribute("src", item, 0)} alt=""> </button>`;
  })}` : ``}</ul> ${product.galleryImages.length ? `<img class="col-span-2 border-2 border-black p-1"${add_attribute("src", product.galleryImages[selectedImage], 0)} alt="">` : `${validate_component(ImgPlaceHolder, "ImgPlaceHolder").$$render($$result, { imageType: "main" }, {}, {})}`}</div> <div class="flex flex-col"><h1>${escape(product.name)}</h1> <h2 class="inline-flex items-center">${$priceQuery.isLoading ? `${validate_component(Spinner, "Spinner").$$render($$result, {}, {}, {})}` : `${$priceQuery.data ? `${escape($priceQuery.data)}` : ``}`}
				sats</h2> <h3>$${escape(product.price)} ${escape(product.currency)}</h3> <h3 class="my-8 font-bold">Stock: ${escape(product.stockQty)}</h3> <div class="flex w-1/2 flex-row gap-4">${validate_component(Input, "Input").$$render(
    $$result,
    {
      class: "border-2 border-black",
      type: "number",
      value: "1",
      min: "1",
      max: "5"
    },
    {},
    {}
  )} ${validate_component(Button, "Button").$$render($$result, {}, {}, {
    default: () => {
      return `Add to cart`;
    }
  })}</div> <span class="my-8 font-bold">Sold by <a${add_attribute("href", `/p/${seller.nip05 ? seller.nip05 : seller.id}`, 0)}><span class="underline">${escape(seller.name)}<span></span></span></a></span> <article><h4 class="text-2xl font-bold" data-svelte-h="svelte-jgy59i">Details</h4> <p>${escape(product.description)}</p> ${each(productCats, (cat) => {
    return `<a${add_attribute("href", `/cat/${cat.id}`, 0)}>${validate_component(Badge, "Badge").$$render($$result, {}, {}, {
      default: () => {
        return `${escape(cat.name)}`;
      }
    })} </a>`;
  })}</article></div></div></div> <div class="container" data-svelte-h="svelte-1vordq6"><hr></div> <div class="container py-20"><h2>More from ${escape(seller.name)}</h2> <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">${each(products, (item) => {
    return `${validate_component(Product_item, "ProductItem").$$render($$result, { product: item }, {}, {})}`;
  })}</div></div> <div class="w-full bg-primary py-20 text-center text-white"><span class="mb-8 text-3xl text-black" data-svelte-h="svelte-hteim">Join in on the fun!</span> <h1 class="text-black" data-svelte-h="svelte-17ta9uu">Sell stuff for sats</h1> ${validate_component(Button, "Button").$$render($$result, { class: "p-6 text-xl font-bold" }, {}, {
    default: () => {
      return `List my stuff`;
    }
  })}</div>`;
});
export {
  Page as default
};
