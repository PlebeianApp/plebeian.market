import * as server from '../entries/pages/cat/_...catId_/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/cat/_...catId_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/cat/[...catId]/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.Bon1zb9T.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js","_app/immutable/chunks/each.DZlyhWDQ.js","_app/immutable/chunks/stores.CZyAhLLN.js","_app/immutable/chunks/entry.CSUZNGMN.js","_app/immutable/chunks/index.CU_89pqE.js","_app/immutable/chunks/Pattern.eGu_xQ90.js","_app/immutable/chunks/product-item.C_VacHIM.js","_app/immutable/chunks/utils.DzuHJZus.js","_app/immutable/chunks/card.1OIS4fAx.js","_app/immutable/chunks/spinner.Bemd1ucX.js","_app/immutable/chunks/schema.DXwYpOb-.js","_app/immutable/chunks/client.Vo4oKtvm.js","_app/immutable/chunks/index.DXqQCM1T.js","_app/immutable/chunks/imgPlaceHolder.CMalkaTo.js","_app/immutable/chunks/avatar.B2CnpXUm.js","_app/immutable/chunks/create.BJa8HUjD.js","_app/immutable/chunks/overridable.BRTWenN_.js","_app/immutable/chunks/updater.BPyGjDFu.js","_app/immutable/chunks/attrs.B9zgB7jn.js","_app/immutable/chunks/category.queries.CYMrcBsD.js","_app/immutable/chunks/users.queries.DJ8R6p7J.js"];
export const stylesheets = ["_app/immutable/assets/utils.436keKGd.css","_app/immutable/assets/spinner.B3vBpHpZ.css"];
export const fonts = [];
