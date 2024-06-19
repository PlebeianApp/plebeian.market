import{s as R,I as u,t as E,J as c,b as _,d as C,f as m,m as e,i as S,h as d,j as z,n as A}from"./scheduler.D2KwwdHN.js";import{S as j,i as q}from"./index.yWj9ckWW.js";function H(a){let t,r,n,o,g,i,l,f,v,B,w,y;return{c(){t=u("svg"),r=u("defs"),n=u("style"),o=E(`#holder text {
				fill: #000000;
				font-family: sans-serif;
				font-size: 30px;
				font-weight: 100;
			}
		`),g=u("g"),i=u("rect"),l=u("g"),f=u("text"),v=E(a[0]),B=E(" x "),w=E(a[1]),this.h()},l(s){t=c(s,"svg",{width:!0,height:!0,xmlns:!0,viewBox:!0,preserveAspectRatio:!0});var h=_(t);r=c(h,"defs",{});var b=_(r);n=c(b,"style",{type:!0});var I=_(n);o=C(I,`#holder text {
				fill: #000000;
				font-family: sans-serif;
				font-size: 30px;
				font-weight: 100;
			}
		`),I.forEach(m),b.forEach(m),g=c(h,"g",{id:!0});var T=_(g);i=c(T,"rect",{width:!0,height:!0,fill:!0}),_(i).forEach(m),l=c(T,"g",{});var p=_(l);f=c(p,"text",{"text-anchor":!0,x:!0,y:!0,dy:!0});var x=_(f);v=C(x,a[0]),B=C(x," x "),w=C(x,a[1]),x.forEach(m),p.forEach(m),T.forEach(m),h.forEach(m),this.h()},h(){e(n,"type","text/css"),e(i,"width","100%"),e(i,"height","100%"),e(i,"fill",a[2]),e(f,"text-anchor","middle"),e(f,"x","50%"),e(f,"y","50%"),e(f,"dy",".3em"),e(g,"id","holder"),e(t,"width",a[0]),e(t,"height",a[1]),e(t,"xmlns","http://www.w3.org/2000/svg"),e(t,"viewBox",y=`0 0 ${a[0]} ${a[1]}`),e(t,"preserveAspectRatio","none")},m(s,h){S(s,t,h),d(t,r),d(r,n),d(n,o),d(t,g),d(g,i),d(g,l),d(l,f),d(f,v),d(f,B),d(f,w)},p(s,[h]){h&4&&e(i,"fill",s[2]),h&1&&z(v,s[0]),h&2&&z(w,s[1]),h&1&&e(t,"width",s[0]),h&2&&e(t,"height",s[1]),h&3&&y!==(y=`0 0 ${s[0]} ${s[1]}`)&&e(t,"viewBox",y)},i:A,o:A,d(s){s&&m(t)}}}function J(a,t,r){let{width:n=500}=t,{height:o=600}=t,{fillColor:g="#cccccc"}=t,{imageType:i="thumbnail"}=t;return i=="main"?(n=400,o=500):i=="gallery"?(n=200,o=150):i=="thumbnail"?(n=308,o=329):i=="mini"&&(n=60,o=60),a.$$set=l=>{"width"in l&&r(0,n=l.width),"height"in l&&r(1,o=l.height),"fillColor"in l&&r(2,g=l.fillColor),"imageType"in l&&r(3,i=l.imageType)},[n,o,g,i]}class D extends j{constructor(t){super(),q(this,t,J,H,R,{width:0,height:1,fillColor:2,imageType:3})}}export{D as I};
