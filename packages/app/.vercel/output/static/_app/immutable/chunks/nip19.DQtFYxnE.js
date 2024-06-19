import{j as g,k as h,l as s}from"./utils.DzuHJZus.js";var l=new TextDecoder("utf-8");new TextEncoder;var T=5e3;function m(t){var d,a,f,u,w,p,y,b;let{prefix:r,words:o}=h.decode(t,T),n=new Uint8Array(h.fromWords(o));switch(r){case"nprofile":{let e=c(n);if(!((d=e[0])!=null&&d[0]))throw new Error("missing TLV 0 for nprofile");if(e[0][0].length!==32)throw new Error("TLV 0 should be 32 bytes");return{type:"nprofile",data:{pubkey:s(e[0][0]),relays:e[1]?e[1].map(i=>l.decode(i)):[]}}}case"nevent":{let e=c(n);if(!((a=e[0])!=null&&a[0]))throw new Error("missing TLV 0 for nevent");if(e[0][0].length!==32)throw new Error("TLV 0 should be 32 bytes");if(e[2]&&e[2][0].length!==32)throw new Error("TLV 2 should be 32 bytes");if(e[3]&&e[3][0].length!==4)throw new Error("TLV 3 should be 4 bytes");return{type:"nevent",data:{id:s(e[0][0]),relays:e[1]?e[1].map(i=>l.decode(i)):[],author:(f=e[2])!=null&&f[0]?s(e[2][0]):void 0,kind:(u=e[3])!=null&&u[0]?parseInt(s(e[3][0]),16):void 0}}}case"naddr":{let e=c(n);if(!((w=e[0])!=null&&w[0]))throw new Error("missing TLV 0 for naddr");if(!((p=e[2])!=null&&p[0]))throw new Error("missing TLV 2 for naddr");if(e[2][0].length!==32)throw new Error("TLV 2 should be 32 bytes");if(!((y=e[3])!=null&&y[0]))throw new Error("missing TLV 3 for naddr");if(e[3][0].length!==4)throw new Error("TLV 3 should be 4 bytes");return{type:"naddr",data:{identifier:l.decode(e[0][0]),pubkey:s(e[2][0]),kind:parseInt(s(e[3][0]),16),relays:e[1]?e[1].map(i=>l.decode(i)):[]}}}case"nrelay":{let e=c(n);if(!((b=e[0])!=null&&b[0]))throw new Error("missing TLV 0 for nrelay");return{type:"nrelay",data:l.decode(e[0][0])}}case"nsec":return{type:r,data:n};case"npub":case"note":return{type:r,data:s(n)};default:throw new Error(`unknown prefix ${r}`)}}function c(t){let r={},o=t;for(;o.length>0;){let n=o[0],d=o[1],a=o.slice(2,2+d);if(o=o.slice(2+d),a.length<d)throw new Error(`not enough data to read on TLV ${n}`);r[n]=r[n]||[],r[n].push(a)}return r}function v(t){return E("nsec",t)}function x(t){return E("npub",g(t))}function L(t,r){let o=h.toWords(r);return h.encode(t,o,T)}function E(t,r){return L(t,r)}export{v as a,m as d,x as n};
