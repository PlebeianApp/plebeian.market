import * as server from '../entries/pages/stalls/_page.server.ts.js';

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/stalls/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/stalls/+page.server.ts";
export const imports = ["_app/immutable/nodes/25.DaF71xuf.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js","_app/immutable/chunks/each.DZlyhWDQ.js","_app/immutable/chunks/cat-menu.Y9x0JFsp.js","_app/immutable/chunks/category.queries.CYMrcBsD.js","_app/immutable/chunks/schema.DXwYpOb-.js","_app/immutable/chunks/client.Vo4oKtvm.js","_app/immutable/chunks/index.CU_89pqE.js","_app/immutable/chunks/utils.DzuHJZus.js","_app/immutable/chunks/index.DXqQCM1T.js","_app/immutable/chunks/index.BtgPWUf5.js","_app/immutable/chunks/create.BJa8HUjD.js","_app/immutable/chunks/index.Svc58BwB.js","_app/immutable/chunks/skeleton.CJvu2C2g.js","_app/immutable/chunks/cat-compact-item.I45StdTF.js","_app/immutable/chunks/entry.CSUZNGMN.js","_app/immutable/chunks/stall-item.Cegwcp0M.js","_app/immutable/chunks/card.1OIS4fAx.js"];
export const stylesheets = ["_app/immutable/assets/utils.436keKGd.css"];
export const fonts = [];
