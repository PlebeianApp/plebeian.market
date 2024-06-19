import * as server from '../entries/pages/stalls/_...stallId_/_page.server.ts.js';

export const index = 26;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/stalls/_...stallId_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/stalls/[...stallId]/+page.server.ts";
export const imports = ["_app/immutable/nodes/26.UuE7L8B_.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js","_app/immutable/chunks/each.DZlyhWDQ.js","_app/immutable/chunks/product-item.C_VacHIM.js","_app/immutable/chunks/utils.DzuHJZus.js","_app/immutable/chunks/index.CU_89pqE.js","_app/immutable/chunks/card.1OIS4fAx.js","_app/immutable/chunks/spinner.Bemd1ucX.js","_app/immutable/chunks/schema.DXwYpOb-.js","_app/immutable/chunks/client.Vo4oKtvm.js","_app/immutable/chunks/index.DXqQCM1T.js","_app/immutable/chunks/imgPlaceHolder.CMalkaTo.js","_app/immutable/chunks/index.BFoqt6p8.js","_app/immutable/chunks/create.BJa8HUjD.js","_app/immutable/chunks/index.C50TWVsQ.js","_app/immutable/chunks/events.nyrv0FNy.js","_app/immutable/chunks/chevron-down.D5twCweQ.js","_app/immutable/chunks/Icon.YNFDn_un.js","_app/immutable/chunks/overridable.BRTWenN_.js","_app/immutable/chunks/id.D6obubjl.js","_app/immutable/chunks/updater.BPyGjDFu.js","_app/immutable/chunks/attrs.B9zgB7jn.js","_app/immutable/chunks/avatar.B2CnpXUm.js","_app/immutable/chunks/badge.B88fmzu-.js","_app/immutable/chunks/index.Svc58BwB.js"];
export const stylesheets = ["_app/immutable/assets/utils.436keKGd.css","_app/immutable/assets/spinner.B3vBpHpZ.css"];
export const fonts = [];
