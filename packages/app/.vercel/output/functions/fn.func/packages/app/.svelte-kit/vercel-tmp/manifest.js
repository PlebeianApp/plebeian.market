export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["apple-splash-landscape-dark-2048x1536.png","apple-splash-landscape-light-2048x1536.png","apple-splash-portrait-dark-1536x2048.png","apple-splash-portrait-light-1536x2048.png","apple-touch-icon-180x180.png","bitcoin.svg","favicon.ico","favicon.png","logo.svg","maskable-icon-512x512.png","nostrich.svg","pwa-192x192.png","pwa-512x512.png","pwa-64x64.png","shaka.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.BnZ4LCh4.js","app":"_app/immutable/entry/app.BJRUN8ie.js","imports":["_app/immutable/entry/start.BnZ4LCh4.js","_app/immutable/chunks/entry.CSUZNGMN.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.CU_89pqE.js","_app/immutable/entry/app.BJRUN8ie.js","_app/immutable/chunks/preload-helper.BqjOJQfC.js","_app/immutable/chunks/scheduler.D2KwwdHN.js","_app/immutable/chunks/index.yWj9ckWW.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js')),
			__memo(() => import('../output/server/nodes/12.js')),
			__memo(() => import('../output/server/nodes/13.js')),
			__memo(() => import('../output/server/nodes/14.js')),
			__memo(() => import('../output/server/nodes/16.js')),
			__memo(() => import('../output/server/nodes/18.js')),
			__memo(() => import('../output/server/nodes/19.js')),
			__memo(() => import('../output/server/nodes/20.js')),
			__memo(() => import('../output/server/nodes/21.js')),
			__memo(() => import('../output/server/nodes/22.js')),
			__memo(() => import('../output/server/nodes/23.js')),
			__memo(() => import('../output/server/nodes/24.js')),
			__memo(() => import('../output/server/nodes/25.js')),
			__memo(() => import('../output/server/nodes/26.js'))
		],
		routes: [
			{
				id: "/api/v1/category",
				pattern: /^\/api\/v1\/category\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/category/_server.ts.js'))
			},
			{
				id: "/api/v1/category/[catId]",
				pattern: /^\/api\/v1\/category\/([^/]+?)\/?$/,
				params: [{"name":"catId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/category/_catId_/_server.ts.js'))
			},
			{
				id: "/api/v1/payments",
				pattern: /^\/api\/v1\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/payments/_server.ts.js'))
			},
			{
				id: "/api/v1/payments/[stallId]",
				pattern: /^\/api\/v1\/payments\/([^/]+?)\/?$/,
				params: [{"name":"stallId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/payments/_stallId_/_server.ts.js'))
			},
			{
				id: "/api/v1/products",
				pattern: /^\/api\/v1\/products\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/products/_server.ts.js'))
			},
			{
				id: "/api/v1/products/[productId]",
				pattern: /^\/api\/v1\/products\/([^/]+?)\/?$/,
				params: [{"name":"productId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/products/_productId_/_server.ts.js'))
			},
			{
				id: "/api/v1/shipping/[stallId]",
				pattern: /^\/api\/v1\/shipping\/([^/]+?)\/?$/,
				params: [{"name":"stallId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/shipping/_stallId_/_server.ts.js'))
			},
			{
				id: "/api/v1/stalls",
				pattern: /^\/api\/v1\/stalls\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/stalls/_server.ts.js'))
			},
			{
				id: "/api/v1/stalls/[stallId]",
				pattern: /^\/api\/v1\/stalls\/([^/]+?)\/?$/,
				params: [{"name":"stallId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/stalls/_stallId_/_server.ts.js'))
			},
			{
				id: "/api/v1/users",
				pattern: /^\/api\/v1\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/users/_server.ts.js'))
			},
			{
				id: "/api/v1/users/[userId]",
				pattern: /^\/api\/v1\/users\/([^/]+?)\/?$/,
				params: [{"name":"userId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/v1/users/_userId_/_server.ts.js'))
			},
			{
				id: "/cat",
				pattern: /^\/cat\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/cat/n/[...catName]",
				pattern: /^\/cat\/n(?:\/(.*))?\/?$/,
				params: [{"name":"catName","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/cat/[...catId]",
				pattern: /^\/cat(?:\/(.*))?\/?$/,
				params: [{"name":"catId","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/products",
				pattern: /^\/products\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/products/[...productId]",
				pattern: /^\/products(?:\/(.*))?\/?$/,
				params: [{"name":"productId","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/p/[id]",
				pattern: /^\/p\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/settings/account",
				pattern: /^\/settings\/account\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/settings/account/delete",
				pattern: /^\/settings\/account\/delete\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/settings/account/network",
				pattern: /^\/settings\/account\/network\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/settings/account/notifications",
				pattern: /^\/settings\/account\/notifications\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/settings/account/products",
				pattern: /^\/settings\/account\/products\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/settings/account/stalls",
				pattern: /^\/settings\/account\/stalls\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/settings/app",
				pattern: /^\/settings\/app\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/settings/app/media",
				pattern: /^\/settings\/app\/media\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/settings/app/misc",
				pattern: /^\/settings\/app\/misc\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 18 },
				endpoint: __memo(() => import('../output/server/entries/endpoints/settings/app/misc/_server.ts.js'))
			},
			{
				id: "/settings/app/relay",
				pattern: /^\/settings\/app\/relay\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/settings/v4v",
				pattern: /^\/settings\/v4v\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/setup",
				pattern: /^\/setup\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: __memo(() => import('../output/server/entries/endpoints/setup/_server.ts.js'))
			},
			{
				id: "/stalls",
				pattern: /^\/stalls\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/stalls/[...stallId]",
				pattern: /^\/stalls(?:\/(.*))?\/?$/,
				params: [{"name":"stallId","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
