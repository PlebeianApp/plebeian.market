import { c as create_ssr_component, a as add_attribute, f as escape } from "./ssr.js";
import "./spinner.svelte_svelte_type_style_lang.js";
const css = {
  code: ".spinner.svelte-1pwfsa1{width:25px;height:25px;position:relative;padding:2px}.double-bounce1.svelte-1pwfsa1,.double-bounce2.svelte-1pwfsa1{width:100%;height:100%;border-radius:50%;background-color:#333;opacity:0.6;position:absolute;top:0;left:0;animation:svelte-1pwfsa1-sk-bounce 2s infinite ease-in-out}.double-bounce2.svelte-1pwfsa1{animation-delay:-1s}@keyframes svelte-1pwfsa1-sk-bounce{0%,100%{transform:scale(0);-webkit-transform:scale(0)}50%{transform:scale(1);-webkit-transform:scale(1)}}",
  map: '{"version":3,"file":"spinner.svelte","sources":["spinner.svelte"],"sourcesContent":["<div class=\\"spinner\\">\\n\\t<div class=\\"double-bounce1\\"></div>\\n\\t<div class=\\"double-bounce2\\"></div>\\n</div>\\n\\n<style>\\n\\t.spinner {\\n\\t\\twidth: 25px;\\n\\t\\theight: 25px;\\n\\n\\t\\tposition: relative;\\n\\t\\tpadding: 2px;\\n\\t}\\n\\n\\t.double-bounce1,\\n\\t.double-bounce2 {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tborder-radius: 50%;\\n\\t\\tbackground-color: #333;\\n\\t\\topacity: 0.6;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\tanimation: sk-bounce 2s infinite ease-in-out;\\n\\t}\\n\\n\\t.double-bounce2 {\\n\\t\\tanimation-delay: -1s;\\n\\t}\\n\\n\\t@keyframes sk-bounce {\\n\\t\\t0%,\\n\\t\\t100% {\\n\\t\\t\\ttransform: scale(0);\\n\\t\\t\\t-webkit-transform: scale(0);\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\ttransform: scale(1);\\n\\t\\t\\t-webkit-transform: scale(1);\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAMC,uBAAS,CACR,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CAEZ,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,GACV,CAEA,8BAAe,CACf,8BAAgB,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,IAAI,CACtB,OAAO,CAAE,GAAG,CACZ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,SAAS,CAAE,wBAAS,CAAC,EAAE,CAAC,QAAQ,CAAC,WAClC,CAEA,8BAAgB,CACf,eAAe,CAAE,GAClB,CAEA,WAAW,wBAAU,CACpB,EAAE,CACF,IAAK,CACJ,SAAS,CAAE,MAAM,CAAC,CAAC,CACnB,iBAAiB,CAAE,MAAM,CAAC,CAC3B,CACA,GAAI,CACH,SAAS,CAAE,MAAM,CAAC,CAAC,CACnB,iBAAiB,CAAE,MAAM,CAAC,CAC3B,CACD"}'
};
const Spinner = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div class="spinner svelte-1pwfsa1" data-svelte-h="svelte-12vqbr1"><div class="double-bounce1 svelte-1pwfsa1"></div> <div class="double-bounce2 svelte-1pwfsa1"></div> </div>`;
});
const ImgPlaceHolder = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { width = 500 } = $$props;
  let { height = 600 } = $$props;
  let { fillColor = "#cccccc" } = $$props;
  let { imageType = "thumbnail" } = $$props;
  if (imageType == "main") {
    width = 400;
    height = 500;
  } else if (imageType == "gallery") {
    width = 200;
    height = 150;
  } else if (imageType == "thumbnail") {
    width = 308;
    height = 329;
  } else if (imageType == "mini") {
    width = 60;
    height = 60;
  }
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.fillColor === void 0 && $$bindings.fillColor && fillColor !== void 0)
    $$bindings.fillColor(fillColor);
  if ($$props.imageType === void 0 && $$bindings.imageType && imageType !== void 0)
    $$bindings.imageType(imageType);
  return `<svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)} xmlns="http://www.w3.org/2000/svg"${add_attribute("viewBox", `0 0 ${width} ${height}`, 0)} preserveAspectRatio="none"><defs><style type="text/css">#holder text {
				fill: #000000;
				font-family: sans-serif;
				font-size: 30px;
				font-weight: 100;
			}</style></defs><g id="holder"><rect width="100%" height="100%"${add_attribute("fill", fillColor, 0)}></rect><g><text text-anchor="middle" x="50%" y="50%" dy=".3em">${escape(width)} x ${escape(height)}</text></g></g></svg>`;
});
export {
  ImgPlaceHolder as I,
  Spinner as S
};
