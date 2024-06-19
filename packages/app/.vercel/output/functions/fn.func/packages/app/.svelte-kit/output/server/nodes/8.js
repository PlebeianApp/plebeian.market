

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/products/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.BAcJsV0S.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js"];
export const stylesheets = [];
export const fonts = [];
