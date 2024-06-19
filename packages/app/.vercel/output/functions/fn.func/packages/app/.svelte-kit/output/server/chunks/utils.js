import require$$0 from "node:crypto";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var src = {};
var sha3$1 = {};
var _assert = {};
Object.defineProperty(_assert, "__esModule", { value: true });
_assert.output = _assert.exists = _assert.hash = _assert.bytes = _assert.bool = _assert.number = _assert.isBytes = void 0;
function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`positive integer expected, not ${n}`);
}
_assert.number = number;
function bool(b) {
  if (typeof b !== "boolean")
    throw new Error(`boolean expected, not ${b}`);
}
_assert.bool = bool;
function isBytes(a) {
  return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
}
_assert.isBytes = isBytes;
function bytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
}
_assert.bytes = bytes;
function hash$1(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  number(h.outputLen);
  number(h.blockLen);
}
_assert.hash = hash$1;
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
_assert.exists = exists;
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}
_assert.output = output;
const assert = { number, bool, bytes, hash: hash$1, exists, output };
_assert.default = assert;
var _u64 = {};
Object.defineProperty(_u64, "__esModule", { value: true });
_u64.add5L = _u64.add5H = _u64.add4H = _u64.add4L = _u64.add3H = _u64.add3L = _u64.add = _u64.rotlBL = _u64.rotlBH = _u64.rotlSL = _u64.rotlSH = _u64.rotr32L = _u64.rotr32H = _u64.rotrBL = _u64.rotrBH = _u64.rotrSL = _u64.rotrSH = _u64.shrSL = _u64.shrSH = _u64.toBig = _u64.split = _u64.fromBig = void 0;
const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
_u64.fromBig = fromBig;
function split(lst, le = false) {
  let Ah = new Uint32Array(lst.length);
  let Al = new Uint32Array(lst.length);
  for (let i = 0; i < lst.length; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
_u64.split = split;
const toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
_u64.toBig = toBig;
const shrSH = (h, _l, s) => h >>> s;
_u64.shrSH = shrSH;
const shrSL = (h, l, s) => h << 32 - s | l >>> s;
_u64.shrSL = shrSL;
const rotrSH = (h, l, s) => h >>> s | l << 32 - s;
_u64.rotrSH = rotrSH;
const rotrSL = (h, l, s) => h << 32 - s | l >>> s;
_u64.rotrSL = rotrSL;
const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
_u64.rotrBH = rotrBH;
const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
_u64.rotrBL = rotrBL;
const rotr32H = (_h, l) => l;
_u64.rotr32H = rotr32H;
const rotr32L = (h, _l) => h;
_u64.rotr32L = rotr32L;
const rotlSH = (h, l, s) => h << s | l >>> 32 - s;
_u64.rotlSH = rotlSH;
const rotlSL = (h, l, s) => l << s | h >>> 32 - s;
_u64.rotlSL = rotlSL;
const rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
_u64.rotlBH = rotlBH;
const rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
_u64.rotlBL = rotlBL;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
_u64.add = add;
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
_u64.add3L = add3L;
const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
_u64.add3H = add3H;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
_u64.add4L = add4L;
const add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
_u64.add4H = add4H;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
_u64.add5L = add5L;
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
_u64.add5H = add5H;
const u64 = {
  fromBig,
  split,
  toBig,
  shrSH,
  shrSL,
  rotrSH,
  rotrSL,
  rotrBH,
  rotrBL,
  rotr32H,
  rotr32L,
  rotlSH,
  rotlSL,
  rotlBH,
  rotlBL,
  add,
  add3L,
  add3H,
  add4L,
  add4H,
  add5H,
  add5L
};
_u64.default = u64;
var utils = {};
var cryptoNode = {};
Object.defineProperty(cryptoNode, "__esModule", { value: true });
cryptoNode.crypto = void 0;
const nc = require$$0;
cryptoNode.crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : void 0;
(function(exports) {
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.randomBytes = exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.byteSwap32 = exports.byteSwapIfBE = exports.byteSwap = exports.isLE = exports.rotl = exports.rotr = exports.createView = exports.u32 = exports.u8 = exports.isBytes = void 0;
  const crypto_1 = cryptoNode;
  const _assert_js_12 = _assert;
  function isBytes2(a) {
    return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
  }
  exports.isBytes = isBytes2;
  const u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  exports.u8 = u8;
  const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  exports.u32 = u32;
  const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  exports.createView = createView;
  const rotr = (word, shift) => word << 32 - shift | word >>> shift;
  exports.rotr = rotr;
  const rotl = (word, shift) => word << shift | word >>> 32 - shift >>> 0;
  exports.rotl = rotl;
  exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  const byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
  exports.byteSwap = byteSwap;
  exports.byteSwapIfBE = exports.isLE ? (n) => n : (n) => (0, exports.byteSwap)(n);
  function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (0, exports.byteSwap)(arr[i]);
    }
  }
  exports.byteSwap32 = byteSwap32;
  const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes2) {
    (0, _assert_js_12.bytes)(bytes2);
    let hex = "";
    for (let i = 0; i < bytes2.length; i++) {
      hex += hexes[bytes2[i]];
    }
    return hex;
  }
  exports.bytesToHex = bytesToHex;
  const asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
  function asciiToBase16(char) {
    if (char >= asciis._0 && char <= asciis._9)
      return char - asciis._0;
    if (char >= asciis._A && char <= asciis._F)
      return char - (asciis._A - 10);
    if (char >= asciis._a && char <= asciis._f)
      return char - (asciis._a - 10);
    return;
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("padded hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  exports.hexToBytes = hexToBytes;
  const nextTick = async () => {
  };
  exports.nextTick = nextTick;
  async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
      cb(i);
      const diff = Date.now() - ts;
      if (diff >= 0 && diff < tick)
        continue;
      await (0, exports.nextTick)();
      ts += diff;
    }
  }
  exports.asyncLoop = asyncLoop;
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str));
  }
  exports.utf8ToBytes = utf8ToBytes;
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    (0, _assert_js_12.bytes)(data);
    return data;
  }
  exports.toBytes = toBytes;
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      (0, _assert_js_12.bytes)(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  exports.concatBytes = concatBytes;
  class Hash {
    // Safe version that clones internal state
    clone() {
      return this._cloneInto();
    }
  }
  exports.Hash = Hash;
  const toStr = {}.toString;
  function checkOpts(defaults, opts) {
    if (opts !== void 0 && toStr.call(opts) !== "[object Object]")
      throw new Error("Options should be object or undefined");
    const merged = Object.assign(defaults, opts);
    return merged;
  }
  exports.checkOpts = checkOpts;
  function wrapConstructor(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  exports.wrapConstructor = wrapConstructor;
  function wrapConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
  }
  exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
  function wrapXOFConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
  }
  exports.wrapXOFConstructorWithOpts = wrapXOFConstructorWithOpts;
  function randomBytes(bytesLength = 32) {
    if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") {
      return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }
  exports.randomBytes = randomBytes;
})(utils);
Object.defineProperty(sha3$1, "__esModule", { value: true });
sha3$1.shake256 = sha3$1.shake128 = sha3$1.keccak_512 = sha3$1.keccak_384 = sha3$1.keccak_256 = sha3$1.keccak_224 = sha3$1.sha3_512 = sha3$1.sha3_384 = sha3$1.sha3_256 = sha3$1.sha3_224 = sha3$1.Keccak = sha3$1.keccakP = void 0;
const _assert_js_1 = _assert;
const _u64_js_1 = _u64;
const utils_js_1 = utils;
const SHA3_PI = [];
const SHA3_ROTL = [];
const _SHA3_IOTA = [];
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
const _2n = /* @__PURE__ */ BigInt(2);
const _7n = /* @__PURE__ */ BigInt(7);
const _256n = /* @__PURE__ */ BigInt(256);
const _0x71n = /* @__PURE__ */ BigInt(113);
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
  [x, y] = [y, (2 * x + 3 * y) % 5];
  SHA3_PI.push(2 * (5 * y + x));
  SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n;
  for (let j = 0; j < 7; j++) {
    R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
    if (R & _2n)
      t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
  }
  _SHA3_IOTA.push(t);
}
const [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ (0, _u64_js_1.split)(_SHA3_IOTA, true);
const rotlH = (h, l, s) => s > 32 ? (0, _u64_js_1.rotlBH)(h, l, s) : (0, _u64_js_1.rotlSH)(h, l, s);
const rotlL = (h, l, s) => s > 32 ? (0, _u64_js_1.rotlBL)(h, l, s) : (0, _u64_js_1.rotlSL)(h, l, s);
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  B.fill(0);
}
sha3$1.keccakP = keccakP;
class Keccak extends utils_js_1.Hash {
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    super();
    this.blockLen = blockLen;
    this.suffix = suffix;
    this.outputLen = outputLen;
    this.enableXOF = enableXOF;
    this.rounds = rounds;
    this.pos = 0;
    this.posOut = 0;
    this.finished = false;
    this.destroyed = false;
    (0, _assert_js_1.number)(outputLen);
    if (0 >= this.blockLen || this.blockLen >= 200)
      throw new Error("Sha3 supports only keccak-f1600 function");
    this.state = new Uint8Array(200);
    this.state32 = (0, utils_js_1.u32)(this.state);
  }
  keccak() {
    if (!utils_js_1.isLE)
      (0, utils_js_1.byteSwap32)(this.state32);
    keccakP(this.state32, this.rounds);
    if (!utils_js_1.isLE)
      (0, utils_js_1.byteSwap32)(this.state32);
    this.posOut = 0;
    this.pos = 0;
  }
  update(data) {
    (0, _assert_js_1.exists)(this);
    const { blockLen, state } = this;
    data = (0, utils_js_1.toBytes)(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      for (let i = 0; i < take; i++)
        state[this.pos++] ^= data[pos++];
      if (this.pos === blockLen)
        this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    const { state, suffix, pos, blockLen } = this;
    state[pos] ^= suffix;
    if ((suffix & 128) !== 0 && pos === blockLen - 1)
      this.keccak();
    state[blockLen - 1] ^= 128;
    this.keccak();
  }
  writeInto(out) {
    (0, _assert_js_1.exists)(this, false);
    (0, _assert_js_1.bytes)(out);
    this.finish();
    const bufferOut = this.state;
    const { blockLen } = this;
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen)
        this.keccak();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(out);
  }
  xof(bytes2) {
    (0, _assert_js_1.number)(bytes2);
    return this.xofInto(new Uint8Array(bytes2));
  }
  digestInto(out) {
    (0, _assert_js_1.output)(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = true;
    this.state.fill(0);
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
    to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
    to.state32.set(this.state32);
    to.pos = this.pos;
    to.posOut = this.posOut;
    to.finished = this.finished;
    to.rounds = rounds;
    to.suffix = suffix;
    to.outputLen = outputLen;
    to.enableXOF = enableXOF;
    to.destroyed = this.destroyed;
    return to;
  }
}
sha3$1.Keccak = Keccak;
const gen = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapConstructor)(() => new Keccak(blockLen, suffix, outputLen));
sha3$1.sha3_224 = gen(6, 144, 224 / 8);
sha3$1.sha3_256 = gen(6, 136, 256 / 8);
sha3$1.sha3_384 = gen(6, 104, 384 / 8);
sha3$1.sha3_512 = gen(6, 72, 512 / 8);
sha3$1.keccak_224 = gen(1, 144, 224 / 8);
sha3$1.keccak_256 = gen(1, 136, 256 / 8);
sha3$1.keccak_384 = gen(1, 104, 384 / 8);
sha3$1.keccak_512 = gen(1, 72, 512 / 8);
const genShake = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapXOFConstructorWithOpts)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true));
sha3$1.shake128 = genShake(31, 168, 128 / 8);
sha3$1.shake256 = genShake(31, 136, 256 / 8);
const { sha3_512: sha3 } = sha3$1;
const defaultLength = 24;
const bigLength = 32;
const createEntropy = (length = 4, random = Math.random) => {
  let entropy = "";
  while (entropy.length < length) {
    entropy = entropy + Math.floor(random() * 36).toString(36);
  }
  return entropy;
};
function bufToBigInt(buf) {
  let bits = 8n;
  let value = 0n;
  for (const i of buf.values()) {
    const bi = BigInt(i);
    value = (value << bits) + bi;
  }
  return value;
}
const hash = (input = "") => {
  return bufToBigInt(sha3(input)).toString(36).slice(1);
};
const alphabet = Array.from(
  { length: 26 },
  (x, i) => String.fromCharCode(i + 97)
);
const randomLetter = (random) => alphabet[Math.floor(random() * alphabet.length)];
const createFingerprint = ({
  globalObj = typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : {},
  random = Math.random
} = {}) => {
  const globals = Object.keys(globalObj).toString();
  const sourceString = globals.length ? globals + createEntropy(bigLength, random) : createEntropy(bigLength, random);
  return hash(sourceString).substring(0, bigLength);
};
const createCounter = (count) => () => {
  return count++;
};
const initialCountMax = 476782367;
const init$1 = ({
  // Fallback if the user does not pass in a CSPRNG. This should be OK
  // because we don't rely solely on the random number generator for entropy.
  // We also use the host fingerprint, current time, and a session counter.
  random = Math.random,
  counter = createCounter(Math.floor(random() * initialCountMax)),
  length = defaultLength,
  fingerprint = createFingerprint({ random })
} = {}) => {
  return function cuid2() {
    const firstLetter = randomLetter(random);
    const time = Date.now().toString(36);
    const count = counter().toString(36);
    const salt = createEntropy(length, random);
    const hashInput = `${time + salt + count + fingerprint}`;
    return `${firstLetter + hash(hashInput).substring(1, length)}`;
  };
};
const createId$2 = init$1();
const isCuid$1 = (id, { minLength = 2, maxLength = bigLength } = {}) => {
  const length = id.length;
  const regex = /^[0-9a-z]+$/;
  try {
    if (typeof id === "string" && length >= minLength && length <= maxLength && regex.test(id))
      return true;
  } finally {
  }
  return false;
};
src.getConstants = () => ({ defaultLength, bigLength });
src.init = init$1;
src.createId = createId$2;
src.bufToBigInt = bufToBigInt;
src.createCounter = createCounter;
src.createFingerprint = createFingerprint;
src.isCuid = isCuid$1;
const { createId: createId$1, init, getConstants, isCuid } = src;
var init_1 = init;
const createId = init_1({
  length: 10
});
export {
  createId as c
};
