import { s as subscribe, n as noop } from "./utils3.js";
import { c as create_ssr_component, a as add_attribute, v as validate_component, f as escape } from "./ssr.js";
import "./ndk.js";
import "clsx";
import "./utils2.js";
import "./constants2.js";
import { C as Card, a as Card_footer } from "./card.js";
import { a as createProductPriceQuery } from "./spinner.svelte_svelte_type_style_lang.js";
import { I as ImgPlaceHolder, S as Spinner } from "./imgPlaceHolder.js";
const Product_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let priceQuery;
  let $priceQuery, $$unsubscribe_priceQuery = noop, $$subscribe_priceQuery = () => ($$unsubscribe_priceQuery(), $$unsubscribe_priceQuery = subscribe(priceQuery, ($$value) => $priceQuery = $$value), priceQuery);
  let { product } = $$props;
  const { galleryImages, name, currency, price, userNip05, identifier, id } = product;
  if ($$props.product === void 0 && $$bindings.product && product !== void 0)
    $$bindings.product(product);
  $$subscribe_priceQuery(priceQuery = createProductPriceQuery(product));
  $$unsubscribe_priceQuery();
  return `<a${add_attribute(
    "href",
    userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${id}`,
    0
  )}>${validate_component(Card, "Card.Root").$$render(
    $$result,
    {
      class: "cursor-pointer border-4 border-black bg-transparent text-black"
    },
    {},
    {
      default: () => {
        return `${galleryImages ? `<img class="contain h-[329px] object-cover"${add_attribute("src", galleryImages[0], 0)} alt="">` : `${validate_component(ImgPlaceHolder, "ImgPlaceHolder").$$render($$result, { imageType: "thumbnail" }, {}, {})}`} ${validate_component(Card_footer, "Card.Footer").$$render(
          $$result,
          {
            class: "flex items-start justify-between p-4"
          },
          {},
          {
            default: () => {
              return `<span class="truncate font-bold">${escape(name)}</span> <div class="flex flex-col text-right"><span class="font-red font-bold">${$priceQuery.isLoading ? `${validate_component(Spinner, "Spinner").$$render($$result, {}, {}, {})}` : `${$priceQuery.data ? `${escape($priceQuery.data)}<small data-svelte-h="svelte-14gtdyv">sats</small>` : ``}`}</span> <span class="text-sm">${escape(price)} ${escape(currency)}</span></div>`;
            }
          }
        )}`;
      }
    }
  )}</a>`;
});
export {
  Product_item as P
};
