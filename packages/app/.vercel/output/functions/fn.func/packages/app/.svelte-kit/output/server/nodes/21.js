import * as server from '../entries/pages/settings/app/misc/_page.server.ts.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/settings/app/misc/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/settings/app/misc/+page.server.ts";
export const imports = ["_app/immutable/nodes/21.7NcXAVJV.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js","_app/immutable/chunks/each.DZlyhWDQ.js","_app/immutable/chunks/entry.CSUZNGMN.js","_app/immutable/chunks/index.CU_89pqE.js","_app/immutable/chunks/stores.CZyAhLLN.js","_app/immutable/chunks/index.BtgPWUf5.js","_app/immutable/chunks/utils.DzuHJZus.js","_app/immutable/chunks/create.BJa8HUjD.js","_app/immutable/chunks/index.Svc58BwB.js","_app/immutable/chunks/checkbox.BFwQ0Z8o.js","_app/immutable/chunks/overridable.BRTWenN_.js","_app/immutable/chunks/updater.BPyGjDFu.js","_app/immutable/chunks/attrs.B9zgB7jn.js","_app/immutable/chunks/events.nyrv0FNy.js","_app/immutable/chunks/check.BhM648Ci.js","_app/immutable/chunks/Icon.YNFDn_un.js","_app/immutable/chunks/index.ByOxO62V.js","_app/immutable/chunks/id.D6obubjl.js","_app/immutable/chunks/focus.DgXY8wcd.js","_app/immutable/chunks/input.DkkLw6xD.js","_app/immutable/chunks/label.BOs7Apgt.js","_app/immutable/chunks/index.BWukIgvt.js","_app/immutable/chunks/index.C50TWVsQ.js","_app/immutable/chunks/chevron-down.D5twCweQ.js","_app/immutable/chunks/separator.CdjR4bq2.js","_app/immutable/chunks/create.Bfmad3kt.js","_app/immutable/chunks/nip19.DQtFYxnE.js"];
export const stylesheets = ["_app/immutable/assets/utils.436keKGd.css"];
export const fonts = [];
