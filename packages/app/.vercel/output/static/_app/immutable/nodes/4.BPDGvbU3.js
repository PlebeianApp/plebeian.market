import{s as K,e as h,a as Q,c as v,b as x,l as O,g as q,f as _,m as w,i as D,h as k,k as R,p as P,o as T,n as U}from"../chunks/scheduler.D2KwwdHN.js";import{S as W,i as X,b as $,d as G,t as p,g as J,c as y,a as C,m as E,e as I}from"../chunks/index.yWj9ckWW.js";import{e as j}from"../chunks/each.DZlyhWDQ.js";import{C as Y}from"../chunks/cat-compact-item.I45StdTF.js";import{S as N}from"../chunks/skeleton.CJvu2C2g.js";import{c as Z}from"../chunks/category.queries.CYMrcBsD.js";function z(u,r,o){const l=u.slice();return l[1]=r[o],l}function ee(u){let r,o,l=j(u[0].data),e=[];for(let s=0;s<l.length;s+=1)e[s]=F(z(u,l,s));const c=s=>$(e[s],1,1,()=>{e[s]=null});return{c(){for(let s=0;s<e.length;s+=1)e[s].c();r=P()},l(s){for(let n=0;n<e.length;n+=1)e[n].l(s);r=P()},m(s,n){for(let a=0;a<e.length;a+=1)e[a]&&e[a].m(s,n);D(s,r,n),o=!0},p(s,n){if(n&1){l=j(s[0].data);let a;for(a=0;a<l.length;a+=1){const t=z(s,l,a);e[a]?(e[a].p(t,n),p(e[a],1)):(e[a]=F(t),e[a].c(),p(e[a],1),e[a].m(r.parentNode,r))}for(J(),a=l.length;a<e.length;a+=1)c(a);G()}},i(s){if(!o){for(let n=0;n<l.length;n+=1)p(e[n]);o=!0}},o(s){e=e.filter(Boolean);for(let n=0;n<e.length;n+=1)$(e[n]);o=!1},d(s){s&&_(r),T(e,s)}}}function te(u){let r,o,l,e,c,s,n,a;return r=new N({props:{class:" h-96 w-full"}}),l=new N({props:{class:" h-96 w-full"}}),c=new N({props:{class:" h-96 w-full"}}),n=new N({props:{class:" h-96 w-full"}}),{c(){y(r.$$.fragment),o=Q(),y(l.$$.fragment),e=Q(),y(c.$$.fragment),s=Q(),y(n.$$.fragment)},l(t){C(r.$$.fragment,t),o=q(t),C(l.$$.fragment,t),e=q(t),C(c.$$.fragment,t),s=q(t),C(n.$$.fragment,t)},m(t,i){E(r,t,i),D(t,o,i),E(l,t,i),D(t,e,i),E(c,t,i),D(t,s,i),E(n,t,i),a=!0},p:U,i(t){a||(p(r.$$.fragment,t),p(l.$$.fragment,t),p(c.$$.fragment,t),p(n.$$.fragment,t),a=!0)},o(t){$(r.$$.fragment,t),$(l.$$.fragment,t),$(c.$$.fragment,t),$(n.$$.fragment,t),a=!1},d(t){t&&(_(o),_(e),_(s)),I(r,t),I(l,t),I(c,t),I(n,t)}}}function F(u){let r,o;return r=new Y({props:{cat:u[1]}}),{c(){y(r.$$.fragment)},l(l){C(r.$$.fragment,l)},m(l,e){E(r,l,e),o=!0},p(l,e){const c={};e&1&&(c.cat=l[1]),r.$set(c)},i(l){o||(p(r.$$.fragment,l),o=!0)},o(l){$(r.$$.fragment,l),o=!1},d(l){I(r,l)}}}function le(u){let r,o,l,e,c,s,n="Categories",a,t,i,f,V;const A=[te,ee],d=[];function B(m,g){return m[0].isLoading?0:m[0].data?1:-1}return~(i=B(u))&&(f=d[i]=A[i](u)),{c(){r=h("div"),o=h("div"),l=h("main"),e=h("div"),c=h("div"),s=h("h2"),s.textContent=n,a=Q(),t=h("div"),f&&f.c(),this.h()},l(m){r=v(m,"DIV",{class:!0});var g=x(r);o=v(g,"DIV",{class:!0});var b=x(o);l=v(b,"MAIN",{class:!0});var H=x(l);e=v(H,"DIV",{class:!0});var L=x(e);c=v(L,"DIV",{class:!0});var S=x(c);s=v(S,"H2",{"data-svelte-h":!0}),O(s)!=="svelte-1v5ei8e"&&(s.textContent=n),a=q(S),t=v(S,"DIV",{class:!0});var M=x(t);f&&f.l(M),M.forEach(_),S.forEach(_),L.forEach(_),H.forEach(_),b.forEach(_),g.forEach(_),this.h()},h(){w(t,"class","grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"),w(c,"class","container"),w(e,"class","px-4 py-20 lg:px-12"),w(l,"class","text-black"),w(o,"class","flex flex-col"),w(r,"class","flex min-h-screen w-full flex-col bg-muted/40")},m(m,g){D(m,r,g),k(r,o),k(o,l),k(l,e),k(e,c),k(c,s),k(c,a),k(c,t),~i&&d[i].m(t,null),V=!0},p(m,[g]){let b=i;i=B(m),i===b?~i&&d[i].p(m,g):(f&&(J(),$(d[b],1,1,()=>{d[b]=null}),G()),~i?(f=d[i],f?f.p(m,g):(f=d[i]=A[i](m),f.c()),p(f,1),f.m(t,null)):f=null)},i(m){V||(p(f),V=!0)},o(m){$(f),V=!1},d(m){m&&_(r),~i&&d[i].d()}}}function re(u,r,o){let l;return R(u,Z,e=>o(0,l=e)),[l]}class fe extends W{constructor(r){super(),X(this,r,re,le,K,{})}}export{fe as component};
