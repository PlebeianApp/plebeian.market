import * as server from '../entries/pages/products/_...productId_/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_...productId_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/products/[...productId]/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.CzPPDZAs.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js","_app/immutable/chunks/each.DZlyhWDQ.js","_app/immutable/chunks/spinner.Bemd1ucX.js","_app/immutable/chunks/schema.DXwYpOb-.js","_app/immutable/chunks/client.Vo4oKtvm.js","_app/immutable/chunks/index.CU_89pqE.js","_app/immutable/chunks/utils.DzuHJZus.js","_app/immutable/chunks/index.DXqQCM1T.js","_app/immutable/chunks/imgPlaceHolder.CMalkaTo.js","_app/immutable/chunks/product-item.C_VacHIM.js","_app/immutable/chunks/card.1OIS4fAx.js","_app/immutable/chunks/badge.B88fmzu-.js","_app/immutable/chunks/index.Svc58BwB.js","_app/immutable/chunks/index.BtgPWUf5.js","_app/immutable/chunks/create.BJa8HUjD.js","_app/immutable/chunks/input.DkkLw6xD.js"];
export const stylesheets = ["_app/immutable/assets/spinner.B3vBpHpZ.css","_app/immutable/assets/utils.436keKGd.css"];
export const fonts = [];
