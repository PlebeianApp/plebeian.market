import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import NDK, { NDKKind, NDKRepost, NDKEvent } from "@nostr-dev-kit/ndk";
import { w as writable } from "./index2.js";
var NDKSvelte = class extends NDK {
  constructor(opts) {
    super(opts);
  }
  createEventStore(filters) {
    const store = writable([]);
    return {
      refCount: 0,
      filters,
      subscription: void 0,
      set: store.set,
      update: store.update,
      subscribe: store.subscribe,
      unsubscribe: () => {
      },
      onEose: (cb) => {
      },
      startSubscription: () => {
        throw new Error("not implemented");
      },
      ref: () => {
        throw new Error("not implemented");
      },
      unref: () => {
        throw new Error("not implemented");
      },
      empty: () => {
        throw new Error("not implemented");
      },
      changeFilters: (filters2) => {
        throw new Error("not implemented");
      }
    };
  }
  eventIsRepost(event) {
    return [NDKKind.Repost, NDKKind.GenericRepost].includes(event.kind);
  }
  eventIsLabel(event) {
    return [NDKKind.Label].includes(event.kind);
  }
  storeSubscribe(filters, opts, klass) {
    let eventIds = /* @__PURE__ */ new Set();
    let events = [];
    const store = this.createEventStore(
      Array.isArray(filters) ? filters : [filters]
    );
    const autoStart = opts?.autoStart ?? true;
    const relaySet = opts?.relaySet;
    const handleEventLabel = (event) => {
      handleEventReposts(event);
    };
    const handleEventReposts = (event) => {
      const _repostEvent = NDKRepost.from(event);
      _repostEvent.ndk = this;
      const addRepostToExistingEvent = (repostedEvent) => {
        if (repostedEvent.repostedByEvents) {
          repostedEvent.repostedByEvents.push(event);
        } else {
          repostedEvent.repostedByEvents = [event];
        }
        store.set(events);
      };
      for (const repostedEventId of _repostEvent.repostedEventIds()) {
        const repostedEvent = events.find((e) => e.id === repostedEventId);
        if (repostedEvent) {
          addRepostToExistingEvent(repostedEvent);
        } else {
          _repostEvent.repostedEvents(klass).then((fetchedEvents) => {
            for (const e of fetchedEvents) {
              if (e instanceof NDKEvent) {
                handleEvent(e);
              }
            }
          });
        }
      }
    };
    const handleEvent = (event) => {
      if (store.filters && this.eventIsRepost(event)) {
        handleEventReposts(event);
        return;
      }
      if (this.eventIsLabel(event)) {
        handleEventLabel(event);
        return;
      }
      let e = event;
      if (klass) {
        e = klass.from(event);
        e.relay = event.relay;
      }
      e.ndk = this;
      const dedupKey = event.deduplicationKey();
      if (eventIds.has(dedupKey)) {
        const prevEvent = events.find((e2) => e2.deduplicationKey() === dedupKey);
        if (prevEvent && prevEvent.created_at < event.created_at) {
          const index2 = events.findIndex((e2) => e2.deduplicationKey() === dedupKey);
          events.splice(index2, 1);
        } else {
          return;
        }
      }
      eventIds.add(dedupKey);
      const index = events.findIndex((e2) => e2.created_at < event.created_at);
      if (index === -1) {
        events.push(e);
      } else {
        events.splice(index === -1 ? events.length : index, 0, e);
      }
      store.set(events);
    };
    store.ref = () => {
      store.refCount++;
      if (store.refCount === 1) {
        store.startSubscription();
      }
      return store.refCount;
    };
    store.unref = () => {
      if (--store.refCount > 0)
        return store.refCount;
      if (opts?.unrefUnsubscribeTimeout) {
        setTimeout(() => {
          if (store.refCount === 0) {
            store.unsubscribe();
          }
        }, opts.unrefUnsubscribeTimeout);
      } else {
        store.unsubscribe();
      }
      return store.refCount;
    };
    store.empty = () => {
      store.set([]);
      events = [];
      eventIds = /* @__PURE__ */ new Set();
      store.unsubscribe();
    };
    store.changeFilters = (filters2) => {
      store.filters = filters2;
      store.empty();
      if (store.refCount > 0)
        store.startSubscription();
    };
    store.startSubscription = () => {
      if (!store.filters) {
        throw new Error("no filters");
      }
      const filters2 = store.filters;
      if (opts?.repostsFilters) {
        filters2.push(...opts.repostsFilters);
      }
      store.subscription = this.subscribe(filters2, opts, relaySet, false);
      store.subscription.on("event", (event, relay) => {
        handleEvent(event);
      });
      store.subscription.start();
      store.unsubscribe = () => {
        store.subscription?.stop();
        store.subscription = void 0;
      };
      store.onEose = (cb) => {
        store.subscription?.on("eose", cb);
      };
    };
    if (autoStart) {
      store.startSubscription();
    }
    return store;
  }
};
var src_default = NDKSvelte;
let cacheAdapter = void 0;
if (typeof window !== "undefined") {
  cacheAdapter = new NDKCacheAdapterDexie({
    dbName: "plebeian.ndk.v0"
  });
}
const defaulRelaysUrls = [
  // 'wss://purplepag.es',
  // 'wss://relay.nostr.band',
  "wss://nos.lol",
  "wss://bouncer.nostree.me",
  "wss://nostr.land/"
  // 'wss://purplerelay.com/',
];
const ndk = new src_default({
  explicitRelayUrls: defaulRelaysUrls,
  cacheAdapter
});
ndk.connect().then(() => console.log("ndk connected successfully"));
const ndkStore = writable(ndk);
export {
  ndk as a,
  defaulRelaysUrls as d,
  ndkStore as n
};
