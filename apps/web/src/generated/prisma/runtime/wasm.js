'use strict';
var Uo = Object.create;
var kt = Object.defineProperty;
var qo = Object.getOwnPropertyDescriptor;
var Bo = Object.getOwnPropertyNames;
var $o = Object.getPrototypeOf,
  Vo = Object.prototype.hasOwnProperty;
var se = (e, t) => () => (e && (t = e((e = 0))), t);
var De = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
  Mt = (e, t) => {
    for (var r in t) kt(e, r, { get: t[r], enumerable: !0 });
  },
  rn = (e, t, r, n) => {
    if ((t && typeof t == 'object') || typeof t == 'function')
      for (let i of Bo(t))
        !Vo.call(e, i) &&
          i !== r &&
          kt(e, i, { get: () => t[i], enumerable: !(n = qo(t, i)) || n.enumerable });
    return e;
  };
var Fe = (e, t, r) => (
    (r = e != null ? Uo($o(e)) : {}),
    rn(t || !e || !e.__esModule ? kt(r, 'default', { value: e, enumerable: !0 }) : r, e)
  ),
  jo = e => rn(kt({}, '__esModule', { value: !0 }), e);
function gr(e, t) {
  if (((t = t.toLowerCase()), t === 'utf8' || t === 'utf-8')) return new y(Wo.encode(e));
  if (t === 'base64' || t === 'base64url')
    return (
      (e = e.replace(/-/g, '+').replace(/_/g, '/')),
      (e = e.replace(/[^A-Za-z0-9+/]/g, '')),
      new y([...atob(e)].map(r => r.charCodeAt(0)))
    );
  if (t === 'binary' || t === 'ascii' || t === 'latin1' || t === 'latin-1')
    return new y([...e].map(r => r.charCodeAt(0)));
  if (t === 'ucs2' || t === 'ucs-2' || t === 'utf16le' || t === 'utf-16le') {
    let r = new y(e.length * 2),
      n = new DataView(r.buffer);
    for (let i = 0; i < e.length; i++) n.setUint16(i * 2, e.charCodeAt(i), !0);
    return r;
  }
  if (t === 'hex') {
    let r = new y(e.length / 2);
    for (let n = 0, i = 0; i < e.length; i += 2, n++) r[n] = parseInt(e.slice(i, i + 2), 16);
    return r;
  }
  on(`encoding "${t}"`);
}
function Qo(e) {
  let r = Object.getOwnPropertyNames(DataView.prototype).filter(
      a => a.startsWith('get') || a.startsWith('set')
    ),
    n = r.map(a => a.replace('get', 'read').replace('set', 'write')),
    i = (a, u) =>
      function (g = 0) {
        return (
          B(g, 'offset'),
          Y(g, 'offset'),
          V(g, 'offset', this.length - 1),
          new DataView(this.buffer)[r[a]](g, u)
        );
      },
    o = (a, u) =>
      function (g, T = 0) {
        let C = r[a].match(/set(\w+\d+)/)[1].toLowerCase(),
          O = Go[C];
        return (
          B(T, 'offset'),
          Y(T, 'offset'),
          V(T, 'offset', this.length - 1),
          Jo(g, 'value', O[0], O[1]),
          new DataView(this.buffer)[r[a]](T, g, u),
          T + parseInt(r[a].match(/\d+/)[0]) / 8
        );
      },
    s = a => {
      a.forEach(u => {
        (u.includes('Uint') && (e[u.replace('Uint', 'UInt')] = e[u]),
          u.includes('Float64') && (e[u.replace('Float64', 'Double')] = e[u]),
          u.includes('Float32') && (e[u.replace('Float32', 'Float')] = e[u]));
      });
    };
  n.forEach((a, u) => {
    (a.startsWith('read') &&
      ((e[a] = i(u, !1)), (e[a + 'LE'] = i(u, !0)), (e[a + 'BE'] = i(u, !1))),
      a.startsWith('write') &&
        ((e[a] = o(u, !1)), (e[a + 'LE'] = o(u, !0)), (e[a + 'BE'] = o(u, !1))),
      s([a, a + 'LE', a + 'BE']));
  });
}
function on(e) {
  throw new Error(`Buffer polyfill does not implement "${e}"`);
}
function It(e, t) {
  if (!(e instanceof Uint8Array))
    throw new TypeError(`The "${t}" argument must be an instance of Buffer or Uint8Array`);
}
function V(e, t, r = zo + 1) {
  if (e < 0 || e > r) {
    let n = new RangeError(
      `The value of "${t}" is out of range. It must be >= 0 && <= ${r}. Received ${e}`
    );
    throw ((n.code = 'ERR_OUT_OF_RANGE'), n);
  }
}
function B(e, t) {
  if (typeof e != 'number') {
    let r = new TypeError(`The "${t}" argument must be of type number. Received type ${typeof e}.`);
    throw ((r.code = 'ERR_INVALID_ARG_TYPE'), r);
  }
}
function Y(e, t) {
  if (!Number.isInteger(e) || Number.isNaN(e)) {
    let r = new RangeError(
      `The value of "${t}" is out of range. It must be an integer. Received ${e}`
    );
    throw ((r.code = 'ERR_OUT_OF_RANGE'), r);
  }
}
function Jo(e, t, r, n) {
  if (e < r || e > n) {
    let i = new RangeError(
      `The value of "${t}" is out of range. It must be >= ${r} and <= ${n}. Received ${e}`
    );
    throw ((i.code = 'ERR_OUT_OF_RANGE'), i);
  }
}
function nn(e, t) {
  if (typeof e != 'string') {
    let r = new TypeError(`The "${t}" argument must be of type string. Received type ${typeof e}`);
    throw ((r.code = 'ERR_INVALID_ARG_TYPE'), r);
  }
}
function Yo(e, t = 'utf8') {
  return y.from(e, t);
}
var y,
  Go,
  Wo,
  Ko,
  Ho,
  zo,
  b,
  hr,
  c = se(() => {
    'use strict';
    y = class e extends Uint8Array {
      constructor() {
        super(...arguments);
        this._isBuffer = !0;
      }
      get offset() {
        return this.byteOffset;
      }
      static alloc(r, n = 0, i = 'utf8') {
        return (nn(i, 'encoding'), e.allocUnsafe(r).fill(n, i));
      }
      static allocUnsafe(r) {
        return e.from(r);
      }
      static allocUnsafeSlow(r) {
        return e.from(r);
      }
      static isBuffer(r) {
        return r && !!r._isBuffer;
      }
      static byteLength(r, n = 'utf8') {
        if (typeof r == 'string') return gr(r, n).byteLength;
        if (r && r.byteLength) return r.byteLength;
        let i = new TypeError(
          'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer.'
        );
        throw ((i.code = 'ERR_INVALID_ARG_TYPE'), i);
      }
      static isEncoding(r) {
        return Ho.includes(r);
      }
      static compare(r, n) {
        (It(r, 'buff1'), It(n, 'buff2'));
        for (let i = 0; i < r.length; i++) {
          if (r[i] < n[i]) return -1;
          if (r[i] > n[i]) return 1;
        }
        return r.length === n.length ? 0 : r.length > n.length ? 1 : -1;
      }
      static from(r, n = 'utf8') {
        if (r && typeof r == 'object' && r.type === 'Buffer') return new e(r.data);
        if (typeof r == 'number') return new e(new Uint8Array(r));
        if (typeof r == 'string') return gr(r, n);
        if (ArrayBuffer.isView(r)) {
          let { byteOffset: i, byteLength: o, buffer: s } = r;
          return 'map' in r && typeof r.map == 'function'
            ? new e(
                r.map(a => a % 256),
                i,
                o
              )
            : new e(s, i, o);
        }
        if (r && typeof r == 'object' && ('length' in r || 'byteLength' in r || 'buffer' in r))
          return new e(r);
        throw new TypeError(
          'First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.'
        );
      }
      static concat(r, n) {
        if (r.length === 0) return e.alloc(0);
        let i = [].concat(...r.map(s => [...s])),
          o = e.alloc(n !== void 0 ? n : i.length);
        return (o.set(n !== void 0 ? i.slice(0, n) : i), o);
      }
      slice(r = 0, n = this.length) {
        return this.subarray(r, n);
      }
      subarray(r = 0, n = this.length) {
        return Object.setPrototypeOf(super.subarray(r, n), e.prototype);
      }
      reverse() {
        return (super.reverse(), this);
      }
      readIntBE(r, n) {
        (B(r, 'offset'),
          Y(r, 'offset'),
          V(r, 'offset', this.length - 1),
          B(n, 'byteLength'),
          Y(n, 'byteLength'));
        let i = new DataView(this.buffer, r, n),
          o = 0;
        for (let s = 0; s < n; s++) o = o * 256 + i.getUint8(s);
        return (i.getUint8(0) & 128 && (o -= Math.pow(256, n)), o);
      }
      readIntLE(r, n) {
        (B(r, 'offset'),
          Y(r, 'offset'),
          V(r, 'offset', this.length - 1),
          B(n, 'byteLength'),
          Y(n, 'byteLength'));
        let i = new DataView(this.buffer, r, n),
          o = 0;
        for (let s = 0; s < n; s++) o += i.getUint8(s) * Math.pow(256, s);
        return (i.getUint8(n - 1) & 128 && (o -= Math.pow(256, n)), o);
      }
      readUIntBE(r, n) {
        (B(r, 'offset'),
          Y(r, 'offset'),
          V(r, 'offset', this.length - 1),
          B(n, 'byteLength'),
          Y(n, 'byteLength'));
        let i = new DataView(this.buffer, r, n),
          o = 0;
        for (let s = 0; s < n; s++) o = o * 256 + i.getUint8(s);
        return o;
      }
      readUintBE(r, n) {
        return this.readUIntBE(r, n);
      }
      readUIntLE(r, n) {
        (B(r, 'offset'),
          Y(r, 'offset'),
          V(r, 'offset', this.length - 1),
          B(n, 'byteLength'),
          Y(n, 'byteLength'));
        let i = new DataView(this.buffer, r, n),
          o = 0;
        for (let s = 0; s < n; s++) o += i.getUint8(s) * Math.pow(256, s);
        return o;
      }
      readUintLE(r, n) {
        return this.readUIntLE(r, n);
      }
      writeIntBE(r, n, i) {
        return ((r = r < 0 ? r + Math.pow(256, i) : r), this.writeUIntBE(r, n, i));
      }
      writeIntLE(r, n, i) {
        return ((r = r < 0 ? r + Math.pow(256, i) : r), this.writeUIntLE(r, n, i));
      }
      writeUIntBE(r, n, i) {
        (B(n, 'offset'),
          Y(n, 'offset'),
          V(n, 'offset', this.length - 1),
          B(i, 'byteLength'),
          Y(i, 'byteLength'));
        let o = new DataView(this.buffer, n, i);
        for (let s = i - 1; s >= 0; s--) (o.setUint8(s, r & 255), (r = r / 256));
        return n + i;
      }
      writeUintBE(r, n, i) {
        return this.writeUIntBE(r, n, i);
      }
      writeUIntLE(r, n, i) {
        (B(n, 'offset'),
          Y(n, 'offset'),
          V(n, 'offset', this.length - 1),
          B(i, 'byteLength'),
          Y(i, 'byteLength'));
        let o = new DataView(this.buffer, n, i);
        for (let s = 0; s < i; s++) (o.setUint8(s, r & 255), (r = r / 256));
        return n + i;
      }
      writeUintLE(r, n, i) {
        return this.writeUIntLE(r, n, i);
      }
      toJSON() {
        return { type: 'Buffer', data: Array.from(this) };
      }
      swap16() {
        let r = new DataView(this.buffer, this.byteOffset, this.byteLength);
        for (let n = 0; n < this.length; n += 2) r.setUint16(n, r.getUint16(n, !0), !1);
        return this;
      }
      swap32() {
        let r = new DataView(this.buffer, this.byteOffset, this.byteLength);
        for (let n = 0; n < this.length; n += 4) r.setUint32(n, r.getUint32(n, !0), !1);
        return this;
      }
      swap64() {
        let r = new DataView(this.buffer, this.byteOffset, this.byteLength);
        for (let n = 0; n < this.length; n += 8) r.setBigUint64(n, r.getBigUint64(n, !0), !1);
        return this;
      }
      compare(r, n = 0, i = r.length, o = 0, s = this.length) {
        return (
          It(r, 'target'),
          B(n, 'targetStart'),
          B(i, 'targetEnd'),
          B(o, 'sourceStart'),
          B(s, 'sourceEnd'),
          V(n, 'targetStart'),
          V(i, 'targetEnd', r.length),
          V(o, 'sourceStart'),
          V(s, 'sourceEnd', this.length),
          e.compare(this.slice(o, s), r.slice(n, i))
        );
      }
      equals(r) {
        return (It(r, 'otherBuffer'), this.length === r.length && this.every((n, i) => n === r[i]));
      }
      copy(r, n = 0, i = 0, o = this.length) {
        (V(n, 'targetStart'),
          V(i, 'sourceStart', this.length),
          V(o, 'sourceEnd'),
          (n >>>= 0),
          (i >>>= 0),
          (o >>>= 0));
        let s = 0;
        for (; i < o && !(this[i] === void 0 || r[n] === void 0); )
          ((r[n] = this[i]), s++, i++, n++);
        return s;
      }
      write(r, n, i, o = 'utf8') {
        let s = typeof n == 'string' ? 0 : (n ?? 0),
          a = typeof i == 'string' ? this.length - s : (i ?? this.length - s);
        return (
          (o = typeof n == 'string' ? n : typeof i == 'string' ? i : o),
          B(s, 'offset'),
          B(a, 'length'),
          V(s, 'offset', this.length),
          V(a, 'length', this.length),
          (o === 'ucs2' || o === 'ucs-2' || o === 'utf16le' || o === 'utf-16le') &&
            (a = a - (a % 2)),
          gr(r, o).copy(this, s, 0, a)
        );
      }
      fill(r = 0, n = 0, i = this.length, o = 'utf-8') {
        let s = typeof n == 'string' ? 0 : n,
          a = typeof i == 'string' ? this.length : i;
        if (
          ((o = typeof n == 'string' ? n : typeof i == 'string' ? i : o),
          (r = e.from(typeof r == 'number' ? [r] : (r ?? []), o)),
          nn(o, 'encoding'),
          V(s, 'offset', this.length),
          V(a, 'end', this.length),
          r.length !== 0)
        )
          for (let u = s; u < a; u += r.length)
            super.set(r.slice(0, r.length + u >= this.length ? this.length - u : r.length), u);
        return this;
      }
      includes(r, n = null, i = 'utf-8') {
        return this.indexOf(r, n, i) !== -1;
      }
      lastIndexOf(r, n = null, i = 'utf-8') {
        return this.indexOf(r, n, i, !0);
      }
      indexOf(r, n = null, i = 'utf-8', o = !1) {
        let s = o ? this.findLastIndex.bind(this) : this.findIndex.bind(this);
        i = typeof n == 'string' ? n : i;
        let a = e.from(typeof r == 'number' ? [r] : r, i),
          u = typeof n == 'string' ? 0 : n;
        return (
          (u = typeof n == 'number' ? u : null),
          (u = Number.isNaN(u) ? null : u),
          (u ??= o ? this.length : 0),
          (u = u < 0 ? this.length + u : u),
          a.length === 0 && o === !1
            ? u >= this.length
              ? this.length
              : u
            : a.length === 0 && o === !0
              ? (u >= this.length ? this.length : u) || this.length
              : s(
                  (g, T) =>
                    (o ? T <= u : T >= u) &&
                    this[T] === a[0] &&
                    a.every((O, A) => this[T + A] === O)
                )
        );
      }
      toString(r = 'utf8', n = 0, i = this.length) {
        if (((n = n < 0 ? 0 : n), (r = r.toString().toLowerCase()), i <= 0)) return '';
        if (r === 'utf8' || r === 'utf-8') return Ko.decode(this.slice(n, i));
        if (r === 'base64' || r === 'base64url') {
          let o = btoa(this.reduce((s, a) => s + hr(a), ''));
          return r === 'base64url'
            ? o.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
            : o;
        }
        if (r === 'binary' || r === 'ascii' || r === 'latin1' || r === 'latin-1')
          return this.slice(n, i).reduce((o, s) => o + hr(s & (r === 'ascii' ? 127 : 255)), '');
        if (r === 'ucs2' || r === 'ucs-2' || r === 'utf16le' || r === 'utf-16le') {
          let o = new DataView(this.buffer.slice(n, i));
          return Array.from({ length: o.byteLength / 2 }, (s, a) =>
            a * 2 + 1 < o.byteLength ? hr(o.getUint16(a * 2, !0)) : ''
          ).join('');
        }
        if (r === 'hex')
          return this.slice(n, i).reduce((o, s) => o + s.toString(16).padStart(2, '0'), '');
        on(`encoding "${r}"`);
      }
      toLocaleString() {
        return this.toString();
      }
      inspect() {
        return `<Buffer ${this.toString('hex')
          .match(/.{1,2}/g)
          .join(' ')}>`;
      }
    };
    ((Go = {
      int8: [-128, 127],
      int16: [-32768, 32767],
      int32: [-2147483648, 2147483647],
      uint8: [0, 255],
      uint16: [0, 65535],
      uint32: [0, 4294967295],
      float32: [-1 / 0, 1 / 0],
      float64: [-1 / 0, 1 / 0],
      bigint64: [-0x8000000000000000n, 0x7fffffffffffffffn],
      biguint64: [0n, 0xffffffffffffffffn],
    }),
      (Wo = new TextEncoder()),
      (Ko = new TextDecoder()),
      (Ho = [
        'utf8',
        'utf-8',
        'hex',
        'base64',
        'ascii',
        'binary',
        'base64url',
        'ucs2',
        'ucs-2',
        'utf16le',
        'utf-16le',
        'latin1',
        'latin-1',
      ]),
      (zo = 4294967295));
    Qo(y.prototype);
    ((b = new Proxy(Yo, {
      construct(e, [t, r]) {
        return y.from(t, r);
      },
      get(e, t) {
        return y[t];
      },
    })),
      (hr = String.fromCodePoint));
  });
var h,
  m = se(() => {
    'use strict';
    h = {
      nextTick: (e, ...t) => {
        setTimeout(() => {
          e(...t);
        }, 0);
      },
      env: {},
      version: '',
      cwd: () => '/',
      stderr: {},
      argv: ['/bin/node'],
    };
  });
var x,
  p = se(() => {
    'use strict';
    x =
      globalThis.performance ??
      (() => {
        let e = Date.now();
        return { now: () => Date.now() - e };
      })();
  });
var E,
  d = se(() => {
    'use strict';
    E = () => {};
    E.prototype = E;
  });
var w,
  f = se(() => {
    'use strict';
    w = class {
      constructor(t) {
        this.value = t;
      }
      deref() {
        return this.value;
      }
    };
  });
function un(e, t) {
  var r,
    n,
    i,
    o,
    s,
    a,
    u,
    g,
    T = e.constructor,
    C = T.precision;
  if (!e.s || !t.s) return (t.s || (t = new T(e)), U ? D(t, C) : t);
  if (((u = e.d), (g = t.d), (s = e.e), (i = t.e), (u = u.slice()), (o = s - i), o)) {
    for (
      o < 0 ? ((n = u), (o = -o), (a = g.length)) : ((n = g), (i = s), (a = u.length)),
        s = Math.ceil(C / N),
        a = s > a ? s + 1 : a + 1,
        o > a && ((o = a), (n.length = 1)),
        n.reverse();
      o--;

    )
      n.push(0);
    n.reverse();
  }
  for (a = u.length, o = g.length, a - o < 0 && ((o = a), (n = g), (g = u), (u = n)), r = 0; o; )
    ((r = ((u[--o] = u[o] + g[o] + r) / Q) | 0), (u[o] %= Q));
  for (r && (u.unshift(r), ++i), a = u.length; u[--a] == 0; ) u.pop();
  return ((t.d = u), (t.e = i), U ? D(t, C) : t);
}
function le(e, t, r) {
  if (e !== ~~e || e < t || e > r) throw Error(Oe + e);
}
function ae(e) {
  var t,
    r,
    n,
    i = e.length - 1,
    o = '',
    s = e[0];
  if (i > 0) {
    for (o += s, t = 1; t < i; t++)
      ((n = e[t] + ''), (r = N - n.length), r && (o += Pe(r)), (o += n));
    ((s = e[t]), (n = s + ''), (r = N - n.length), r && (o += Pe(r)));
  } else if (s === 0) return '0';
  for (; s % 10 === 0; ) s /= 10;
  return o + s;
}
function cn(e, t) {
  var r,
    n,
    i,
    o,
    s,
    a,
    u = 0,
    g = 0,
    T = e.constructor,
    C = T.precision;
  if ($(e) > 16) throw Error(br + $(e));
  if (!e.s) return new T(Z);
  for (t == null ? ((U = !1), (a = C)) : (a = t), s = new T(0.03125); e.abs().gte(0.1); )
    ((e = e.times(s)), (g += 5));
  for (
    n = ((Math.log(Se(2, g)) / Math.LN10) * 2 + 5) | 0,
      a += n,
      r = i = o = new T(Z),
      T.precision = a;
    ;

  ) {
    if (
      ((i = D(i.times(e), a)),
      (r = r.times(++u)),
      (s = o.plus(ye(i, r, a))),
      ae(s.d).slice(0, a) === ae(o.d).slice(0, a))
    ) {
      for (; g--; ) o = D(o.times(o), a);
      return ((T.precision = C), t == null ? ((U = !0), D(o, C)) : o);
    }
    o = s;
  }
}
function $(e) {
  for (var t = e.e * N, r = e.d[0]; r >= 10; r /= 10) t++;
  return t;
}
function yr(e, t, r) {
  if (t > e.LN10.sd())
    throw ((U = !0), r && (e.precision = r), Error(re + 'LN10 precision limit exceeded'));
  return D(new e(e.LN10), t);
}
function Pe(e) {
  for (var t = ''; e--; ) t += '0';
  return t;
}
function it(e, t) {
  var r,
    n,
    i,
    o,
    s,
    a,
    u,
    g,
    T,
    C = 1,
    O = 10,
    A = e,
    M = A.d,
    S = A.constructor,
    I = S.precision;
  if (A.s < 1) throw Error(re + (A.s ? 'NaN' : '-Infinity'));
  if (A.eq(Z)) return new S(0);
  if ((t == null ? ((U = !1), (g = I)) : (g = t), A.eq(10)))
    return (t == null && (U = !0), yr(S, g));
  if (
    ((g += O), (S.precision = g), (r = ae(M)), (n = r.charAt(0)), (o = $(A)), Math.abs(o) < 15e14)
  ) {
    for (; (n < 7 && n != 1) || (n == 1 && r.charAt(1) > 3); )
      ((A = A.times(e)), (r = ae(A.d)), (n = r.charAt(0)), C++);
    ((o = $(A)), n > 1 ? ((A = new S('0.' + r)), o++) : (A = new S(n + '.' + r.slice(1))));
  } else
    return (
      (u = yr(S, g + 2, I).times(o + '')),
      (A = it(new S(n + '.' + r.slice(1)), g - O).plus(u)),
      (S.precision = I),
      t == null ? ((U = !0), D(A, I)) : A
    );
  for (a = s = A = ye(A.minus(Z), A.plus(Z), g), T = D(A.times(A), g), i = 3; ; ) {
    if (
      ((s = D(s.times(T), g)),
      (u = a.plus(ye(s, new S(i), g))),
      ae(u.d).slice(0, g) === ae(a.d).slice(0, g))
    )
      return (
        (a = a.times(2)),
        o !== 0 && (a = a.plus(yr(S, g + 2, I).times(o + ''))),
        (a = ye(a, new S(C), g)),
        (S.precision = I),
        t == null ? ((U = !0), D(a, I)) : a
      );
    ((a = u), (i += 2));
  }
}
function sn(e, t) {
  var r, n, i;
  for (
    (r = t.indexOf('.')) > -1 && (t = t.replace('.', '')),
      (n = t.search(/e/i)) > 0
        ? (r < 0 && (r = n), (r += +t.slice(n + 1)), (t = t.substring(0, n)))
        : r < 0 && (r = t.length),
      n = 0;
    t.charCodeAt(n) === 48;

  )
    ++n;
  for (i = t.length; t.charCodeAt(i - 1) === 48; ) --i;
  if (((t = t.slice(n, i)), t)) {
    if (
      ((i -= n),
      (r = r - n - 1),
      (e.e = Ue(r / N)),
      (e.d = []),
      (n = (r + 1) % N),
      r < 0 && (n += N),
      n < i)
    ) {
      for (n && e.d.push(+t.slice(0, n)), i -= N; n < i; ) e.d.push(+t.slice(n, (n += N)));
      ((t = t.slice(n)), (n = N - t.length));
    } else n -= i;
    for (; n--; ) t += '0';
    if ((e.d.push(+t), U && (e.e > Lt || e.e < -Lt))) throw Error(br + r);
  } else ((e.s = 0), (e.e = 0), (e.d = [0]));
  return e;
}
function D(e, t, r) {
  var n,
    i,
    o,
    s,
    a,
    u,
    g,
    T,
    C = e.d;
  for (s = 1, o = C[0]; o >= 10; o /= 10) s++;
  if (((n = t - s), n < 0)) ((n += N), (i = t), (g = C[(T = 0)]));
  else {
    if (((T = Math.ceil((n + 1) / N)), (o = C.length), T >= o)) return e;
    for (g = o = C[T], s = 1; o >= 10; o /= 10) s++;
    ((n %= N), (i = n - N + s));
  }
  if (
    (r !== void 0 &&
      ((o = Se(10, s - i - 1)),
      (a = (g / o) % 10 | 0),
      (u = t < 0 || C[T + 1] !== void 0 || g % o),
      (u =
        r < 4
          ? (a || u) && (r == 0 || r == (e.s < 0 ? 3 : 2))
          : a > 5 ||
            (a == 5 &&
              (r == 4 ||
                u ||
                (r == 6 && (n > 0 ? (i > 0 ? g / Se(10, s - i) : 0) : C[T - 1]) % 10 & 1) ||
                r == (e.s < 0 ? 8 : 7))))),
    t < 1 || !C[0])
  )
    return (
      u
        ? ((o = $(e)),
          (C.length = 1),
          (t = t - o - 1),
          (C[0] = Se(10, (N - (t % N)) % N)),
          (e.e = Ue(-t / N) || 0))
        : ((C.length = 1), (C[0] = e.e = e.s = 0)),
      e
    );
  if (
    (n == 0
      ? ((C.length = T), (o = 1), T--)
      : ((C.length = T + 1),
        (o = Se(10, N - n)),
        (C[T] = i > 0 ? ((g / Se(10, s - i)) % Se(10, i) | 0) * o : 0)),
    u)
  )
    for (;;)
      if (T == 0) {
        (C[0] += o) == Q && ((C[0] = 1), ++e.e);
        break;
      } else {
        if (((C[T] += o), C[T] != Q)) break;
        ((C[T--] = 0), (o = 1));
      }
  for (n = C.length; C[--n] === 0; ) C.pop();
  if (U && (e.e > Lt || e.e < -Lt)) throw Error(br + $(e));
  return e;
}
function mn(e, t) {
  var r,
    n,
    i,
    o,
    s,
    a,
    u,
    g,
    T,
    C,
    O = e.constructor,
    A = O.precision;
  if (!e.s || !t.s) return (t.s ? (t.s = -t.s) : (t = new O(e)), U ? D(t, A) : t);
  if (((u = e.d), (C = t.d), (n = t.e), (g = e.e), (u = u.slice()), (s = g - n), s)) {
    for (
      T = s < 0,
        T ? ((r = u), (s = -s), (a = C.length)) : ((r = C), (n = g), (a = u.length)),
        i = Math.max(Math.ceil(A / N), a) + 2,
        s > i && ((s = i), (r.length = 1)),
        r.reverse(),
        i = s;
      i--;

    )
      r.push(0);
    r.reverse();
  } else {
    for (i = u.length, a = C.length, T = i < a, T && (a = i), i = 0; i < a; i++)
      if (u[i] != C[i]) {
        T = u[i] < C[i];
        break;
      }
    s = 0;
  }
  for (T && ((r = u), (u = C), (C = r), (t.s = -t.s)), a = u.length, i = C.length - a; i > 0; --i)
    u[a++] = 0;
  for (i = C.length; i > s; ) {
    if (u[--i] < C[i]) {
      for (o = i; o && u[--o] === 0; ) u[o] = Q - 1;
      (--u[o], (u[i] += Q));
    }
    u[i] -= C[i];
  }
  for (; u[--a] === 0; ) u.pop();
  for (; u[0] === 0; u.shift()) --n;
  return u[0] ? ((t.d = u), (t.e = n), U ? D(t, A) : t) : new O(0);
}
function ke(e, t, r) {
  var n,
    i = $(e),
    o = ae(e.d),
    s = o.length;
  return (
    t
      ? (r && (n = r - s) > 0
          ? (o = o.charAt(0) + '.' + o.slice(1) + Pe(n))
          : s > 1 && (o = o.charAt(0) + '.' + o.slice(1)),
        (o = o + (i < 0 ? 'e' : 'e+') + i))
      : i < 0
        ? ((o = '0.' + Pe(-i - 1) + o), r && (n = r - s) > 0 && (o += Pe(n)))
        : i >= s
          ? ((o += Pe(i + 1 - s)), r && (n = r - i - 1) > 0 && (o = o + '.' + Pe(n)))
          : ((n = i + 1) < s && (o = o.slice(0, n) + '.' + o.slice(n)),
            r && (n = r - s) > 0 && (i + 1 === s && (o += '.'), (o += Pe(n)))),
    e.s < 0 ? '-' + o : o
  );
}
function an(e, t) {
  if (e.length > t) return ((e.length = t), !0);
}
function pn(e) {
  var t, r, n;
  function i(o) {
    var s = this;
    if (!(s instanceof i)) return new i(o);
    if (((s.constructor = i), o instanceof i)) {
      ((s.s = o.s), (s.e = o.e), (s.d = (o = o.d) ? o.slice() : o));
      return;
    }
    if (typeof o == 'number') {
      if (o * 0 !== 0) throw Error(Oe + o);
      if (o > 0) s.s = 1;
      else if (o < 0) ((o = -o), (s.s = -1));
      else {
        ((s.s = 0), (s.e = 0), (s.d = [0]));
        return;
      }
      if (o === ~~o && o < 1e7) {
        ((s.e = 0), (s.d = [o]));
        return;
      }
      return sn(s, o.toString());
    } else if (typeof o != 'string') throw Error(Oe + o);
    if ((o.charCodeAt(0) === 45 ? ((o = o.slice(1)), (s.s = -1)) : (s.s = 1), Zo.test(o))) sn(s, o);
    else throw Error(Oe + o);
  }
  if (
    ((i.prototype = R),
    (i.ROUND_UP = 0),
    (i.ROUND_DOWN = 1),
    (i.ROUND_CEIL = 2),
    (i.ROUND_FLOOR = 3),
    (i.ROUND_HALF_UP = 4),
    (i.ROUND_HALF_DOWN = 5),
    (i.ROUND_HALF_EVEN = 6),
    (i.ROUND_HALF_CEIL = 7),
    (i.ROUND_HALF_FLOOR = 8),
    (i.clone = pn),
    (i.config = i.set = es),
    e === void 0 && (e = {}),
    e)
  )
    for (n = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'LN10'], t = 0; t < n.length; )
      e.hasOwnProperty((r = n[t++])) || (e[r] = this[r]);
  return (i.config(e), i);
}
function es(e) {
  if (!e || typeof e != 'object') throw Error(re + 'Object expected');
  var t,
    r,
    n,
    i = ['precision', 1, Ne, 'rounding', 0, 8, 'toExpNeg', -1 / 0, 0, 'toExpPos', 0, 1 / 0];
  for (t = 0; t < i.length; t += 3)
    if ((n = e[(r = i[t])]) !== void 0)
      if (Ue(n) === n && n >= i[t + 1] && n <= i[t + 2]) this[r] = n;
      else throw Error(Oe + r + ': ' + n);
  if ((n = e[(r = 'LN10')]) !== void 0)
    if (n == Math.LN10) this[r] = new this(n);
    else throw Error(Oe + r + ': ' + n);
  return this;
}
var Ne,
  Xo,
  wr,
  U,
  re,
  Oe,
  br,
  Ue,
  Se,
  Zo,
  Z,
  Q,
  N,
  ln,
  Lt,
  R,
  ye,
  wr,
  _t,
  dn = se(() => {
    'use strict';
    c();
    m();
    p();
    d();
    f();
    l();
    ((Ne = 1e9),
      (Xo = {
        precision: 20,
        rounding: 4,
        toExpNeg: -7,
        toExpPos: 21,
        LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286',
      }),
      (U = !0),
      (re = '[DecimalError] '),
      (Oe = re + 'Invalid argument: '),
      (br = re + 'Exponent out of range: '),
      (Ue = Math.floor),
      (Se = Math.pow),
      (Zo = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i),
      (Q = 1e7),
      (N = 7),
      (ln = 9007199254740991),
      (Lt = Ue(ln / N)),
      (R = {}));
    R.absoluteValue = R.abs = function () {
      var e = new this.constructor(this);
      return (e.s && (e.s = 1), e);
    };
    R.comparedTo = R.cmp = function (e) {
      var t,
        r,
        n,
        i,
        o = this;
      if (((e = new o.constructor(e)), o.s !== e.s)) return o.s || -e.s;
      if (o.e !== e.e) return (o.e > e.e) ^ (o.s < 0) ? 1 : -1;
      for (n = o.d.length, i = e.d.length, t = 0, r = n < i ? n : i; t < r; ++t)
        if (o.d[t] !== e.d[t]) return (o.d[t] > e.d[t]) ^ (o.s < 0) ? 1 : -1;
      return n === i ? 0 : (n > i) ^ (o.s < 0) ? 1 : -1;
    };
    R.decimalPlaces = R.dp = function () {
      var e = this,
        t = e.d.length - 1,
        r = (t - e.e) * N;
      if (((t = e.d[t]), t)) for (; t % 10 == 0; t /= 10) r--;
      return r < 0 ? 0 : r;
    };
    R.dividedBy = R.div = function (e) {
      return ye(this, new this.constructor(e));
    };
    R.dividedToIntegerBy = R.idiv = function (e) {
      var t = this,
        r = t.constructor;
      return D(ye(t, new r(e), 0, 1), r.precision);
    };
    R.equals = R.eq = function (e) {
      return !this.cmp(e);
    };
    R.exponent = function () {
      return $(this);
    };
    R.greaterThan = R.gt = function (e) {
      return this.cmp(e) > 0;
    };
    R.greaterThanOrEqualTo = R.gte = function (e) {
      return this.cmp(e) >= 0;
    };
    R.isInteger = R.isint = function () {
      return this.e > this.d.length - 2;
    };
    R.isNegative = R.isneg = function () {
      return this.s < 0;
    };
    R.isPositive = R.ispos = function () {
      return this.s > 0;
    };
    R.isZero = function () {
      return this.s === 0;
    };
    R.lessThan = R.lt = function (e) {
      return this.cmp(e) < 0;
    };
    R.lessThanOrEqualTo = R.lte = function (e) {
      return this.cmp(e) < 1;
    };
    R.logarithm = R.log = function (e) {
      var t,
        r = this,
        n = r.constructor,
        i = n.precision,
        o = i + 5;
      if (e === void 0) e = new n(10);
      else if (((e = new n(e)), e.s < 1 || e.eq(Z))) throw Error(re + 'NaN');
      if (r.s < 1) throw Error(re + (r.s ? 'NaN' : '-Infinity'));
      return r.eq(Z) ? new n(0) : ((U = !1), (t = ye(it(r, o), it(e, o), o)), (U = !0), D(t, i));
    };
    R.minus = R.sub = function (e) {
      var t = this;
      return ((e = new t.constructor(e)), t.s == e.s ? mn(t, e) : un(t, ((e.s = -e.s), e)));
    };
    R.modulo = R.mod = function (e) {
      var t,
        r = this,
        n = r.constructor,
        i = n.precision;
      if (((e = new n(e)), !e.s)) throw Error(re + 'NaN');
      return r.s ? ((U = !1), (t = ye(r, e, 0, 1).times(e)), (U = !0), r.minus(t)) : D(new n(r), i);
    };
    R.naturalExponential = R.exp = function () {
      return cn(this);
    };
    R.naturalLogarithm = R.ln = function () {
      return it(this);
    };
    R.negated = R.neg = function () {
      var e = new this.constructor(this);
      return ((e.s = -e.s || 0), e);
    };
    R.plus = R.add = function (e) {
      var t = this;
      return ((e = new t.constructor(e)), t.s == e.s ? un(t, e) : mn(t, ((e.s = -e.s), e)));
    };
    R.precision = R.sd = function (e) {
      var t,
        r,
        n,
        i = this;
      if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(Oe + e);
      if (((t = $(i) + 1), (n = i.d.length - 1), (r = n * N + 1), (n = i.d[n]), n)) {
        for (; n % 10 == 0; n /= 10) r--;
        for (n = i.d[0]; n >= 10; n /= 10) r++;
      }
      return e && t > r ? t : r;
    };
    R.squareRoot = R.sqrt = function () {
      var e,
        t,
        r,
        n,
        i,
        o,
        s,
        a = this,
        u = a.constructor;
      if (a.s < 1) {
        if (!a.s) return new u(0);
        throw Error(re + 'NaN');
      }
      for (
        e = $(a),
          U = !1,
          i = Math.sqrt(+a),
          i == 0 || i == 1 / 0
            ? ((t = ae(a.d)),
              (t.length + e) % 2 == 0 && (t += '0'),
              (i = Math.sqrt(t)),
              (e = Ue((e + 1) / 2) - (e < 0 || e % 2)),
              i == 1 / 0
                ? (t = '5e' + e)
                : ((t = i.toExponential()), (t = t.slice(0, t.indexOf('e') + 1) + e)),
              (n = new u(t)))
            : (n = new u(i.toString())),
          r = u.precision,
          i = s = r + 3;
        ;

      )
        if (
          ((o = n),
          (n = o.plus(ye(a, o, s + 2)).times(0.5)),
          ae(o.d).slice(0, s) === (t = ae(n.d)).slice(0, s))
        ) {
          if (((t = t.slice(s - 3, s + 1)), i == s && t == '4999')) {
            if ((D(o, r + 1, 0), o.times(o).eq(a))) {
              n = o;
              break;
            }
          } else if (t != '9999') break;
          s += 4;
        }
      return ((U = !0), D(n, r));
    };
    R.times = R.mul = function (e) {
      var t,
        r,
        n,
        i,
        o,
        s,
        a,
        u,
        g,
        T = this,
        C = T.constructor,
        O = T.d,
        A = (e = new C(e)).d;
      if (!T.s || !e.s) return new C(0);
      for (
        e.s *= T.s,
          r = T.e + e.e,
          u = O.length,
          g = A.length,
          u < g && ((o = O), (O = A), (A = o), (s = u), (u = g), (g = s)),
          o = [],
          s = u + g,
          n = s;
        n--;

      )
        o.push(0);
      for (n = g; --n >= 0; ) {
        for (t = 0, i = u + n; i > n; )
          ((a = o[i] + A[n] * O[i - n - 1] + t), (o[i--] = a % Q | 0), (t = (a / Q) | 0));
        o[i] = (o[i] + t) % Q | 0;
      }
      for (; !o[--s]; ) o.pop();
      return (t ? ++r : o.shift(), (e.d = o), (e.e = r), U ? D(e, C.precision) : e);
    };
    R.toDecimalPlaces = R.todp = function (e, t) {
      var r = this,
        n = r.constructor;
      return (
        (r = new n(r)),
        e === void 0
          ? r
          : (le(e, 0, Ne), t === void 0 ? (t = n.rounding) : le(t, 0, 8), D(r, e + $(r) + 1, t))
      );
    };
    R.toExponential = function (e, t) {
      var r,
        n = this,
        i = n.constructor;
      return (
        e === void 0
          ? (r = ke(n, !0))
          : (le(e, 0, Ne),
            t === void 0 ? (t = i.rounding) : le(t, 0, 8),
            (n = D(new i(n), e + 1, t)),
            (r = ke(n, !0, e + 1))),
        r
      );
    };
    R.toFixed = function (e, t) {
      var r,
        n,
        i = this,
        o = i.constructor;
      return e === void 0
        ? ke(i)
        : (le(e, 0, Ne),
          t === void 0 ? (t = o.rounding) : le(t, 0, 8),
          (n = D(new o(i), e + $(i) + 1, t)),
          (r = ke(n.abs(), !1, e + $(n) + 1)),
          i.isneg() && !i.isZero() ? '-' + r : r);
    };
    R.toInteger = R.toint = function () {
      var e = this,
        t = e.constructor;
      return D(new t(e), $(e) + 1, t.rounding);
    };
    R.toNumber = function () {
      return +this;
    };
    R.toPower = R.pow = function (e) {
      var t,
        r,
        n,
        i,
        o,
        s,
        a = this,
        u = a.constructor,
        g = 12,
        T = +(e = new u(e));
      if (!e.s) return new u(Z);
      if (((a = new u(a)), !a.s)) {
        if (e.s < 1) throw Error(re + 'Infinity');
        return a;
      }
      if (a.eq(Z)) return a;
      if (((n = u.precision), e.eq(Z))) return D(a, n);
      if (((t = e.e), (r = e.d.length - 1), (s = t >= r), (o = a.s), s)) {
        if ((r = T < 0 ? -T : T) <= ln) {
          for (
            i = new u(Z), t = Math.ceil(n / N + 4), U = !1;
            r % 2 && ((i = i.times(a)), an(i.d, t)), (r = Ue(r / 2)), r !== 0;

          )
            ((a = a.times(a)), an(a.d, t));
          return ((U = !0), e.s < 0 ? new u(Z).div(i) : D(i, n));
        }
      } else if (o < 0) throw Error(re + 'NaN');
      return (
        (o = o < 0 && e.d[Math.max(t, r)] & 1 ? -1 : 1),
        (a.s = 1),
        (U = !1),
        (i = e.times(it(a, n + g))),
        (U = !0),
        (i = cn(i)),
        (i.s = o),
        i
      );
    };
    R.toPrecision = function (e, t) {
      var r,
        n,
        i = this,
        o = i.constructor;
      return (
        e === void 0
          ? ((r = $(i)), (n = ke(i, r <= o.toExpNeg || r >= o.toExpPos)))
          : (le(e, 1, Ne),
            t === void 0 ? (t = o.rounding) : le(t, 0, 8),
            (i = D(new o(i), e, t)),
            (r = $(i)),
            (n = ke(i, e <= r || r <= o.toExpNeg, e))),
        n
      );
    };
    R.toSignificantDigits = R.tosd = function (e, t) {
      var r = this,
        n = r.constructor;
      return (
        e === void 0
          ? ((e = n.precision), (t = n.rounding))
          : (le(e, 1, Ne), t === void 0 ? (t = n.rounding) : le(t, 0, 8)),
        D(new n(r), e, t)
      );
    };
    R.toString =
      R.valueOf =
      R.val =
      R.toJSON =
      R[Symbol.for('nodejs.util.inspect.custom')] =
        function () {
          var e = this,
            t = $(e),
            r = e.constructor;
          return ke(e, t <= r.toExpNeg || t >= r.toExpPos);
        };
    ye = (function () {
      function e(n, i) {
        var o,
          s = 0,
          a = n.length;
        for (n = n.slice(); a--; ) ((o = n[a] * i + s), (n[a] = o % Q | 0), (s = (o / Q) | 0));
        return (s && n.unshift(s), n);
      }
      function t(n, i, o, s) {
        var a, u;
        if (o != s) u = o > s ? 1 : -1;
        else
          for (a = u = 0; a < o; a++)
            if (n[a] != i[a]) {
              u = n[a] > i[a] ? 1 : -1;
              break;
            }
        return u;
      }
      function r(n, i, o) {
        for (var s = 0; o--; )
          ((n[o] -= s), (s = n[o] < i[o] ? 1 : 0), (n[o] = s * Q + n[o] - i[o]));
        for (; !n[0] && n.length > 1; ) n.shift();
      }
      return function (n, i, o, s) {
        var a,
          u,
          g,
          T,
          C,
          O,
          A,
          M,
          S,
          I,
          ne,
          z,
          _e,
          k,
          Ae,
          fr,
          ie,
          St,
          Ot = n.constructor,
          No = n.s == i.s ? 1 : -1,
          oe = n.d,
          q = i.d;
        if (!n.s) return new Ot(n);
        if (!i.s) throw Error(re + 'Division by zero');
        for (
          u = n.e - i.e, ie = q.length, Ae = oe.length, A = new Ot(No), M = A.d = [], g = 0;
          q[g] == (oe[g] || 0);

        )
          ++g;
        if (
          (q[g] > (oe[g] || 0) && --u,
          o == null ? (z = o = Ot.precision) : s ? (z = o + ($(n) - $(i)) + 1) : (z = o),
          z < 0)
        )
          return new Ot(0);
        if (((z = (z / N + 2) | 0), (g = 0), ie == 1))
          for (T = 0, q = q[0], z++; (g < Ae || T) && z--; g++)
            ((_e = T * Q + (oe[g] || 0)), (M[g] = (_e / q) | 0), (T = _e % q | 0));
        else {
          for (
            T = (Q / (q[0] + 1)) | 0,
              T > 1 && ((q = e(q, T)), (oe = e(oe, T)), (ie = q.length), (Ae = oe.length)),
              k = ie,
              S = oe.slice(0, ie),
              I = S.length;
            I < ie;

          )
            S[I++] = 0;
          ((St = q.slice()), St.unshift(0), (fr = q[0]), q[1] >= Q / 2 && ++fr);
          do
            ((T = 0),
              (a = t(q, S, ie, I)),
              a < 0
                ? ((ne = S[0]),
                  ie != I && (ne = ne * Q + (S[1] || 0)),
                  (T = (ne / fr) | 0),
                  T > 1
                    ? (T >= Q && (T = Q - 1),
                      (C = e(q, T)),
                      (O = C.length),
                      (I = S.length),
                      (a = t(C, S, O, I)),
                      a == 1 && (T--, r(C, ie < O ? St : q, O)))
                    : (T == 0 && (a = T = 1), (C = q.slice())),
                  (O = C.length),
                  O < I && C.unshift(0),
                  r(S, C, I),
                  a == -1 &&
                    ((I = S.length),
                    (a = t(q, S, ie, I)),
                    a < 1 && (T++, r(S, ie < I ? St : q, I))),
                  (I = S.length))
                : a === 0 && (T++, (S = [0])),
              (M[g++] = T),
              a && S[0] ? (S[I++] = oe[k] || 0) : ((S = [oe[k]]), (I = 1)));
          while ((k++ < Ae || S[0] !== void 0) && z--);
        }
        return (M[0] || M.shift(), (A.e = u), D(A, s ? o + $(A) + 1 : o));
      };
    })();
    wr = pn(Xo);
    Z = new wr(1);
    _t = wr;
  });
var v,
  ue,
  l = se(() => {
    'use strict';
    dn();
    ((v = class extends _t {
      static isDecimal(t) {
        return t instanceof _t;
      }
      static random(t = 20) {
        {
          let n = crypto.getRandomValues(new Uint8Array(t)).reduce((i, o) => i + o, '');
          return new _t(`0.${n.slice(0, t)}`);
        }
      }
    }),
      (ue = v));
  });
function ts() {
  return !1;
}
var rs,
  ns,
  yn,
  bn = se(() => {
    'use strict';
    c();
    m();
    p();
    d();
    f();
    l();
    ((rs = {}), (ns = { existsSync: ts, promises: rs }), (yn = ns));
  });
function us(...e) {
  return e.join('/');
}
function cs(...e) {
  return e.join('/');
}
var In,
  ms,
  ps,
  st,
  Ln = se(() => {
    'use strict';
    c();
    m();
    p();
    d();
    f();
    l();
    ((In = '/'),
      (ms = { sep: In }),
      (ps = { resolve: us, posix: ms, join: cs, sep: In }),
      (st = ps));
  });
var Ut,
  Dn = se(() => {
    'use strict';
    c();
    m();
    p();
    d();
    f();
    l();
    Ut = class {
      constructor() {
        this.events = {};
      }
      on(t, r) {
        return (this.events[t] || (this.events[t] = []), this.events[t].push(r), this);
      }
      emit(t, ...r) {
        return this.events[t]
          ? (this.events[t].forEach(n => {
              n(...r);
            }),
            !0)
          : !1;
      }
    };
  });
var Nn = De((Wc, Fn) => {
  'use strict';
  c();
  m();
  p();
  d();
  f();
  l();
  Fn.exports = (e, t = 1, r) => {
    if (((r = { indent: ' ', includeEmptyLines: !1, ...r }), typeof e != 'string'))
      throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e}\``);
    if (typeof t != 'number')
      throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof t}\``);
    if (typeof r.indent != 'string')
      throw new TypeError(
        `Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``
      );
    if (t === 0) return e;
    let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
    return e.replace(n, r.indent.repeat(t));
  };
});
var Bn = De((am, qn) => {
  'use strict';
  c();
  m();
  p();
  d();
  f();
  l();
  qn.exports = ({ onlyFirst: e = !1 } = {}) => {
    let t = [
      '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
      '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
    ].join('|');
    return new RegExp(t, e ? void 0 : 'g');
  };
});
var Vn = De((fm, $n) => {
  'use strict';
  c();
  m();
  p();
  d();
  f();
  l();
  var bs = Bn();
  $n.exports = e => (typeof e == 'string' ? e.replace(bs(), '') : e);
});
var kr = De((Mf, Jn) => {
  'use strict';
  c();
  m();
  p();
  d();
  f();
  l();
  Jn.exports = (function () {
    function e(t, r, n, i, o) {
      return t < r || n < r ? (t > n ? n + 1 : t + 1) : i === o ? r : r + 1;
    }
    return function (t, r) {
      if (t === r) return 0;
      if (t.length > r.length) {
        var n = t;
        ((t = r), (r = n));
      }
      for (var i = t.length, o = r.length; i > 0 && t.charCodeAt(i - 1) === r.charCodeAt(o - 1); )
        (i--, o--);
      for (var s = 0; s < i && t.charCodeAt(s) === r.charCodeAt(s); ) s++;
      if (((i -= s), (o -= s), i === 0 || o < 3)) return o;
      var a = 0,
        u,
        g,
        T,
        C,
        O,
        A,
        M,
        S,
        I,
        ne,
        z,
        _e,
        k = [];
      for (u = 0; u < i; u++) (k.push(u + 1), k.push(t.charCodeAt(s + u)));
      for (var Ae = k.length - 1; a < o - 3; )
        for (
          I = r.charCodeAt(s + (g = a)),
            ne = r.charCodeAt(s + (T = a + 1)),
            z = r.charCodeAt(s + (C = a + 2)),
            _e = r.charCodeAt(s + (O = a + 3)),
            A = a += 4,
            u = 0;
          u < Ae;
          u += 2
        )
          ((M = k[u]),
            (S = k[u + 1]),
            (g = e(M, g, T, I, S)),
            (T = e(g, T, C, ne, S)),
            (C = e(T, C, O, z, S)),
            (A = e(C, O, A, _e, S)),
            (k[u] = A),
            (O = C),
            (C = T),
            (T = g),
            (g = M));
      for (; a < o; )
        for (I = r.charCodeAt(s + (g = a)), A = ++a, u = 0; u < Ae; u += 2)
          ((M = k[u]), (k[u] = A = e(M, g, A, I, k[u + 1])), (g = M));
      return A;
    };
  })();
});
var wi = De((oE, fa) => {
  fa.exports = {
    name: '@prisma/engines-version',
    version: '5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2',
    main: 'index.js',
    types: 'index.d.ts',
    license: 'Apache-2.0',
    author: 'Tim Suchanek <suchanek@prisma.io>',
    prisma: { enginesVersion: '605197351a3c8bdd595af2d2a9bc3025bca48ea2' },
    repository: {
      type: 'git',
      url: 'https://github.com/prisma/engines-wrapper.git',
      directory: 'packages/engines-version',
    },
    devDependencies: { '@types/node': '18.19.34', typescript: '4.9.5' },
    files: ['index.js', 'index.d.ts'],
    scripts: { build: 'tsc -d' },
  };
});
var Ei = De(() => {
  'use strict';
  c();
  m();
  p();
  d();
  f();
  l();
});
var ul = {};
Mt(ul, {
  Debug: () => Tr,
  Decimal: () => ue,
  Extensions: () => Er,
  MetricsClient: () => Ze,
  NotFoundError: () => we,
  PrismaClientInitializationError: () => L,
  PrismaClientKnownRequestError: () => J,
  PrismaClientRustPanicError: () => Ee,
  PrismaClientUnknownRequestError: () => G,
  PrismaClientValidationError: () => j,
  Public: () => xr,
  Sql: () => X,
  defineDmmfProperty: () => hi,
  deserializeJsonResponse: () => $e,
  dmmfToRuntimeDataModel: () => gi,
  empty: () => Pi,
  getPrismaClient: () => _o,
  getRuntime: () => Ce,
  join: () => xi,
  makeStrictEnum: () => Do,
  makeTypedQueryFactory: () => yi,
  objectEnumValues: () => Wt,
  raw: () => Vr,
  serializeJsonQuery: () => Zt,
  skip: () => Xt,
  sqltag: () => jr,
  warnEnvConflicts: () => void 0,
  warnOnce: () => ct,
});
module.exports = jo(ul);
c();
m();
p();
d();
f();
l();
var Er = {};
Mt(Er, { defineExtension: () => fn, getExtensionContext: () => gn });
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function fn(e) {
  return typeof e == 'function' ? e : t => t.$extends(e);
}
c();
m();
p();
d();
f();
l();
function gn(e) {
  return e;
}
var xr = {};
Mt(xr, { validator: () => hn });
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function hn(...e) {
  return t => t;
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Pr,
  wn,
  En,
  xn,
  Pn = !0;
typeof h < 'u' &&
  (({ FORCE_COLOR: Pr, NODE_DISABLE_COLORS: wn, NO_COLOR: En, TERM: xn } = h.env || {}),
  (Pn = h.stdout && h.stdout.isTTY));
var is = { enabled: !wn && En == null && xn !== 'dumb' && ((Pr != null && Pr !== '0') || Pn) };
function F(e, t) {
  let r = new RegExp(`\\x1b\\[${t}m`, 'g'),
    n = `\x1B[${e}m`,
    i = `\x1B[${t}m`;
  return function (o) {
    return !is.enabled || o == null ? o : n + (~('' + o).indexOf(i) ? o.replace(r, i + n) : o) + i;
  };
}
var fu = F(0, 0),
  Dt = F(1, 22),
  Ft = F(2, 22),
  gu = F(3, 23),
  vn = F(4, 24),
  hu = F(7, 27),
  yu = F(8, 28),
  bu = F(9, 29),
  wu = F(30, 39),
  qe = F(31, 39),
  Tn = F(32, 39),
  Cn = F(33, 39),
  Rn = F(34, 39),
  Eu = F(35, 39),
  An = F(36, 39),
  xu = F(37, 39),
  Sn = F(90, 39),
  Pu = F(90, 39),
  vu = F(40, 49),
  Tu = F(41, 49),
  Cu = F(42, 49),
  Ru = F(43, 49),
  Au = F(44, 49),
  Su = F(45, 49),
  Ou = F(46, 49),
  ku = F(47, 49);
c();
m();
p();
d();
f();
l();
var os = 100,
  On = ['green', 'yellow', 'blue', 'magenta', 'cyan', 'red'],
  Nt = [],
  kn = Date.now(),
  ss = 0,
  vr = typeof h < 'u' ? h.env : {};
globalThis.DEBUG ??= vr.DEBUG ?? '';
globalThis.DEBUG_COLORS ??= vr.DEBUG_COLORS ? vr.DEBUG_COLORS === 'true' : !0;
var ot = {
  enable(e) {
    typeof e == 'string' && (globalThis.DEBUG = e);
  },
  disable() {
    let e = globalThis.DEBUG;
    return ((globalThis.DEBUG = ''), e);
  },
  enabled(e) {
    let t = globalThis.DEBUG.split(',').map(i => i.replace(/[.+?^${}()|[\]\\]/g, '\\$&')),
      r = t.some(i =>
        i === '' || i[0] === '-' ? !1 : e.match(RegExp(i.split('*').join('.*') + '$'))
      ),
      n = t.some(i =>
        i === '' || i[0] !== '-' ? !1 : e.match(RegExp(i.slice(1).split('*').join('.*') + '$'))
      );
    return r && !n;
  },
  log: (...e) => {
    let [t, r, ...n] = e;
    (console.warn ?? console.log)(`${t} ${r}`, ...n);
  },
  formatters: {},
};
function as(e) {
  let t = {
      color: On[ss++ % On.length],
      enabled: ot.enabled(e),
      namespace: e,
      log: ot.log,
      extend: () => {},
    },
    r = (...n) => {
      let { enabled: i, namespace: o, color: s, log: a } = t;
      if (
        (n.length !== 0 && Nt.push([o, ...n]), Nt.length > os && Nt.shift(), ot.enabled(o) || i)
      ) {
        let u = n.map(T => (typeof T == 'string' ? T : ls(T))),
          g = `+${Date.now() - kn}ms`;
        ((kn = Date.now()), a(o, ...u, g));
      }
    };
  return new Proxy(r, { get: (n, i) => t[i], set: (n, i, o) => (t[i] = o) });
}
var Tr = new Proxy(as, { get: (e, t) => ot[t], set: (e, t, r) => (ot[t] = r) });
function ls(e, t = 2) {
  let r = new Set();
  return JSON.stringify(
    e,
    (n, i) => {
      if (typeof i == 'object' && i !== null) {
        if (r.has(i)) return '[Circular *]';
        r.add(i);
      } else if (typeof i == 'bigint') return i.toString();
      return i;
    },
    t
  );
}
function Mn() {
  Nt.length = 0;
}
var ee = Tr;
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Cr = [
  'darwin',
  'darwin-arm64',
  'debian-openssl-1.0.x',
  'debian-openssl-1.1.x',
  'debian-openssl-3.0.x',
  'rhel-openssl-1.0.x',
  'rhel-openssl-1.1.x',
  'rhel-openssl-3.0.x',
  'linux-arm64-openssl-1.1.x',
  'linux-arm64-openssl-1.0.x',
  'linux-arm64-openssl-3.0.x',
  'linux-arm-openssl-1.1.x',
  'linux-arm-openssl-1.0.x',
  'linux-arm-openssl-3.0.x',
  'linux-musl',
  'linux-musl-openssl-3.0.x',
  'linux-musl-arm64-openssl-1.1.x',
  'linux-musl-arm64-openssl-3.0.x',
  'linux-nixos',
  'linux-static-x64',
  'linux-static-arm64',
  'windows',
  'freebsd11',
  'freebsd12',
  'freebsd13',
  'freebsd14',
  'freebsd15',
  'openbsd',
  'netbsd',
  'arm',
];
c();
m();
p();
d();
f();
l();
var _n = 'library';
function at(e) {
  let t = ds();
  return (
    t ||
    (e?.config.engineType === 'library'
      ? 'library'
      : e?.config.engineType === 'binary'
        ? 'binary'
        : _n)
  );
}
function ds() {
  let e = h.env.PRISMA_CLIENT_ENGINE_TYPE;
  return e === 'library' ? 'library' : e === 'binary' ? 'binary' : void 0;
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Me;
(t => {
  let e;
  (k => (
    (k.findUnique = 'findUnique'),
    (k.findUniqueOrThrow = 'findUniqueOrThrow'),
    (k.findFirst = 'findFirst'),
    (k.findFirstOrThrow = 'findFirstOrThrow'),
    (k.findMany = 'findMany'),
    (k.create = 'create'),
    (k.createMany = 'createMany'),
    (k.createManyAndReturn = 'createManyAndReturn'),
    (k.update = 'update'),
    (k.updateMany = 'updateMany'),
    (k.upsert = 'upsert'),
    (k.delete = 'delete'),
    (k.deleteMany = 'deleteMany'),
    (k.groupBy = 'groupBy'),
    (k.count = 'count'),
    (k.aggregate = 'aggregate'),
    (k.findRaw = 'findRaw'),
    (k.aggregateRaw = 'aggregateRaw')
  ))((e = t.ModelAction ||= {}));
})((Me ||= {}));
var ut = {};
Mt(ut, {
  error: () => hs,
  info: () => gs,
  log: () => fs,
  query: () => ys,
  should: () => Un,
  tags: () => lt,
  warn: () => Rr,
});
c();
m();
p();
d();
f();
l();
var lt = {
    error: qe('prisma:error'),
    warn: Cn('prisma:warn'),
    info: An('prisma:info'),
    query: Rn('prisma:query'),
  },
  Un = { warn: () => !h.env.PRISMA_DISABLE_WARNINGS };
function fs(...e) {
  console.log(...e);
}
function Rr(e, ...t) {
  Un.warn() && console.warn(`${lt.warn} ${e}`, ...t);
}
function gs(e, ...t) {
  console.info(`${lt.info} ${e}`, ...t);
}
function hs(e, ...t) {
  console.error(`${lt.error} ${e}`, ...t);
}
function ys(e, ...t) {
  console.log(`${lt.query} ${e}`, ...t);
}
c();
m();
p();
d();
f();
l();
function qt(e, t) {
  if (!e)
    throw new Error(
      `${t}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`
    );
}
c();
m();
p();
d();
f();
l();
function be(e, t) {
  throw new Error(t);
}
c();
m();
p();
d();
f();
l();
function Ar(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
c();
m();
p();
d();
f();
l();
var Sr = (e, t) => e.reduce((r, n) => ((r[t(n)] = n), r), {});
c();
m();
p();
d();
f();
l();
function Be(e, t) {
  let r = {};
  for (let n of Object.keys(e)) r[n] = t(e[n], n);
  return r;
}
c();
m();
p();
d();
f();
l();
function Or(e, t) {
  if (e.length === 0) return;
  let r = e[0];
  for (let n = 1; n < e.length; n++) t(r, e[n]) < 0 && (r = e[n]);
  return r;
}
c();
m();
p();
d();
f();
l();
function K(e, t) {
  Object.defineProperty(e, 'name', { value: t, configurable: !0 });
}
c();
m();
p();
d();
f();
l();
var jn = new Set(),
  ct = (e, t, ...r) => {
    jn.has(e) || (jn.add(e), Rr(t, ...r));
  };
c();
m();
p();
d();
f();
l();
var J = class extends Error {
  constructor(t, { code: r, clientVersion: n, meta: i, batchRequestIdx: o }) {
    (super(t),
      (this.name = 'PrismaClientKnownRequestError'),
      (this.code = r),
      (this.clientVersion = n),
      (this.meta = i),
      Object.defineProperty(this, 'batchRequestIdx', { value: o, enumerable: !1, writable: !0 }));
  }
  get [Symbol.toStringTag]() {
    return 'PrismaClientKnownRequestError';
  }
};
K(J, 'PrismaClientKnownRequestError');
var we = class extends J {
  constructor(t, r) {
    (super(t, { code: 'P2025', clientVersion: r }), (this.name = 'NotFoundError'));
  }
};
K(we, 'NotFoundError');
c();
m();
p();
d();
f();
l();
var L = class e extends Error {
  constructor(t, r, n) {
    (super(t),
      (this.name = 'PrismaClientInitializationError'),
      (this.clientVersion = r),
      (this.errorCode = n),
      Error.captureStackTrace(e));
  }
  get [Symbol.toStringTag]() {
    return 'PrismaClientInitializationError';
  }
};
K(L, 'PrismaClientInitializationError');
c();
m();
p();
d();
f();
l();
var Ee = class extends Error {
  constructor(t, r) {
    (super(t), (this.name = 'PrismaClientRustPanicError'), (this.clientVersion = r));
  }
  get [Symbol.toStringTag]() {
    return 'PrismaClientRustPanicError';
  }
};
K(Ee, 'PrismaClientRustPanicError');
c();
m();
p();
d();
f();
l();
var G = class extends Error {
  constructor(t, { clientVersion: r, batchRequestIdx: n }) {
    (super(t),
      (this.name = 'PrismaClientUnknownRequestError'),
      (this.clientVersion = r),
      Object.defineProperty(this, 'batchRequestIdx', { value: n, writable: !0, enumerable: !1 }));
  }
  get [Symbol.toStringTag]() {
    return 'PrismaClientUnknownRequestError';
  }
};
K(G, 'PrismaClientUnknownRequestError');
c();
m();
p();
d();
f();
l();
var j = class extends Error {
  constructor(r, { clientVersion: n }) {
    super(r);
    this.name = 'PrismaClientValidationError';
    this.clientVersion = n;
  }
  get [Symbol.toStringTag]() {
    return 'PrismaClientValidationError';
  }
};
K(j, 'PrismaClientValidationError');
c();
m();
p();
d();
f();
l();
l();
function $e(e) {
  return e === null
    ? e
    : Array.isArray(e)
      ? e.map($e)
      : typeof e == 'object'
        ? ws(e)
          ? Es(e)
          : Be(e, $e)
        : e;
}
function ws(e) {
  return e !== null && typeof e == 'object' && typeof e.$type == 'string';
}
function Es({ $type: e, value: t }) {
  switch (e) {
    case 'BigInt':
      return BigInt(t);
    case 'Bytes':
      return b.from(t, 'base64');
    case 'DateTime':
      return new Date(t);
    case 'Decimal':
      return new ue(t);
    case 'Json':
      return JSON.parse(t);
    default:
      be(t, 'Unknown tagged value');
  }
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function Ve(e) {
  return e.substring(0, 1).toLowerCase() + e.substring(1);
}
c();
m();
p();
d();
f();
l();
function je(e) {
  return e instanceof Date || Object.prototype.toString.call(e) === '[object Date]';
}
function Bt(e) {
  return e.toString() !== 'Invalid Date';
}
c();
m();
p();
d();
f();
l();
l();
function Qe(e) {
  return v.isDecimal(e)
    ? !0
    : e !== null &&
        typeof e == 'object' &&
        typeof e.s == 'number' &&
        typeof e.e == 'number' &&
        typeof e.toFixed == 'function' &&
        Array.isArray(e.d);
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var xs = Fe(Nn());
var Ps = {
    red: qe,
    gray: Sn,
    dim: Ft,
    bold: Dt,
    underline: vn,
    highlightSource: e => e.highlight(),
  },
  vs = {
    red: e => e,
    gray: e => e,
    dim: e => e,
    bold: e => e,
    underline: e => e,
    highlightSource: e => e,
  };
function Ts({ message: e, originalMethod: t, isPanic: r, callArguments: n }) {
  return { functionName: `prisma.${t}()`, message: e, isPanic: r ?? !1, callArguments: n };
}
function Cs(
  { functionName: e, location: t, message: r, isPanic: n, contextLines: i, callArguments: o },
  s
) {
  let a = [''],
    u = t ? ' in' : ':';
  if (
    (n
      ? (a.push(
          s.red(
            `Oops, an unknown error occurred! This is ${s.bold('on us')}, you did nothing wrong.`
          )
        ),
        a.push(s.red(`It occurred in the ${s.bold(`\`${e}\``)} invocation${u}`)))
      : a.push(s.red(`Invalid ${s.bold(`\`${e}\``)} invocation${u}`)),
    t && a.push(s.underline(Rs(t))),
    i)
  ) {
    a.push('');
    let g = [i.toString()];
    (o && (g.push(o), g.push(s.dim(')'))), a.push(g.join('')), o && a.push(''));
  } else (a.push(''), o && a.push(o), a.push(''));
  return (
    a.push(r),
    a.join(`
`)
  );
}
function Rs(e) {
  let t = [e.fileName];
  return (
    e.lineNumber && t.push(String(e.lineNumber)),
    e.columnNumber && t.push(String(e.columnNumber)),
    t.join(':')
  );
}
function Je(e) {
  let t = e.showColors ? Ps : vs,
    r;
  return (
    typeof $getTemplateParameters < 'u' ? (r = $getTemplateParameters(e, t)) : (r = Ts(e)),
    Cs(r, t)
  );
}
c();
m();
p();
d();
f();
l();
var Yn = Fe(kr());
c();
m();
p();
d();
f();
l();
function Kn(e, t, r) {
  let n = Hn(e),
    i = As(n),
    o = Os(i);
  o ? $t(o, t, r) : t.addErrorMessage(() => 'Unknown error');
}
function Hn(e) {
  return e.errors.flatMap(t => (t.kind === 'Union' ? Hn(t) : [t]));
}
function As(e) {
  let t = new Map(),
    r = [];
  for (let n of e) {
    if (n.kind !== 'InvalidArgumentType') {
      r.push(n);
      continue;
    }
    let i = `${n.selectionPath.join('.')}:${n.argumentPath.join('.')}`,
      o = t.get(i);
    o
      ? t.set(i, {
          ...n,
          argument: { ...n.argument, typeNames: Ss(o.argument.typeNames, n.argument.typeNames) },
        })
      : t.set(i, n);
  }
  return (r.push(...t.values()), r);
}
function Ss(e, t) {
  return [...new Set(e.concat(t))];
}
function Os(e) {
  return Or(e, (t, r) => {
    let n = Gn(t),
      i = Gn(r);
    return n !== i ? n - i : Wn(t) - Wn(r);
  });
}
function Gn(e) {
  let t = 0;
  return (
    Array.isArray(e.selectionPath) && (t += e.selectionPath.length),
    Array.isArray(e.argumentPath) && (t += e.argumentPath.length),
    t
  );
}
function Wn(e) {
  switch (e.kind) {
    case 'InvalidArgumentValue':
    case 'ValueTooLarge':
      return 20;
    case 'InvalidArgumentType':
      return 10;
    case 'RequiredArgumentMissing':
      return -10;
    default:
      return 0;
  }
}
c();
m();
p();
d();
f();
l();
var te = class {
  constructor(t, r) {
    this.name = t;
    this.value = r;
    this.isRequired = !1;
  }
  makeRequired() {
    return ((this.isRequired = !0), this);
  }
  write(t) {
    let {
      colors: { green: r },
    } = t.context;
    (t.addMarginSymbol(r(this.isRequired ? '+' : '?')),
      t.write(r(this.name)),
      this.isRequired || t.write(r('?')),
      t.write(r(': ')),
      typeof this.value == 'string' ? t.write(r(this.value)) : t.write(this.value));
  }
};
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Ge = class {
  constructor(t = 0, r) {
    this.context = r;
    this.lines = [];
    this.currentLine = '';
    this.currentIndent = 0;
    this.currentIndent = t;
  }
  write(t) {
    return (typeof t == 'string' ? (this.currentLine += t) : t.write(this), this);
  }
  writeJoined(t, r, n = (i, o) => o.write(i)) {
    let i = r.length - 1;
    for (let o = 0; o < r.length; o++) (n(r[o], this), o !== i && this.write(t));
    return this;
  }
  writeLine(t) {
    return this.write(t).newLine();
  }
  newLine() {
    (this.lines.push(this.indentedCurrentLine()),
      (this.currentLine = ''),
      (this.marginSymbol = void 0));
    let t = this.afterNextNewLineCallback;
    return ((this.afterNextNewLineCallback = void 0), t?.(), this);
  }
  withIndent(t) {
    return (this.indent(), t(this), this.unindent(), this);
  }
  afterNextNewline(t) {
    return ((this.afterNextNewLineCallback = t), this);
  }
  indent() {
    return (this.currentIndent++, this);
  }
  unindent() {
    return (this.currentIndent > 0 && this.currentIndent--, this);
  }
  addMarginSymbol(t) {
    return ((this.marginSymbol = t), this);
  }
  toString() {
    return this.lines.concat(this.indentedCurrentLine()).join(`
`);
  }
  getCurrentLineLength() {
    return this.currentLine.length;
  }
  indentedCurrentLine() {
    let t = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
    return this.marginSymbol ? this.marginSymbol + t.slice(1) : t;
  }
};
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Vt = class {
  constructor(t) {
    this.value = t;
  }
  write(t) {
    t.write(this.value);
  }
  markAsError() {
    this.value.markAsError();
  }
};
c();
m();
p();
d();
f();
l();
var jt = e => e,
  Qt = { bold: jt, red: jt, green: jt, dim: jt, enabled: !1 },
  zn = { bold: Dt, red: qe, green: Tn, dim: Ft, enabled: !0 },
  We = {
    write(e) {
      e.writeLine(',');
    },
  };
c();
m();
p();
d();
f();
l();
var ce = class {
  constructor(t) {
    this.contents = t;
    this.isUnderlined = !1;
    this.color = t => t;
  }
  underline() {
    return ((this.isUnderlined = !0), this);
  }
  setColor(t) {
    return ((this.color = t), this);
  }
  write(t) {
    let r = t.getCurrentLineLength();
    (t.write(this.color(this.contents)),
      this.isUnderlined &&
        t.afterNextNewline(() => {
          t.write(' '.repeat(r)).writeLine(this.color('~'.repeat(this.contents.length)));
        }));
  }
};
c();
m();
p();
d();
f();
l();
var ve = class {
  constructor() {
    this.hasError = !1;
  }
  markAsError() {
    return ((this.hasError = !0), this);
  }
};
var Ke = class extends ve {
  constructor() {
    super(...arguments);
    this.items = [];
  }
  addItem(r) {
    return (this.items.push(new Vt(r)), this);
  }
  getField(r) {
    return this.items[r];
  }
  getPrintWidth() {
    return this.items.length === 0
      ? 2
      : Math.max(...this.items.map(n => n.value.getPrintWidth())) + 2;
  }
  write(r) {
    if (this.items.length === 0) {
      this.writeEmpty(r);
      return;
    }
    this.writeWithItems(r);
  }
  writeEmpty(r) {
    let n = new ce('[]');
    (this.hasError && n.setColor(r.context.colors.red).underline(), r.write(n));
  }
  writeWithItems(r) {
    let { colors: n } = r.context;
    (r
      .writeLine('[')
      .withIndent(() => r.writeJoined(We, this.items).newLine())
      .write(']'),
      this.hasError &&
        r.afterNextNewline(() => {
          r.writeLine(n.red('~'.repeat(this.getPrintWidth())));
        }));
  }
  asObject() {}
};
var He = class e extends ve {
  constructor() {
    super(...arguments);
    this.fields = {};
    this.suggestions = [];
  }
  addField(r) {
    this.fields[r.name] = r;
  }
  addSuggestion(r) {
    this.suggestions.push(r);
  }
  getField(r) {
    return this.fields[r];
  }
  getDeepField(r) {
    let [n, ...i] = r,
      o = this.getField(n);
    if (!o) return;
    let s = o;
    for (let a of i) {
      let u;
      if (
        (s.value instanceof e
          ? (u = s.value.getField(a))
          : s.value instanceof Ke && (u = s.value.getField(Number(a))),
        !u)
      )
        return;
      s = u;
    }
    return s;
  }
  getDeepFieldValue(r) {
    return r.length === 0 ? this : this.getDeepField(r)?.value;
  }
  hasField(r) {
    return !!this.getField(r);
  }
  removeAllFields() {
    this.fields = {};
  }
  removeField(r) {
    delete this.fields[r];
  }
  getFields() {
    return this.fields;
  }
  isEmpty() {
    return Object.keys(this.fields).length === 0;
  }
  getFieldValue(r) {
    return this.getField(r)?.value;
  }
  getDeepSubSelectionValue(r) {
    let n = this;
    for (let i of r) {
      if (!(n instanceof e)) return;
      let o = n.getSubSelectionValue(i);
      if (!o) return;
      n = o;
    }
    return n;
  }
  getDeepSelectionParent(r) {
    let n = this.getSelectionParent();
    if (!n) return;
    let i = n;
    for (let o of r) {
      let s = i.value.getFieldValue(o);
      if (!s || !(s instanceof e)) return;
      let a = s.getSelectionParent();
      if (!a) return;
      i = a;
    }
    return i;
  }
  getSelectionParent() {
    let r = this.getField('select')?.value.asObject();
    if (r) return { kind: 'select', value: r };
    let n = this.getField('include')?.value.asObject();
    if (n) return { kind: 'include', value: n };
  }
  getSubSelectionValue(r) {
    return this.getSelectionParent()?.value.fields[r].value;
  }
  getPrintWidth() {
    let r = Object.values(this.fields);
    return r.length == 0 ? 2 : Math.max(...r.map(i => i.getPrintWidth())) + 2;
  }
  write(r) {
    let n = Object.values(this.fields);
    if (n.length === 0 && this.suggestions.length === 0) {
      this.writeEmpty(r);
      return;
    }
    this.writeWithContents(r, n);
  }
  asObject() {
    return this;
  }
  writeEmpty(r) {
    let n = new ce('{}');
    (this.hasError && n.setColor(r.context.colors.red).underline(), r.write(n));
  }
  writeWithContents(r, n) {
    (r.writeLine('{').withIndent(() => {
      r.writeJoined(We, [...n, ...this.suggestions]).newLine();
    }),
      r.write('}'),
      this.hasError &&
        r.afterNextNewline(() => {
          r.writeLine(r.context.colors.red('~'.repeat(this.getPrintWidth())));
        }));
  }
};
c();
m();
p();
d();
f();
l();
var W = class extends ve {
  constructor(r) {
    super();
    this.text = r;
  }
  getPrintWidth() {
    return this.text.length;
  }
  write(r) {
    let n = new ce(this.text);
    (this.hasError && n.underline().setColor(r.context.colors.red), r.write(n));
  }
  asObject() {}
};
c();
m();
p();
d();
f();
l();
var mt = class {
  constructor() {
    this.fields = [];
  }
  addField(t, r) {
    return (
      this.fields.push({
        write(n) {
          let { green: i, dim: o } = n.context.colors;
          n.write(i(o(`${t}: ${r}`))).addMarginSymbol(i(o('+')));
        },
      }),
      this
    );
  }
  write(t) {
    let {
      colors: { green: r },
    } = t.context;
    t.writeLine(r('{'))
      .withIndent(() => {
        t.writeJoined(We, this.fields).newLine();
      })
      .write(r('}'))
      .addMarginSymbol(r('+'));
  }
};
function $t(e, t, r) {
  switch (e.kind) {
    case 'MutuallyExclusiveFields':
      Ms(e, t);
      break;
    case 'IncludeOnScalar':
      Is(e, t);
      break;
    case 'EmptySelection':
      Ls(e, t, r);
      break;
    case 'UnknownSelectionField':
      Ns(e, t);
      break;
    case 'InvalidSelectionValue':
      Us(e, t);
      break;
    case 'UnknownArgument':
      qs(e, t);
      break;
    case 'UnknownInputField':
      Bs(e, t);
      break;
    case 'RequiredArgumentMissing':
      $s(e, t);
      break;
    case 'InvalidArgumentType':
      Vs(e, t);
      break;
    case 'InvalidArgumentValue':
      js(e, t);
      break;
    case 'ValueTooLarge':
      Qs(e, t);
      break;
    case 'SomeFieldsMissing':
      Js(e, t);
      break;
    case 'TooManyFieldsGiven':
      Gs(e, t);
      break;
    case 'Union':
      Kn(e, t, r);
      break;
    default:
      throw new Error('not implemented: ' + e.kind);
  }
}
function Ms(e, t) {
  let r = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  (r && (r.getField(e.firstField)?.markAsError(), r.getField(e.secondField)?.markAsError()),
    t.addErrorMessage(
      n =>
        `Please ${n.bold('either')} use ${n.green(`\`${e.firstField}\``)} or ${n.green(`\`${e.secondField}\``)}, but ${n.red('not both')} at the same time.`
    ));
}
function Is(e, t) {
  let [r, n] = pt(e.selectionPath),
    i = e.outputType,
    o = t.arguments.getDeepSelectionParent(r)?.value;
  if (o && (o.getField(n)?.markAsError(), i))
    for (let s of i.fields) s.isRelation && o.addSuggestion(new te(s.name, 'true'));
  t.addErrorMessage(s => {
    let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold('include')} statement`;
    return (
      i ? (a += ` on model ${s.bold(i.name)}. ${dt(s)}`) : (a += '.'),
      (a += `
Note that ${s.bold('include')} statements only accept relation fields.`),
      a
    );
  });
}
function Ls(e, t, r) {
  let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  if (n) {
    let i = n.getField('omit')?.value.asObject();
    if (i) {
      _s(e, t, i);
      return;
    }
    if (n.hasField('select')) {
      Ds(e, t);
      return;
    }
  }
  if (r?.[Ve(e.outputType.name)]) {
    Fs(e, t);
    return;
  }
  t.addErrorMessage(() => `Unknown field at "${e.selectionPath.join('.')} selection"`);
}
function _s(e, t, r) {
  r.removeAllFields();
  for (let n of e.outputType.fields) r.addSuggestion(new te(n.name, 'false'));
  t.addErrorMessage(
    n =>
      `The ${n.red('omit')} statement includes every field of the model ${n.bold(e.outputType.name)}. At least one field must be included in the result`
  );
}
function Ds(e, t) {
  let r = e.outputType,
    n = t.arguments.getDeepSelectionParent(e.selectionPath)?.value,
    i = n?.isEmpty() ?? !1;
  (n && (n.removeAllFields(), ei(n, r)),
    t.addErrorMessage(o =>
      i
        ? `The ${o.red('`select`')} statement for type ${o.bold(r.name)} must not be empty. ${dt(o)}`
        : `The ${o.red('`select`')} statement for type ${o.bold(r.name)} needs ${o.bold('at least one truthy value')}.`
    ));
}
function Fs(e, t) {
  let r = new mt();
  for (let i of e.outputType.fields) i.isRelation || r.addField(i.name, 'false');
  let n = new te('omit', r).makeRequired();
  if (e.selectionPath.length === 0) t.arguments.addSuggestion(n);
  else {
    let [i, o] = pt(e.selectionPath),
      a = t.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
    if (a) {
      let u = a?.value.asObject() ?? new He();
      (u.addSuggestion(n), (a.value = u));
    }
  }
  t.addErrorMessage(
    i =>
      `The global ${i.red('omit')} configuration excludes every field of the model ${i.bold(e.outputType.name)}. At least one field must be included in the result`
  );
}
function Ns(e, t) {
  let r = ti(e.selectionPath, t);
  if (r.parentKind !== 'unknown') {
    r.field.markAsError();
    let n = r.parent;
    switch (r.parentKind) {
      case 'select':
        ei(n, e.outputType);
        break;
      case 'include':
        Ws(n, e.outputType);
        break;
      case 'omit':
        Ks(n, e.outputType);
        break;
    }
  }
  t.addErrorMessage(n => {
    let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`];
    return (
      r.parentKind !== 'unknown' && i.push(`for ${n.bold(r.parentKind)} statement`),
      i.push(`on model ${n.bold(`\`${e.outputType.name}\``)}.`),
      i.push(dt(n)),
      i.join(' ')
    );
  });
}
function Us(e, t) {
  let r = ti(e.selectionPath, t);
  (r.parentKind !== 'unknown' && r.field.value.markAsError(),
    t.addErrorMessage(
      n => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${e.underlyingError}`
    ));
}
function qs(e, t) {
  let r = e.argumentPath[0],
    n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  (n && (n.getField(r)?.markAsError(), Hs(n, e.arguments)),
    t.addErrorMessage(i =>
      Xn(
        i,
        r,
        e.arguments.map(o => o.name)
      )
    ));
}
function Bs(e, t) {
  let [r, n] = pt(e.argumentPath),
    i = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  if (i) {
    i.getDeepField(e.argumentPath)?.markAsError();
    let o = i.getDeepFieldValue(r)?.asObject();
    o && ri(o, e.inputType);
  }
  t.addErrorMessage(o =>
    Xn(
      o,
      n,
      e.inputType.fields.map(s => s.name)
    )
  );
}
function Xn(e, t, r) {
  let n = [`Unknown argument \`${e.red(t)}\`.`],
    i = Ys(t, r);
  return (
    i && n.push(`Did you mean \`${e.green(i)}\`?`),
    r.length > 0 && n.push(dt(e)),
    n.join(' ')
  );
}
function $s(e, t) {
  let r;
  t.addErrorMessage(u =>
    r?.value instanceof W && r.value.text === 'null'
      ? `Argument \`${u.green(o)}\` must not be ${u.red('null')}.`
      : `Argument \`${u.green(o)}\` is missing.`
  );
  let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  if (!n) return;
  let [i, o] = pt(e.argumentPath),
    s = new mt(),
    a = n.getDeepFieldValue(i)?.asObject();
  if (a)
    if (
      ((r = a.getField(o)),
      r && a.removeField(o),
      e.inputTypes.length === 1 && e.inputTypes[0].kind === 'object')
    ) {
      for (let u of e.inputTypes[0].fields) s.addField(u.name, u.typeNames.join(' | '));
      a.addSuggestion(new te(o, s).makeRequired());
    } else {
      let u = e.inputTypes.map(Zn).join(' | ');
      a.addSuggestion(new te(o, u).makeRequired());
    }
}
function Zn(e) {
  return e.kind === 'list' ? `${Zn(e.elementType)}[]` : e.name;
}
function Vs(e, t) {
  let r = e.argument.name,
    n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  (n && n.getDeepFieldValue(e.argumentPath)?.markAsError(),
    t.addErrorMessage(i => {
      let o = Jt(
        'or',
        e.argument.typeNames.map(s => i.green(s))
      );
      return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e.inferredType)}.`;
    }));
}
function js(e, t) {
  let r = e.argument.name,
    n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  (n && n.getDeepFieldValue(e.argumentPath)?.markAsError(),
    t.addErrorMessage(i => {
      let o = [`Invalid value for argument \`${i.bold(r)}\``];
      if (
        (e.underlyingError && o.push(`: ${e.underlyingError}`),
        o.push('.'),
        e.argument.typeNames.length > 0)
      ) {
        let s = Jt(
          'or',
          e.argument.typeNames.map(a => i.green(a))
        );
        o.push(` Expected ${s}.`);
      }
      return o.join('');
    }));
}
function Qs(e, t) {
  let r = e.argument.name,
    n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(),
    i;
  if (n) {
    let s = n.getDeepField(e.argumentPath)?.value;
    (s?.markAsError(), s instanceof W && (i = s.text));
  }
  t.addErrorMessage(o => {
    let s = ['Unable to fit value'];
    return (
      i && s.push(o.red(i)),
      s.push(`into a 64-bit signed integer for field \`${o.bold(r)}\``),
      s.join(' ')
    );
  });
}
function Js(e, t) {
  let r = e.argumentPath[e.argumentPath.length - 1],
    n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
  if (n) {
    let i = n.getDeepFieldValue(e.argumentPath)?.asObject();
    i && ri(i, e.inputType);
  }
  t.addErrorMessage(i => {
    let o = [`Argument \`${i.bold(r)}\` of type ${i.bold(e.inputType.name)} needs`];
    return (
      e.constraints.minFieldCount === 1
        ? e.constraints.requiredFields
          ? o.push(
              `${i.green('at least one of')} ${Jt(
                'or',
                e.constraints.requiredFields.map(s => `\`${i.bold(s)}\``)
              )} arguments.`
            )
          : o.push(`${i.green('at least one')} argument.`)
        : o.push(`${i.green(`at least ${e.constraints.minFieldCount}`)} arguments.`),
      o.push(dt(i)),
      o.join(' ')
    );
  });
}
function Gs(e, t) {
  let r = e.argumentPath[e.argumentPath.length - 1],
    n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(),
    i = [];
  if (n) {
    let o = n.getDeepFieldValue(e.argumentPath)?.asObject();
    o && (o.markAsError(), (i = Object.keys(o.getFields())));
  }
  t.addErrorMessage(o => {
    let s = [`Argument \`${o.bold(r)}\` of type ${o.bold(e.inputType.name)} needs`];
    return (
      e.constraints.minFieldCount === 1 && e.constraints.maxFieldCount == 1
        ? s.push(`${o.green('exactly one')} argument,`)
        : e.constraints.maxFieldCount == 1
          ? s.push(`${o.green('at most one')} argument,`)
          : s.push(`${o.green(`at most ${e.constraints.maxFieldCount}`)} arguments,`),
      s.push(
        `but you provided ${Jt(
          'and',
          i.map(a => o.red(a))
        )}. Please choose`
      ),
      e.constraints.maxFieldCount === 1
        ? s.push('one.')
        : s.push(`${e.constraints.maxFieldCount}.`),
      s.join(' ')
    );
  });
}
function ei(e, t) {
  for (let r of t.fields) e.hasField(r.name) || e.addSuggestion(new te(r.name, 'true'));
}
function Ws(e, t) {
  for (let r of t.fields)
    r.isRelation && !e.hasField(r.name) && e.addSuggestion(new te(r.name, 'true'));
}
function Ks(e, t) {
  for (let r of t.fields)
    !e.hasField(r.name) && !r.isRelation && e.addSuggestion(new te(r.name, 'true'));
}
function Hs(e, t) {
  for (let r of t) e.hasField(r.name) || e.addSuggestion(new te(r.name, r.typeNames.join(' | ')));
}
function ti(e, t) {
  let [r, n] = pt(e),
    i = t.arguments.getDeepSubSelectionValue(r)?.asObject();
  if (!i) return { parentKind: 'unknown', fieldName: n };
  let o = i.getFieldValue('select')?.asObject(),
    s = i.getFieldValue('include')?.asObject(),
    a = i.getFieldValue('omit')?.asObject(),
    u = o?.getField(n);
  return o && u
    ? { parentKind: 'select', parent: o, field: u, fieldName: n }
    : ((u = s?.getField(n)),
      s && u
        ? { parentKind: 'include', field: u, parent: s, fieldName: n }
        : ((u = a?.getField(n)),
          a && u
            ? { parentKind: 'omit', field: u, parent: a, fieldName: n }
            : { parentKind: 'unknown', fieldName: n }));
}
function ri(e, t) {
  if (t.kind === 'object')
    for (let r of t.fields)
      e.hasField(r.name) || e.addSuggestion(new te(r.name, r.typeNames.join(' | ')));
}
function pt(e) {
  let t = [...e],
    r = t.pop();
  if (!r) throw new Error('unexpected empty path');
  return [t, r];
}
function dt({ green: e, enabled: t }) {
  return 'Available options are ' + (t ? `listed in ${e('green')}` : 'marked with ?') + '.';
}
function Jt(e, t) {
  if (t.length === 1) return t[0];
  let r = [...t],
    n = r.pop();
  return `${r.join(', ')} ${e} ${n}`;
}
var zs = 3;
function Ys(e, t) {
  let r = 1 / 0,
    n;
  for (let i of t) {
    let o = (0, Yn.default)(e, i);
    o > zs || (o < r && ((r = o), (n = i)));
  }
  return n;
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function ni(e) {
  return e.substring(0, 1).toLowerCase() + e.substring(1);
}
c();
m();
p();
d();
f();
l();
var ft = class {
  constructor(t, r, n, i, o) {
    ((this.modelName = t),
      (this.name = r),
      (this.typeName = n),
      (this.isList = i),
      (this.isEnum = o));
  }
  _toGraphQLInputType() {
    let t = this.isList ? 'List' : '',
      r = this.isEnum ? 'Enum' : '';
    return `${t}${r}${this.typeName}FieldRefInput<${this.modelName}>`;
  }
};
function ze(e) {
  return e instanceof ft;
}
c();
m();
p();
d();
f();
l();
var Gt = Symbol(),
  Mr = new WeakMap(),
  xe = class {
    constructor(t) {
      t === Gt
        ? Mr.set(this, `Prisma.${this._getName()}`)
        : Mr.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
    }
    _getName() {
      return this.constructor.name;
    }
    toString() {
      return Mr.get(this);
    }
  },
  gt = class extends xe {
    _getNamespace() {
      return 'NullTypes';
    }
  },
  ht = class extends gt {};
Ir(ht, 'DbNull');
var yt = class extends gt {};
Ir(yt, 'JsonNull');
var bt = class extends gt {};
Ir(bt, 'AnyNull');
var Wt = {
  classes: { DbNull: ht, JsonNull: yt, AnyNull: bt },
  instances: { DbNull: new ht(Gt), JsonNull: new yt(Gt), AnyNull: new bt(Gt) },
};
function Ir(e, t) {
  Object.defineProperty(e, 'name', { value: t, configurable: !0 });
}
c();
m();
p();
d();
f();
l();
var ii = ': ',
  Kt = class {
    constructor(t, r) {
      this.name = t;
      this.value = r;
      this.hasError = !1;
    }
    markAsError() {
      this.hasError = !0;
    }
    getPrintWidth() {
      return this.name.length + this.value.getPrintWidth() + ii.length;
    }
    write(t) {
      let r = new ce(this.name);
      (this.hasError && r.underline().setColor(t.context.colors.red),
        t.write(r).write(ii).write(this.value));
    }
  };
var Lr = class {
  constructor(t) {
    this.errorMessages = [];
    this.arguments = t;
  }
  write(t) {
    t.write(this.arguments);
  }
  addErrorMessage(t) {
    this.errorMessages.push(t);
  }
  renderAllMessages(t) {
    return this.errorMessages.map(r => r(t)).join(`
`);
  }
};
function Ye(e) {
  return new Lr(oi(e));
}
function oi(e) {
  let t = new He();
  for (let [r, n] of Object.entries(e)) {
    let i = new Kt(r, si(n));
    t.addField(i);
  }
  return t;
}
function si(e) {
  if (typeof e == 'string') return new W(JSON.stringify(e));
  if (typeof e == 'number' || typeof e == 'boolean') return new W(String(e));
  if (typeof e == 'bigint') return new W(`${e}n`);
  if (e === null) return new W('null');
  if (e === void 0) return new W('undefined');
  if (Qe(e)) return new W(`new Prisma.Decimal("${e.toFixed()}")`);
  if (e instanceof Uint8Array)
    return b.isBuffer(e)
      ? new W(`Buffer.alloc(${e.byteLength})`)
      : new W(`new Uint8Array(${e.byteLength})`);
  if (e instanceof Date) {
    let t = Bt(e) ? e.toISOString() : 'Invalid Date';
    return new W(`new Date("${t}")`);
  }
  return e instanceof xe
    ? new W(`Prisma.${e._getName()}`)
    : ze(e)
      ? new W(`prisma.${ni(e.modelName)}.$fields.${e.name}`)
      : Array.isArray(e)
        ? Xs(e)
        : typeof e == 'object'
          ? oi(e)
          : new W(Object.prototype.toString.call(e));
}
function Xs(e) {
  let t = new Ke();
  for (let r of e) t.addItem(si(r));
  return t;
}
function Ht(e, t) {
  let r = t === 'pretty' ? zn : Qt,
    n = e.renderAllMessages(r),
    i = new Ge(0, { colors: r }).write(e).toString();
  return { message: n, args: i };
}
function zt({
  args: e,
  errors: t,
  errorFormat: r,
  callsite: n,
  originalMethod: i,
  clientVersion: o,
  globalOmit: s,
}) {
  let a = Ye(e);
  for (let C of t) $t(C, a, s);
  let { message: u, args: g } = Ht(a, r),
    T = Je({
      message: u,
      callsite: n,
      originalMethod: i,
      showColors: r === 'pretty',
      callArguments: g,
    });
  throw new j(T, { clientVersion: o });
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var me = class {
  constructor() {
    this._map = new Map();
  }
  get(t) {
    return this._map.get(t)?.value;
  }
  set(t, r) {
    this._map.set(t, { value: r });
  }
  getOrCreate(t, r) {
    let n = this._map.get(t);
    if (n) return n.value;
    let i = r();
    return (this.set(t, i), i);
  }
};
c();
m();
p();
d();
f();
l();
function wt(e) {
  let t;
  return {
    get() {
      return (t || (t = { value: e() }), t.value);
    },
  };
}
c();
m();
p();
d();
f();
l();
function pe(e) {
  return e.replace(/^./, t => t.toLowerCase());
}
c();
m();
p();
d();
f();
l();
function li(e, t, r) {
  let n = pe(r);
  return !t.result || !(t.result.$allModels || t.result[n])
    ? e
    : Zs({ ...e, ...ai(t.name, e, t.result.$allModels), ...ai(t.name, e, t.result[n]) });
}
function Zs(e) {
  let t = new me(),
    r = (n, i) =>
      t.getOrCreate(n, () =>
        i.has(n) ? [n] : (i.add(n), e[n] ? e[n].needs.flatMap(o => r(o, i)) : [n])
      );
  return Be(e, n => ({ ...n, needs: r(n.name, new Set()) }));
}
function ai(e, t, r) {
  return r
    ? Be(r, ({ needs: n, compute: i }, o) => ({
        name: o,
        needs: n ? Object.keys(n).filter(s => n[s]) : [],
        compute: ea(t, o, i),
      }))
    : {};
}
function ea(e, t, r) {
  let n = e?.[t]?.compute;
  return n ? i => r({ ...i, [t]: n(i) }) : r;
}
function ui(e, t) {
  if (!t) return e;
  let r = { ...e };
  for (let n of Object.values(t)) if (e[n.name]) for (let i of n.needs) r[i] = !0;
  return r;
}
function ci(e, t) {
  if (!t) return e;
  let r = { ...e };
  for (let n of Object.values(t)) if (!e[n.name]) for (let i of n.needs) delete r[i];
  return r;
}
var Yt = class {
    constructor(t, r) {
      this.extension = t;
      this.previous = r;
      this.computedFieldsCache = new me();
      this.modelExtensionsCache = new me();
      this.queryCallbacksCache = new me();
      this.clientExtensions = wt(() =>
        this.extension.client
          ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client }
          : this.previous?.getAllClientExtensions()
      );
      this.batchCallbacks = wt(() => {
        let t = this.previous?.getAllBatchQueryCallbacks() ?? [],
          r = this.extension.query?.$__internalBatch;
        return r ? t.concat(r) : t;
      });
    }
    getAllComputedFields(t) {
      return this.computedFieldsCache.getOrCreate(t, () =>
        li(this.previous?.getAllComputedFields(t), this.extension, t)
      );
    }
    getAllClientExtensions() {
      return this.clientExtensions.get();
    }
    getAllModelExtensions(t) {
      return this.modelExtensionsCache.getOrCreate(t, () => {
        let r = pe(t);
        return !this.extension.model ||
          !(this.extension.model[r] || this.extension.model.$allModels)
          ? this.previous?.getAllModelExtensions(t)
          : {
              ...this.previous?.getAllModelExtensions(t),
              ...this.extension.model.$allModels,
              ...this.extension.model[r],
            };
      });
    }
    getAllQueryCallbacks(t, r) {
      return this.queryCallbacksCache.getOrCreate(`${t}:${r}`, () => {
        let n = this.previous?.getAllQueryCallbacks(t, r) ?? [],
          i = [],
          o = this.extension.query;
        return !o || !(o[t] || o.$allModels || o[r] || o.$allOperations)
          ? n
          : (o[t] !== void 0 &&
              (o[t][r] !== void 0 && i.push(o[t][r]),
              o[t].$allOperations !== void 0 && i.push(o[t].$allOperations)),
            t !== '$none' &&
              o.$allModels !== void 0 &&
              (o.$allModels[r] !== void 0 && i.push(o.$allModels[r]),
              o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)),
            o[r] !== void 0 && i.push(o[r]),
            o.$allOperations !== void 0 && i.push(o.$allOperations),
            n.concat(i));
      });
    }
    getAllBatchQueryCallbacks() {
      return this.batchCallbacks.get();
    }
  },
  Xe = class e {
    constructor(t) {
      this.head = t;
    }
    static empty() {
      return new e();
    }
    static single(t) {
      return new e(new Yt(t));
    }
    isEmpty() {
      return this.head === void 0;
    }
    append(t) {
      return new e(new Yt(t, this.head));
    }
    getAllComputedFields(t) {
      return this.head?.getAllComputedFields(t);
    }
    getAllClientExtensions() {
      return this.head?.getAllClientExtensions();
    }
    getAllModelExtensions(t) {
      return this.head?.getAllModelExtensions(t);
    }
    getAllQueryCallbacks(t, r) {
      return this.head?.getAllQueryCallbacks(t, r) ?? [];
    }
    getAllBatchQueryCallbacks() {
      return this.head?.getAllBatchQueryCallbacks() ?? [];
    }
  };
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var mi = Symbol(),
  Et = class {
    constructor(t) {
      if (t !== mi) throw new Error('Skip instance can not be constructed directly');
    }
    ifUndefined(t) {
      return t === void 0 ? Xt : t;
    }
  },
  Xt = new Et(mi);
function de(e) {
  return e instanceof Et;
}
var ta = {
    findUnique: 'findUnique',
    findUniqueOrThrow: 'findUniqueOrThrow',
    findFirst: 'findFirst',
    findFirstOrThrow: 'findFirstOrThrow',
    findMany: 'findMany',
    count: 'aggregate',
    create: 'createOne',
    createMany: 'createMany',
    createManyAndReturn: 'createManyAndReturn',
    update: 'updateOne',
    updateMany: 'updateMany',
    upsert: 'upsertOne',
    delete: 'deleteOne',
    deleteMany: 'deleteMany',
    executeRaw: 'executeRaw',
    queryRaw: 'queryRaw',
    aggregate: 'aggregate',
    groupBy: 'groupBy',
    runCommandRaw: 'runCommandRaw',
    findRaw: 'findRaw',
    aggregateRaw: 'aggregateRaw',
  },
  pi = 'explicitly `undefined` values are not allowed';
function Zt({
  modelName: e,
  action: t,
  args: r,
  runtimeDataModel: n,
  extensions: i = Xe.empty(),
  callsite: o,
  clientMethod: s,
  errorFormat: a,
  clientVersion: u,
  previewFeatures: g,
  globalOmit: T,
}) {
  let C = new _r({
    runtimeDataModel: n,
    modelName: e,
    action: t,
    rootArgs: r,
    callsite: o,
    extensions: i,
    selectionPath: [],
    argumentPath: [],
    originalMethod: s,
    errorFormat: a,
    clientVersion: u,
    previewFeatures: g,
    globalOmit: T,
  });
  return { modelName: e, action: ta[t], query: xt(r, C) };
}
function xt({ select: e, include: t, ...r } = {}, n) {
  let i;
  return (
    n.isPreviewFeatureOn('omitApi') && ((i = r.omit), delete r.omit),
    { arguments: fi(r, n), selection: ra(e, t, i, n) }
  );
}
function ra(e, t, r, n) {
  return e
    ? (t
        ? n.throwValidationError({
            kind: 'MutuallyExclusiveFields',
            firstField: 'include',
            secondField: 'select',
            selectionPath: n.getSelectionPath(),
          })
        : r &&
          n.isPreviewFeatureOn('omitApi') &&
          n.throwValidationError({
            kind: 'MutuallyExclusiveFields',
            firstField: 'omit',
            secondField: 'select',
            selectionPath: n.getSelectionPath(),
          }),
      sa(e, n))
    : na(n, t, r);
}
function na(e, t, r) {
  let n = {};
  return (
    e.modelOrType && !e.isRawAction() && ((n.$composites = !0), (n.$scalars = !0)),
    t && ia(n, t, e),
    e.isPreviewFeatureOn('omitApi') && oa(n, r, e),
    n
  );
}
function ia(e, t, r) {
  for (let [n, i] of Object.entries(t)) {
    if (de(i)) continue;
    let o = r.nestSelection(n);
    if ((Dr(i, o), i === !1 || i === void 0)) {
      e[n] = !1;
      continue;
    }
    let s = r.findField(n);
    if (
      (s &&
        s.kind !== 'object' &&
        r.throwValidationError({
          kind: 'IncludeOnScalar',
          selectionPath: r.getSelectionPath().concat(n),
          outputType: r.getOutputTypeDescription(),
        }),
      s)
    ) {
      e[n] = xt(i === !0 ? {} : i, o);
      continue;
    }
    if (i === !0) {
      e[n] = !0;
      continue;
    }
    e[n] = xt(i, o);
  }
}
function oa(e, t, r) {
  let n = r.getComputedFields(),
    i = { ...r.getGlobalOmit(), ...t },
    o = ci(i, n);
  for (let [s, a] of Object.entries(o)) {
    if (de(a)) continue;
    Dr(a, r.nestSelection(s));
    let u = r.findField(s);
    (n?.[s] && !u) || (e[s] = !a);
  }
}
function sa(e, t) {
  let r = {},
    n = t.getComputedFields(),
    i = ui(e, n);
  for (let [o, s] of Object.entries(i)) {
    if (de(s)) continue;
    let a = t.nestSelection(o);
    Dr(s, a);
    let u = t.findField(o);
    if (!(n?.[o] && !u)) {
      if (s === !1 || s === void 0 || de(s)) {
        r[o] = !1;
        continue;
      }
      if (s === !0) {
        u?.kind === 'object' ? (r[o] = xt({}, a)) : (r[o] = !0);
        continue;
      }
      r[o] = xt(s, a);
    }
  }
  return r;
}
function di(e, t) {
  if (e === null) return null;
  if (typeof e == 'string' || typeof e == 'number' || typeof e == 'boolean') return e;
  if (typeof e == 'bigint') return { $type: 'BigInt', value: String(e) };
  if (je(e)) {
    if (Bt(e)) return { $type: 'DateTime', value: e.toISOString() };
    t.throwValidationError({
      kind: 'InvalidArgumentValue',
      selectionPath: t.getSelectionPath(),
      argumentPath: t.getArgumentPath(),
      argument: { name: t.getArgumentName(), typeNames: ['Date'] },
      underlyingError: 'Provided Date object is invalid',
    });
  }
  if (ze(e)) return { $type: 'FieldRef', value: { _ref: e.name, _container: e.modelName } };
  if (Array.isArray(e)) return aa(e, t);
  if (ArrayBuffer.isView(e)) return { $type: 'Bytes', value: b.from(e).toString('base64') };
  if (la(e)) return e.values;
  if (Qe(e)) return { $type: 'Decimal', value: e.toFixed() };
  if (e instanceof xe) {
    if (e !== Wt.instances[e._getName()]) throw new Error('Invalid ObjectEnumValue');
    return { $type: 'Enum', value: e._getName() };
  }
  if (ua(e)) return e.toJSON();
  if (typeof e == 'object') return fi(e, t);
  t.throwValidationError({
    kind: 'InvalidArgumentValue',
    selectionPath: t.getSelectionPath(),
    argumentPath: t.getArgumentPath(),
    argument: { name: t.getArgumentName(), typeNames: [] },
    underlyingError: `We could not serialize ${Object.prototype.toString.call(e)} value. Serialize the object to JSON or implement a ".toJSON()" method on it`,
  });
}
function fi(e, t) {
  if (e.$type) return { $type: 'Raw', value: e };
  let r = {};
  for (let n in e) {
    let i = e[n],
      o = t.nestArgument(n);
    de(i) ||
      (i !== void 0
        ? (r[n] = di(i, o))
        : t.isPreviewFeatureOn('strictUndefinedChecks') &&
          t.throwValidationError({
            kind: 'InvalidArgumentValue',
            argumentPath: o.getArgumentPath(),
            selectionPath: t.getSelectionPath(),
            argument: { name: t.getArgumentName(), typeNames: [] },
            underlyingError: pi,
          }));
  }
  return r;
}
function aa(e, t) {
  let r = [];
  for (let n = 0; n < e.length; n++) {
    let i = t.nestArgument(String(n)),
      o = e[n];
    if (o === void 0 || de(o)) {
      let s = o === void 0 ? 'undefined' : 'Prisma.skip';
      t.throwValidationError({
        kind: 'InvalidArgumentValue',
        selectionPath: i.getSelectionPath(),
        argumentPath: i.getArgumentPath(),
        argument: { name: `${t.getArgumentName()}[${n}]`, typeNames: [] },
        underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values`,
      });
    }
    r.push(di(o, i));
  }
  return r;
}
function la(e) {
  return typeof e == 'object' && e !== null && e.__prismaRawParameters__ === !0;
}
function ua(e) {
  return typeof e == 'object' && e !== null && typeof e.toJSON == 'function';
}
function Dr(e, t) {
  e === void 0 &&
    t.isPreviewFeatureOn('strictUndefinedChecks') &&
    t.throwValidationError({
      kind: 'InvalidSelectionValue',
      selectionPath: t.getSelectionPath(),
      underlyingError: pi,
    });
}
var _r = class e {
  constructor(t) {
    this.params = t;
    this.params.modelName &&
      (this.modelOrType =
        this.params.runtimeDataModel.models[this.params.modelName] ??
        this.params.runtimeDataModel.types[this.params.modelName]);
  }
  throwValidationError(t) {
    zt({
      errors: [t],
      originalMethod: this.params.originalMethod,
      args: this.params.rootArgs ?? {},
      callsite: this.params.callsite,
      errorFormat: this.params.errorFormat,
      clientVersion: this.params.clientVersion,
      globalOmit: this.params.globalOmit,
    });
  }
  getSelectionPath() {
    return this.params.selectionPath;
  }
  getArgumentPath() {
    return this.params.argumentPath;
  }
  getArgumentName() {
    return this.params.argumentPath[this.params.argumentPath.length - 1];
  }
  getOutputTypeDescription() {
    if (!(!this.params.modelName || !this.modelOrType))
      return {
        name: this.params.modelName,
        fields: this.modelOrType.fields.map(t => ({
          name: t.name,
          typeName: 'boolean',
          isRelation: t.kind === 'object',
        })),
      };
  }
  isRawAction() {
    return ['executeRaw', 'queryRaw', 'runCommandRaw', 'findRaw', 'aggregateRaw'].includes(
      this.params.action
    );
  }
  isPreviewFeatureOn(t) {
    return this.params.previewFeatures.includes(t);
  }
  getComputedFields() {
    if (this.params.modelName)
      return this.params.extensions.getAllComputedFields(this.params.modelName);
  }
  findField(t) {
    return this.modelOrType?.fields.find(r => r.name === t);
  }
  nestSelection(t) {
    let r = this.findField(t),
      n = r?.kind === 'object' ? r.type : void 0;
    return new e({
      ...this.params,
      modelName: n,
      selectionPath: this.params.selectionPath.concat(t),
    });
  }
  getGlobalOmit() {
    return this.params.modelName && this.shouldApplyGlobalOmit()
      ? (this.params.globalOmit?.[Ve(this.params.modelName)] ?? {})
      : {};
  }
  shouldApplyGlobalOmit() {
    switch (this.params.action) {
      case 'findFirst':
      case 'findFirstOrThrow':
      case 'findUniqueOrThrow':
      case 'findMany':
      case 'upsert':
      case 'findUnique':
      case 'createManyAndReturn':
      case 'create':
      case 'update':
      case 'delete':
        return !0;
      case 'executeRaw':
      case 'aggregateRaw':
      case 'runCommandRaw':
      case 'findRaw':
      case 'createMany':
      case 'deleteMany':
      case 'groupBy':
      case 'updateMany':
      case 'count':
      case 'aggregate':
      case 'queryRaw':
        return !1;
      default:
        be(this.params.action, 'Unknown action');
    }
  }
  nestArgument(t) {
    return new e({ ...this.params, argumentPath: this.params.argumentPath.concat(t) });
  }
};
c();
m();
p();
d();
f();
l();
var Ze = class {
  constructor(t) {
    this._engine = t;
  }
  prometheus(t) {
    return this._engine.metrics({ format: 'prometheus', ...t });
  }
  json(t) {
    return this._engine.metrics({ format: 'json', ...t });
  }
};
c();
m();
p();
d();
f();
l();
function gi(e) {
  return { models: Fr(e.models), enums: Fr(e.enums), types: Fr(e.types) };
}
function Fr(e) {
  let t = {};
  for (let { name: r, ...n } of e) t[r] = n;
  return t;
}
function hi(e, t) {
  let r = wt(() => ca(t));
  Object.defineProperty(e, 'dmmf', { get: () => r.get() });
}
function ca(e) {
  throw new Error('Prisma.dmmf is not available when running in edge runtimes.');
}
function Nr(e) {
  return Object.entries(e).map(([t, r]) => ({ name: t, ...r }));
}
c();
m();
p();
d();
f();
l();
var Ur = new WeakMap(),
  er = '$$PrismaTypedSql',
  qr = class {
    constructor(t, r) {
      (Ur.set(this, { sql: t, values: r }), Object.defineProperty(this, er, { value: er }));
    }
    get sql() {
      return Ur.get(this).sql;
    }
    get values() {
      return Ur.get(this).values;
    }
  };
function yi(e) {
  return (...t) => new qr(e, t);
}
function bi(e) {
  return e != null && e[er] === er;
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function Pt(e) {
  return {
    ok: !1,
    error: e,
    map() {
      return Pt(e);
    },
    flatMap() {
      return Pt(e);
    },
  };
}
var Br = class {
    constructor() {
      this.registeredErrors = [];
    }
    consumeError(t) {
      return this.registeredErrors[t];
    }
    registerNewError(t) {
      let r = 0;
      for (; this.registeredErrors[r] !== void 0; ) r++;
      return ((this.registeredErrors[r] = { error: t }), r);
    }
  },
  $r = e => {
    let t = new Br(),
      r = fe(t, e.transactionContext.bind(e)),
      n = {
        adapterName: e.adapterName,
        errorRegistry: t,
        queryRaw: fe(t, e.queryRaw.bind(e)),
        executeRaw: fe(t, e.executeRaw.bind(e)),
        provider: e.provider,
        transactionContext: async (...i) => (await r(...i)).map(s => ma(t, s)),
      };
    return (e.getConnectionInfo && (n.getConnectionInfo = da(t, e.getConnectionInfo.bind(e))), n);
  },
  ma = (e, t) => {
    let r = fe(e, t.startTransaction.bind(t));
    return {
      adapterName: t.adapterName,
      provider: t.provider,
      queryRaw: fe(e, t.queryRaw.bind(t)),
      executeRaw: fe(e, t.executeRaw.bind(t)),
      startTransaction: async (...n) => (await r(...n)).map(o => pa(e, o)),
    };
  },
  pa = (e, t) => ({
    adapterName: t.adapterName,
    provider: t.provider,
    options: t.options,
    queryRaw: fe(e, t.queryRaw.bind(t)),
    executeRaw: fe(e, t.executeRaw.bind(t)),
    commit: fe(e, t.commit.bind(t)),
    rollback: fe(e, t.rollback.bind(t)),
  });
function fe(e, t) {
  return async (...r) => {
    try {
      return await t(...r);
    } catch (n) {
      let i = e.registerNewError(n);
      return Pt({ kind: 'GenericJs', id: i });
    }
  };
}
function da(e, t) {
  return (...r) => {
    try {
      return t(...r);
    } catch (n) {
      let i = e.registerNewError(n);
      return Pt({ kind: 'GenericJs', id: i });
    }
  };
}
var Lo = Fe(wi());
var ek = Fe(Ei());
Dn();
bn();
Ln();
c();
m();
p();
d();
f();
l();
var X = class e {
  constructor(t, r) {
    if (t.length - 1 !== r.length)
      throw t.length === 0
        ? new TypeError('Expected at least 1 string')
        : new TypeError(`Expected ${t.length} strings to have ${t.length - 1} values`);
    let n = r.reduce((s, a) => s + (a instanceof e ? a.values.length : 1), 0);
    ((this.values = new Array(n)), (this.strings = new Array(n + 1)), (this.strings[0] = t[0]));
    let i = 0,
      o = 0;
    for (; i < r.length; ) {
      let s = r[i++],
        a = t[i];
      if (s instanceof e) {
        this.strings[o] += s.strings[0];
        let u = 0;
        for (; u < s.values.length; )
          ((this.values[o++] = s.values[u++]), (this.strings[o] = s.strings[u]));
        this.strings[o] += a;
      } else ((this.values[o++] = s), (this.strings[o] = a));
    }
  }
  get sql() {
    let t = this.strings.length,
      r = 1,
      n = this.strings[0];
    for (; r < t; ) n += `?${this.strings[r++]}`;
    return n;
  }
  get statement() {
    let t = this.strings.length,
      r = 1,
      n = this.strings[0];
    for (; r < t; ) n += `:${r}${this.strings[r++]}`;
    return n;
  }
  get text() {
    let t = this.strings.length,
      r = 1,
      n = this.strings[0];
    for (; r < t; ) n += `$${r}${this.strings[r++]}`;
    return n;
  }
  inspect() {
    return { sql: this.sql, statement: this.statement, text: this.text, values: this.values };
  }
};
function xi(e, t = ',', r = '', n = '') {
  if (e.length === 0)
    throw new TypeError(
      'Expected `join([])` to be called with an array of multiple elements, but got an empty array'
    );
  return new X([r, ...Array(e.length - 1).fill(t), n], e);
}
function Vr(e) {
  return new X([e], []);
}
var Pi = Vr('');
function jr(e, ...t) {
  return new X(e, t);
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function vt(e) {
  return {
    getKeys() {
      return Object.keys(e);
    },
    getPropertyValue(t) {
      return e[t];
    },
  };
}
c();
m();
p();
d();
f();
l();
function H(e, t) {
  return {
    getKeys() {
      return [e];
    },
    getPropertyValue() {
      return t();
    },
  };
}
c();
m();
p();
d();
f();
l();
function Ie(e) {
  let t = new me();
  return {
    getKeys() {
      return e.getKeys();
    },
    getPropertyValue(r) {
      return t.getOrCreate(r, () => e.getPropertyValue(r));
    },
    getPropertyDescriptor(r) {
      return e.getPropertyDescriptor?.(r);
    },
  };
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var tr = { enumerable: !0, configurable: !0, writable: !0 };
function rr(e) {
  let t = new Set(e);
  return {
    getOwnPropertyDescriptor: () => tr,
    has: (r, n) => t.has(n),
    set: (r, n, i) => t.add(n) && Reflect.set(r, n, i),
    ownKeys: () => [...t],
  };
}
var vi = Symbol.for('nodejs.util.inspect.custom');
function ge(e, t) {
  let r = ga(t),
    n = new Set(),
    i = new Proxy(e, {
      get(o, s) {
        if (n.has(s)) return o[s];
        let a = r.get(s);
        return a ? a.getPropertyValue(s) : o[s];
      },
      has(o, s) {
        if (n.has(s)) return !0;
        let a = r.get(s);
        return a ? (a.has?.(s) ?? !0) : Reflect.has(o, s);
      },
      ownKeys(o) {
        let s = Ti(Reflect.ownKeys(o), r),
          a = Ti(Array.from(r.keys()), r);
        return [...new Set([...s, ...a, ...n])];
      },
      set(o, s, a) {
        return r.get(s)?.getPropertyDescriptor?.(s)?.writable === !1
          ? !1
          : (n.add(s), Reflect.set(o, s, a));
      },
      getOwnPropertyDescriptor(o, s) {
        let a = Reflect.getOwnPropertyDescriptor(o, s);
        if (a && !a.configurable) return a;
        let u = r.get(s);
        return u ? (u.getPropertyDescriptor ? { ...tr, ...u?.getPropertyDescriptor(s) } : tr) : a;
      },
      defineProperty(o, s, a) {
        return (n.add(s), Reflect.defineProperty(o, s, a));
      },
    });
  return (
    (i[vi] = function () {
      let o = { ...this };
      return (delete o[vi], o);
    }),
    i
  );
}
function ga(e) {
  let t = new Map();
  for (let r of e) {
    let n = r.getKeys();
    for (let i of n) t.set(i, r);
  }
  return t;
}
function Ti(e, t) {
  return e.filter(r => t.get(r)?.has?.(r) ?? !0);
}
c();
m();
p();
d();
f();
l();
function et(e) {
  return {
    getKeys() {
      return e;
    },
    has() {
      return !1;
    },
    getPropertyValue() {},
  };
}
c();
m();
p();
d();
f();
l();
function nr(e, t) {
  return {
    batch: e,
    transaction: t?.kind === 'batch' ? { isolationLevel: t.options.isolationLevel } : void 0,
  };
}
c();
m();
p();
d();
f();
l();
function Ci(e) {
  if (e === void 0) return '';
  let t = Ye(e);
  return new Ge(0, { colors: Qt }).write(t).toString();
}
c();
m();
p();
d();
f();
l();
var ha = 'P2037';
function ir({ error: e, user_facing_error: t }, r, n) {
  return t.error_code
    ? new J(ya(t, n), {
        code: t.error_code,
        clientVersion: r,
        meta: t.meta,
        batchRequestIdx: t.batch_request_idx,
      })
    : new G(e, { clientVersion: r, batchRequestIdx: t.batch_request_idx });
}
function ya(e, t) {
  let r = e.message;
  return (
    (t === 'postgresql' || t === 'postgres' || t === 'mysql') &&
      e.error_code === ha &&
      (r += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`),
    r
  );
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Qr = class {
  getLocation() {
    return null;
  }
};
function Te(e) {
  return typeof $EnabledCallSite == 'function' && e !== 'minimal'
    ? new $EnabledCallSite()
    : new Qr();
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Ri = { _avg: !0, _count: !0, _sum: !0, _min: !0, _max: !0 };
function tt(e = {}) {
  let t = wa(e);
  return Object.entries(t).reduce(
    (n, [i, o]) => (Ri[i] !== void 0 ? (n.select[i] = { select: o }) : (n[i] = o), n),
    { select: {} }
  );
}
function wa(e = {}) {
  return typeof e._count == 'boolean' ? { ...e, _count: { _all: e._count } } : e;
}
function or(e = {}) {
  return t => (typeof e._count == 'boolean' && (t._count = t._count._all), t);
}
function Ai(e, t) {
  let r = or(e);
  return t({ action: 'aggregate', unpacker: r, argsMapper: tt })(e);
}
c();
m();
p();
d();
f();
l();
function Ea(e = {}) {
  let { select: t, ...r } = e;
  return typeof t == 'object' ? tt({ ...r, _count: t }) : tt({ ...r, _count: { _all: !0 } });
}
function xa(e = {}) {
  return typeof e.select == 'object' ? t => or(e)(t)._count : t => or(e)(t)._count._all;
}
function Si(e, t) {
  return t({ action: 'count', unpacker: xa(e), argsMapper: Ea })(e);
}
c();
m();
p();
d();
f();
l();
function Pa(e = {}) {
  let t = tt(e);
  if (Array.isArray(t.by)) for (let r of t.by) typeof r == 'string' && (t.select[r] = !0);
  else typeof t.by == 'string' && (t.select[t.by] = !0);
  return t;
}
function va(e = {}) {
  return t => (
    typeof e?._count == 'boolean' &&
      t.forEach(r => {
        r._count = r._count._all;
      }),
    t
  );
}
function Oi(e, t) {
  return t({ action: 'groupBy', unpacker: va(e), argsMapper: Pa })(e);
}
function ki(e, t, r) {
  if (t === 'aggregate') return n => Ai(n, r);
  if (t === 'count') return n => Si(n, r);
  if (t === 'groupBy') return n => Oi(n, r);
}
c();
m();
p();
d();
f();
l();
function Mi(e, t) {
  let r = t.fields.filter(i => !i.relationName),
    n = Sr(r, i => i.name);
  return new Proxy(
    {},
    {
      get(i, o) {
        if (o in i || typeof o == 'symbol') return i[o];
        let s = n[o];
        if (s) return new ft(e, o, s.type, s.isList, s.kind === 'enum');
      },
      ...rr(Object.keys(n)),
    }
  );
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Ii = e => (Array.isArray(e) ? e : e.split('.')),
  Jr = (e, t) => Ii(t).reduce((r, n) => r && r[n], e),
  Li = (e, t, r) =>
    Ii(t).reduceRight((n, i, o, s) => Object.assign({}, Jr(e, s.slice(0, o)), { [i]: n }), r);
function Ta(e, t) {
  return e === void 0 || t === void 0 ? [] : [...t, 'select', e];
}
function Ca(e, t, r) {
  return t === void 0 ? (e ?? {}) : Li(t, r, e || !0);
}
function Gr(e, t, r, n, i, o) {
  let a = e._runtimeDataModel.models[t].fields.reduce((u, g) => ({ ...u, [g.name]: g }), {});
  return u => {
    let g = Te(e._errorFormat),
      T = Ta(n, i),
      C = Ca(u, o, T),
      O = r({ dataPath: T, callsite: g })(C),
      A = Ra(e, t);
    return new Proxy(O, {
      get(M, S) {
        if (!A.includes(S)) return M[S];
        let ne = [a[S].type, r, S],
          z = [T, C];
        return Gr(e, ...ne, ...z);
      },
      ...rr([...A, ...Object.getOwnPropertyNames(O)]),
    });
  };
}
function Ra(e, t) {
  return e._runtimeDataModel.models[t].fields.filter(r => r.kind === 'object').map(r => r.name);
}
c();
m();
p();
d();
f();
l();
function _i(e, t, r, n) {
  return e === Me.ModelAction.findFirstOrThrow || e === Me.ModelAction.findUniqueOrThrow
    ? Aa(t, r, n)
    : n;
}
function Aa(e, t, r) {
  return async n => {
    if ('rejectOnNotFound' in n.args) {
      let o = Je({
        originalMethod: n.clientMethod,
        callsite: n.callsite,
        message: "'rejectOnNotFound' option is not supported",
      });
      throw new j(o, { clientVersion: t });
    }
    return await r(n).catch(o => {
      throw o instanceof J && o.code === 'P2025' ? new we(`No ${e} found`, t) : o;
    });
  };
}
var Sa = [
    'findUnique',
    'findUniqueOrThrow',
    'findFirst',
    'findFirstOrThrow',
    'create',
    'update',
    'upsert',
    'delete',
  ],
  Oa = ['aggregate', 'count', 'groupBy'];
function Wr(e, t) {
  let r = e._extensions.getAllModelExtensions(t) ?? {},
    n = [
      ka(e, t),
      Ia(e, t),
      vt(r),
      H('name', () => t),
      H('$name', () => t),
      H('$parent', () => e._appliedParent),
    ];
  return ge({}, n);
}
function ka(e, t) {
  let r = pe(t),
    n = Object.keys(Me.ModelAction).concat('count');
  return {
    getKeys() {
      return n;
    },
    getPropertyValue(i) {
      let o = i,
        s = u => e._request(u);
      s = _i(o, t, e._clientVersion, s);
      let a = u => g => {
        let T = Te(e._errorFormat);
        return e._createPrismaPromise(C => {
          let O = {
            args: g,
            dataPath: [],
            action: o,
            model: t,
            clientMethod: `${r}.${i}`,
            jsModelName: r,
            transaction: C,
            callsite: T,
          };
          return s({ ...O, ...u });
        });
      };
      return Sa.includes(o) ? Gr(e, t, a) : Ma(i) ? ki(e, i, a) : a({});
    },
  };
}
function Ma(e) {
  return Oa.includes(e);
}
function Ia(e, t) {
  return Ie(
    H('fields', () => {
      let r = e._runtimeDataModel.models[t];
      return Mi(t, r);
    })
  );
}
c();
m();
p();
d();
f();
l();
function Di(e) {
  return e.replace(/^./, t => t.toUpperCase());
}
var Kr = Symbol();
function Tt(e) {
  let t = [La(e), H(Kr, () => e), H('$parent', () => e._appliedParent)],
    r = e._extensions.getAllClientExtensions();
  return (r && t.push(vt(r)), ge(e, t));
}
function La(e) {
  let t = Object.keys(e._runtimeDataModel.models),
    r = t.map(pe),
    n = [...new Set(t.concat(r))];
  return Ie({
    getKeys() {
      return n;
    },
    getPropertyValue(i) {
      let o = Di(i);
      if (e._runtimeDataModel.models[o] !== void 0) return Wr(e, o);
      if (e._runtimeDataModel.models[i] !== void 0) return Wr(e, i);
    },
    getPropertyDescriptor(i) {
      if (!r.includes(i)) return { enumerable: !1 };
    },
  });
}
function Fi(e) {
  return e[Kr] ? e[Kr] : e;
}
function Ni(e) {
  if (typeof e == 'function') return e(this);
  if (e.client?.__AccelerateEngine) {
    let r = e.client.__AccelerateEngine;
    this._originalClient._engine = new r(this._originalClient._accelerateEngineConfig);
  }
  let t = Object.create(this._originalClient, {
    _extensions: { value: this._extensions.append(e) },
    _appliedParent: { value: this, configurable: !0 },
    $use: { value: void 0 },
    $on: { value: void 0 },
  });
  return Tt(t);
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function Ui({ result: e, modelName: t, select: r, omit: n, extensions: i }) {
  let o = i.getAllComputedFields(t);
  if (!o) return e;
  let s = [],
    a = [];
  for (let u of Object.values(o)) {
    if (n) {
      if (n[u.name]) continue;
      let g = u.needs.filter(T => n[T]);
      g.length > 0 && a.push(et(g));
    } else if (r) {
      if (!r[u.name]) continue;
      let g = u.needs.filter(T => !r[T]);
      g.length > 0 && a.push(et(g));
    }
    _a(e, u.needs) && s.push(Da(u, ge(e, s)));
  }
  return s.length > 0 || a.length > 0 ? ge(e, [...s, ...a]) : e;
}
function _a(e, t) {
  return t.every(r => Ar(e, r));
}
function Da(e, t) {
  return Ie(H(e.name, () => e.compute(t)));
}
c();
m();
p();
d();
f();
l();
function sr({ visitor: e, result: t, args: r, runtimeDataModel: n, modelName: i }) {
  if (Array.isArray(t)) {
    for (let s = 0; s < t.length; s++)
      t[s] = sr({ result: t[s], args: r, modelName: i, runtimeDataModel: n, visitor: e });
    return t;
  }
  let o = e(t, i, r) ?? t;
  return (
    r.include &&
      qi({
        includeOrSelect: r.include,
        result: o,
        parentModelName: i,
        runtimeDataModel: n,
        visitor: e,
      }),
    r.select &&
      qi({
        includeOrSelect: r.select,
        result: o,
        parentModelName: i,
        runtimeDataModel: n,
        visitor: e,
      }),
    o
  );
}
function qi({
  includeOrSelect: e,
  result: t,
  parentModelName: r,
  runtimeDataModel: n,
  visitor: i,
}) {
  for (let [o, s] of Object.entries(e)) {
    if (!s || t[o] == null || de(s)) continue;
    let u = n.models[r].fields.find(T => T.name === o);
    if (!u || u.kind !== 'object' || !u.relationName) continue;
    let g = typeof s == 'object' ? s : {};
    t[o] = sr({ visitor: i, result: t[o], args: g, modelName: u.type, runtimeDataModel: n });
  }
}
function Bi({
  result: e,
  modelName: t,
  args: r,
  extensions: n,
  runtimeDataModel: i,
  globalOmit: o,
}) {
  return n.isEmpty() || e == null || typeof e != 'object' || !i.models[t]
    ? e
    : sr({
        result: e,
        args: r ?? {},
        modelName: t,
        runtimeDataModel: i,
        visitor: (a, u, g) => {
          let T = pe(u);
          return Ui({
            result: a,
            modelName: T,
            select: g.select,
            omit: g.select ? void 0 : { ...o?.[T], ...g.omit },
            extensions: n,
          });
        },
      });
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
l();
function $i(e) {
  if (e instanceof X) return Fa(e);
  if (Array.isArray(e)) {
    let r = [e[0]];
    for (let n = 1; n < e.length; n++) r[n] = Ct(e[n]);
    return r;
  }
  let t = {};
  for (let r in e) t[r] = Ct(e[r]);
  return t;
}
function Fa(e) {
  return new X(e.strings, e.values);
}
function Ct(e) {
  if (typeof e != 'object' || e == null || e instanceof xe || ze(e)) return e;
  if (Qe(e)) return new ue(e.toFixed());
  if (je(e)) return new Date(+e);
  if (ArrayBuffer.isView(e)) return e.slice(0);
  if (Array.isArray(e)) {
    let t = e.length,
      r;
    for (r = Array(t); t--; ) r[t] = Ct(e[t]);
    return r;
  }
  if (typeof e == 'object') {
    let t = {};
    for (let r in e)
      r === '__proto__'
        ? Object.defineProperty(t, r, {
            value: Ct(e[r]),
            configurable: !0,
            enumerable: !0,
            writable: !0,
          })
        : (t[r] = Ct(e[r]));
    return t;
  }
  be(e, 'Unknown value');
}
function ji(e, t, r, n = 0) {
  return e._createPrismaPromise(i => {
    let o = t.customDataProxyFetch;
    return (
      'transaction' in t &&
        i !== void 0 &&
        (t.transaction?.kind === 'batch' && t.transaction.lock.then(), (t.transaction = i)),
      n === r.length
        ? e._executeRequest(t)
        : r[n]({
            model: t.model,
            operation: t.model ? t.action : t.clientMethod,
            args: $i(t.args ?? {}),
            __internalParams: t,
            query: (s, a = t) => {
              let u = a.customDataProxyFetch;
              return ((a.customDataProxyFetch = Wi(o, u)), (a.args = s), ji(e, a, r, n + 1));
            },
          })
    );
  });
}
function Qi(e, t) {
  let { jsModelName: r, action: n, clientMethod: i } = t,
    o = r ? n : i;
  if (e._extensions.isEmpty()) return e._executeRequest(t);
  let s = e._extensions.getAllQueryCallbacks(r ?? '$none', o);
  return ji(e, t, s);
}
function Ji(e) {
  return t => {
    let r = { requests: t },
      n = t[0].extensions.getAllBatchQueryCallbacks();
    return n.length ? Gi(r, n, 0, e) : e(r);
  };
}
function Gi(e, t, r, n) {
  if (r === t.length) return n(e);
  let i = e.customDataProxyFetch,
    o = e.requests[0].transaction;
  return t[r]({
    args: {
      queries: e.requests.map(s => ({ model: s.modelName, operation: s.action, args: s.args })),
      transaction: o ? { isolationLevel: o.kind === 'batch' ? o.isolationLevel : void 0 } : void 0,
    },
    __internalParams: e,
    query(s, a = e) {
      let u = a.customDataProxyFetch;
      return ((a.customDataProxyFetch = Wi(i, u)), Gi(a, t, r + 1, n));
    },
  });
}
var Vi = e => e;
function Wi(e = Vi, t = Vi) {
  return r => e(t(r));
}
c();
m();
p();
d();
f();
l();
var Ki = ee('prisma:client'),
  Hi = { Vercel: 'vercel', 'Netlify CI': 'netlify' };
function zi({ postinstall: e, ciName: t, clientVersion: r }) {
  if (
    (Ki('checkPlatformCaching:postinstall', e),
    Ki('checkPlatformCaching:ciName', t),
    e === !0 && t && t in Hi)
  ) {
    let n = `Prisma has detected that this project was built on ${t}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${Hi[t]}-build`;
    throw (console.error(n), new L(n, r));
  }
}
c();
m();
p();
d();
f();
l();
function Yi(e, t) {
  return e
    ? e.datasources
      ? e.datasources
      : e.datasourceUrl
        ? { [t[0]]: { url: e.datasourceUrl } }
        : {}
    : {};
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var Na = 'Cloudflare-Workers',
  Ua = 'node';
function Xi() {
  return typeof Netlify == 'object'
    ? 'netlify'
    : typeof EdgeRuntime == 'string'
      ? 'edge-light'
      : globalThis.navigator?.userAgent === Na
        ? 'workerd'
        : globalThis.Deno
          ? 'deno'
          : globalThis.__lagon__
            ? 'lagon'
            : globalThis.process?.release?.name === Ua
              ? 'node'
              : globalThis.Bun
                ? 'bun'
                : globalThis.fastly
                  ? 'fastly'
                  : 'unknown';
}
var qa = {
  node: 'Node.js',
  workerd: 'Cloudflare Workers',
  deno: 'Deno and Deno Deploy',
  netlify: 'Netlify Edge Functions',
  'edge-light':
    'Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)',
};
function Ce() {
  let e = Xi();
  return {
    id: e,
    prettyName: qa[e] || e,
    isEdge: ['workerd', 'deno', 'netlify', 'edge-light'].includes(e),
  };
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function ar({ inlineDatasources: e, overrideDatasources: t, env: r, clientVersion: n }) {
  let i,
    o = Object.keys(e)[0],
    s = e[o]?.url,
    a = t[o]?.url;
  if (
    (o === void 0
      ? (i = void 0)
      : a
        ? (i = a)
        : s?.value
          ? (i = s.value)
          : s?.fromEnvVar && (i = r[s.fromEnvVar]),
    s?.fromEnvVar !== void 0 && i === void 0)
  )
    throw Ce().id === 'workerd'
      ? new L(
          `error: Environment variable not found: ${s.fromEnvVar}.

In Cloudflare module Workers, environment variables are available only in the Worker's \`env\` parameter of \`fetch\`.
To solve this, provide the connection string directly: https://pris.ly/d/cloudflare-datasource-url`,
          n
        )
      : new L(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
  if (i === void 0) throw new L('error: Missing URL environment variable, value, or override.', n);
  return i;
}
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
function Zi(e) {
  if (e?.kind === 'itx') return e.options.id;
}
c();
m();
p();
d();
f();
l();
var Hr,
  eo = {
    async loadLibrary(e) {
      let { clientVersion: t, adapter: r, engineWasm: n } = e;
      if (r === void 0)
        throw new L(
          `The \`adapter\` option for \`PrismaClient\` is required in this context (${Ce().prettyName})`,
          t
        );
      if (n === void 0) throw new L('WASM engine was unexpectedly `undefined`', t);
      Hr === void 0 &&
        (Hr = (async () => {
          let o = n.getRuntime(),
            s = await n.getQueryEngineWasmModule();
          if (s == null)
            throw new L(
              'The loaded wasm module was unexpectedly `undefined` or `null` once loaded',
              t
            );
          let a = { './query_engine_bg.js': o },
            u = new WebAssembly.Instance(s, a);
          return (o.__wbg_set_wasm(u.exports), o.QueryEngine);
        })());
      let i = await Hr;
      return {
        debugPanic() {
          return Promise.reject('{}');
        },
        dmmf() {
          return Promise.resolve('{}');
        },
        version() {
          return { commit: 'unknown', version: 'unknown' };
        },
        QueryEngine: i,
      };
    },
  };
var Ba = 'P2036',
  he = ee('prisma:client:libraryEngine');
function $a(e) {
  return e.item_type === 'query' && 'query' in e;
}
function Va(e) {
  return 'level' in e ? e.level === 'error' && e.message === 'PANIC' : !1;
}
var VR = [...Cr, 'native'],
  Rt = class {
    constructor(t, r) {
      this.name = 'LibraryEngine';
      ((this.libraryLoader = r ?? eo),
        (this.config = t),
        (this.libraryStarted = !1),
        (this.logQueries = t.logQueries ?? !1),
        (this.logLevel = t.logLevel ?? 'error'),
        (this.logEmitter = t.logEmitter),
        (this.datamodel = t.inlineSchema),
        t.enableDebugLogs && (this.logLevel = 'debug'));
      let n = Object.keys(t.overrideDatasources)[0],
        i = t.overrideDatasources[n]?.url;
      (n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }),
        (this.libraryInstantiationPromise = this.instantiateLibrary()));
    }
    async applyPendingMigrations() {
      throw new Error('Cannot call this method from this type of engine instance');
    }
    async transaction(t, r, n) {
      await this.start();
      let i = JSON.stringify(r),
        o;
      if (t === 'start') {
        let a = JSON.stringify({
          max_wait: n.maxWait,
          timeout: n.timeout,
          isolation_level: n.isolationLevel,
        });
        o = await this.engine?.startTransaction(a, i);
      } else
        t === 'commit'
          ? (o = await this.engine?.commitTransaction(n.id, i))
          : t === 'rollback' && (o = await this.engine?.rollbackTransaction(n.id, i));
      let s = this.parseEngineResponse(o);
      if (ja(s)) {
        let a = this.getExternalAdapterError(s);
        throw a
          ? a.error
          : new J(s.message, {
              code: s.error_code,
              clientVersion: this.config.clientVersion,
              meta: s.meta,
            });
      }
      return s;
    }
    async instantiateLibrary() {
      if ((he('internalSetup'), this.libraryInstantiationPromise))
        return this.libraryInstantiationPromise;
      ((this.binaryTarget = await this.getCurrentBinaryTarget()),
        await this.loadEngine(),
        this.version());
    }
    async getCurrentBinaryTarget() {}
    parseEngineResponse(t) {
      if (!t)
        throw new G('Response from the Engine was empty', {
          clientVersion: this.config.clientVersion,
        });
      try {
        return JSON.parse(t);
      } catch {
        throw new G('Unable to JSON.parse response from engine', {
          clientVersion: this.config.clientVersion,
        });
      }
    }
    async loadEngine() {
      if (!this.engine) {
        this.QueryEngineConstructor ||
          ((this.library = await this.libraryLoader.loadLibrary(this.config)),
          (this.QueryEngineConstructor = this.library.QueryEngine));
        try {
          let t = new w(this),
            { adapter: r } = this.config;
          (r && he('Using driver adapter: %O', r),
            (this.engine = new this.QueryEngineConstructor(
              {
                datamodel: this.datamodel,
                env: h.env,
                logQueries: this.config.logQueries ?? !1,
                ignoreEnvVarErrors: !0,
                datasourceOverrides: this.datasourceOverrides ?? {},
                logLevel: this.logLevel,
                configDir: this.config.cwd,
                engineProtocol: 'json',
              },
              n => {
                t.deref()?.logger(n);
              },
              r
            )));
        } catch (t) {
          let r = t,
            n = this.parseInitError(r.message);
          throw typeof n == 'string'
            ? r
            : new L(n.message, this.config.clientVersion, n.error_code);
        }
      }
    }
    logger(t) {
      let r = this.parseEngineResponse(t);
      if (r) {
        if ('span' in r) {
          this.config.tracingHelper.createEngineSpan(r);
          return;
        }
        ((r.level = r?.level.toLowerCase() ?? 'unknown'),
          $a(r)
            ? this.logEmitter.emit('query', {
                timestamp: new Date(),
                query: r.query,
                params: r.params,
                duration: Number(r.duration_ms),
                target: r.module_path,
              })
            : (Va(r),
              this.logEmitter.emit(r.level, {
                timestamp: new Date(),
                message: r.message,
                target: r.module_path,
              })));
      }
    }
    parseInitError(t) {
      try {
        return JSON.parse(t);
      } catch {}
      return t;
    }
    parseRequestError(t) {
      try {
        return JSON.parse(t);
      } catch {}
      return t;
    }
    onBeforeExit() {
      throw new Error(
        '"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.'
      );
    }
    async start() {
      if (
        (await this.libraryInstantiationPromise,
        await this.libraryStoppingPromise,
        this.libraryStartingPromise)
      )
        return (
          he(`library already starting, this.libraryStarted: ${this.libraryStarted}`),
          this.libraryStartingPromise
        );
      if (this.libraryStarted) return;
      let t = async () => {
        he('library starting');
        try {
          let r = { traceparent: this.config.tracingHelper.getTraceParent() };
          (await this.engine?.connect(JSON.stringify(r)),
            (this.libraryStarted = !0),
            he('library started'));
        } catch (r) {
          let n = this.parseInitError(r.message);
          throw typeof n == 'string'
            ? r
            : new L(n.message, this.config.clientVersion, n.error_code);
        } finally {
          this.libraryStartingPromise = void 0;
        }
      };
      return (
        (this.libraryStartingPromise = this.config.tracingHelper.runInChildSpan('connect', t)),
        this.libraryStartingPromise
      );
    }
    async stop() {
      if (
        (await this.libraryStartingPromise,
        await this.executingQueryPromise,
        this.libraryStoppingPromise)
      )
        return (he('library is already stopping'), this.libraryStoppingPromise);
      if (!this.libraryStarted) return;
      let t = async () => {
        (await new Promise(n => setTimeout(n, 5)), he('library stopping'));
        let r = { traceparent: this.config.tracingHelper.getTraceParent() };
        (await this.engine?.disconnect(JSON.stringify(r)),
          (this.libraryStarted = !1),
          (this.libraryStoppingPromise = void 0),
          he('library stopped'));
      };
      return (
        (this.libraryStoppingPromise = this.config.tracingHelper.runInChildSpan('disconnect', t)),
        this.libraryStoppingPromise
      );
    }
    version() {
      return ((this.versionInfo = this.library?.version()), this.versionInfo?.version ?? 'unknown');
    }
    debugPanic(t) {
      return this.library?.debugPanic(t);
    }
    async request(t, { traceparent: r, interactiveTransaction: n }) {
      he(`sending request, this.libraryStarted: ${this.libraryStarted}`);
      let i = JSON.stringify({ traceparent: r }),
        o = JSON.stringify(t);
      try {
        (await this.start(),
          (this.executingQueryPromise = this.engine?.query(o, i, n?.id)),
          (this.lastQuery = o));
        let s = this.parseEngineResponse(await this.executingQueryPromise);
        if (s.errors)
          throw s.errors.length === 1
            ? this.buildQueryError(s.errors[0])
            : new G(JSON.stringify(s.errors), { clientVersion: this.config.clientVersion });
        if (this.loggerRustPanic) throw this.loggerRustPanic;
        return { data: s, elapsed: 0 };
      } catch (s) {
        if (s instanceof L) throw s;
        s.code === 'GenericFailure' && s.message?.startsWith('PANIC:');
        let a = this.parseRequestError(s.message);
        throw typeof a == 'string'
          ? s
          : new G(
              `${a.message}
${a.backtrace}`,
              { clientVersion: this.config.clientVersion }
            );
      }
    }
    async requestBatch(t, { transaction: r, traceparent: n }) {
      he('requestBatch');
      let i = nr(t, r);
      (await this.start(),
        (this.lastQuery = JSON.stringify(i)),
        (this.executingQueryPromise = this.engine.query(
          this.lastQuery,
          JSON.stringify({ traceparent: n }),
          Zi(r)
        )));
      let o = await this.executingQueryPromise,
        s = this.parseEngineResponse(o);
      if (s.errors)
        throw s.errors.length === 1
          ? this.buildQueryError(s.errors[0])
          : new G(JSON.stringify(s.errors), { clientVersion: this.config.clientVersion });
      let { batchResult: a, errors: u } = s;
      if (Array.isArray(a))
        return a.map(g =>
          g.errors && g.errors.length > 0
            ? (this.loggerRustPanic ?? this.buildQueryError(g.errors[0]))
            : { data: g, elapsed: 0 }
        );
      throw u && u.length === 1 ? new Error(u[0].error) : new Error(JSON.stringify(s));
    }
    buildQueryError(t) {
      t.user_facing_error.is_panic;
      let r = this.getExternalAdapterError(t.user_facing_error);
      return r ? r.error : ir(t, this.config.clientVersion, this.config.activeProvider);
    }
    getExternalAdapterError(t) {
      if (t.error_code === Ba && this.config.adapter) {
        let r = t.meta?.id;
        qt(typeof r == 'number', 'Malformed external JS error received from the engine');
        let n = this.config.adapter.errorRegistry.consumeError(r);
        return (qt(n, 'External error with reported id was not registered'), n);
      }
    }
    async metrics(t) {
      await this.start();
      let r = await this.engine.metrics(JSON.stringify(t));
      return t.format === 'prometheus' ? r : this.parseEngineResponse(r);
    }
  };
function ja(e) {
  return typeof e == 'object' && e !== null && e.error_code !== void 0;
}
c();
m();
p();
d();
f();
l();
var At =
    'Accelerate has not been setup correctly. Make sure your client is using `.$extends(withAccelerate())`. See https://pris.ly/d/accelerate-getting-started',
  lr = class {
    constructor(t) {
      this.config = t;
      this.name = 'AccelerateEngine';
      this.resolveDatasourceUrl = this.config.accelerateUtils?.resolveDatasourceUrl;
      this.getBatchRequestPayload = this.config.accelerateUtils?.getBatchRequestPayload;
      this.prismaGraphQLToJSError = this.config.accelerateUtils?.prismaGraphQLToJSError;
      this.PrismaClientUnknownRequestError =
        this.config.accelerateUtils?.PrismaClientUnknownRequestError;
      this.PrismaClientInitializationError =
        this.config.accelerateUtils?.PrismaClientInitializationError;
      this.PrismaClientKnownRequestError =
        this.config.accelerateUtils?.PrismaClientKnownRequestError;
      this.debug = this.config.accelerateUtils?.debug;
      this.engineVersion = this.config.accelerateUtils?.engineVersion;
      this.clientVersion = this.config.accelerateUtils?.clientVersion;
    }
    onBeforeExit(t) {}
    async start() {}
    async stop() {}
    version(t) {
      return 'unknown';
    }
    transaction(t, r, n) {
      throw new L(At, this.config.clientVersion);
    }
    metrics(t) {
      throw new L(At, this.config.clientVersion);
    }
    request(t, r) {
      throw new L(At, this.config.clientVersion);
    }
    requestBatch(t, r) {
      throw new L(At, this.config.clientVersion);
    }
    applyPendingMigrations() {
      throw new L(At, this.config.clientVersion);
    }
  };
function to({ copyEngine: e = !0 }, t) {
  let r;
  try {
    r = ar({
      inlineDatasources: t.inlineDatasources,
      overrideDatasources: t.overrideDatasources,
      env: { ...t.env, ...h.env },
      clientVersion: t.clientVersion,
    });
  } catch {}
  let n = !!(r?.startsWith('prisma://') || r?.startsWith('prisma+postgres://'));
  e &&
    n &&
    ct(
      'recommend--no-engine',
      'In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)'
    );
  let i = at(t.generator),
    o = n || !e,
    s = !!t.adapter,
    a = i === 'library',
    u = i === 'binary';
  if ((o && s) || (s && !1)) {
    let g;
    throw (
      e
        ? r?.startsWith('prisma://')
          ? (g = [
              'Prisma Client was configured to use the `adapter` option but the URL was a `prisma://` URL.',
              'Please either use the `prisma://` URL or remove the `adapter` from the Prisma Client constructor.',
            ])
          : (g = [
              'Prisma Client was configured to use both the `adapter` and Accelerate, please chose one.',
            ])
        : (g = [
            'Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.',
            'Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter.',
          ]),
      new j(
        g.join(`
`),
        { clientVersion: t.clientVersion }
      )
    );
  }
  if (s) return new Rt(t);
  if (o) return new lr(t);
  {
    let g = [
      `PrismaClient failed to initialize because it wasn't configured to run in this environment (${Ce().prettyName}).`,
      'In order to run Prisma Client in an edge runtime, you will need to configure one of the following options:',
      '- Enable Driver Adapters: https://pris.ly/d/driver-adapters',
      '- Enable Accelerate: https://pris.ly/d/accelerate',
    ];
    throw new j(
      g.join(`
`),
      { clientVersion: t.clientVersion }
    );
  }
  throw new j('Invalid client engine type, please use `library` or `binary`', {
    clientVersion: t.clientVersion,
  });
}
c();
m();
p();
d();
f();
l();
function ur({ generator: e }) {
  return e?.previewFeatures ?? [];
}
c();
m();
p();
d();
f();
l();
var ro = e => ({ command: e });
c();
m();
p();
d();
f();
l();
c();
m();
p();
d();
f();
l();
var no = e => e.strings.reduce((t, r, n) => `${t}@P${n}${r}`);
c();
m();
p();
d();
f();
l();
l();
function rt(e) {
  try {
    return io(e, 'fast');
  } catch {
    return io(e, 'slow');
  }
}
function io(e, t) {
  return JSON.stringify(e.map(r => so(r, t)));
}
function so(e, t) {
  return Array.isArray(e)
    ? e.map(r => so(r, t))
    : typeof e == 'bigint'
      ? { prisma__type: 'bigint', prisma__value: e.toString() }
      : je(e)
        ? { prisma__type: 'date', prisma__value: e.toJSON() }
        : ue.isDecimal(e)
          ? { prisma__type: 'decimal', prisma__value: e.toJSON() }
          : b.isBuffer(e)
            ? { prisma__type: 'bytes', prisma__value: e.toString('base64') }
            : Qa(e) || ArrayBuffer.isView(e)
              ? { prisma__type: 'bytes', prisma__value: b.from(e).toString('base64') }
              : typeof e == 'object' && t === 'slow'
                ? ao(e)
                : e;
}
function Qa(e) {
  return e instanceof ArrayBuffer || e instanceof SharedArrayBuffer
    ? !0
    : typeof e == 'object' && e !== null
      ? e[Symbol.toStringTag] === 'ArrayBuffer' || e[Symbol.toStringTag] === 'SharedArrayBuffer'
      : !1;
}
function ao(e) {
  if (typeof e != 'object' || e === null) return e;
  if (typeof e.toJSON == 'function') return e.toJSON();
  if (Array.isArray(e)) return e.map(oo);
  let t = {};
  for (let r of Object.keys(e)) t[r] = oo(e[r]);
  return t;
}
function oo(e) {
  return typeof e == 'bigint' ? e.toString() : ao(e);
}
c();
m();
p();
d();
f();
l();
var Ja = ['$connect', '$disconnect', '$on', '$transaction', '$use', '$extends'],
  lo = Ja;
var Ga = /^(\s*alter\s)/i,
  uo = ee('prisma:client');
function zr(e, t, r, n) {
  if (!(e !== 'postgresql' && e !== 'cockroachdb') && r.length > 0 && Ga.exec(t))
    throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
}
var Yr =
    ({ clientMethod: e, activeProvider: t }) =>
    r => {
      let n = '',
        i;
      if (bi(r)) ((n = r.sql), (i = { values: rt(r.values), __prismaRawParameters__: !0 }));
      else if (Array.isArray(r)) {
        let [o, ...s] = r;
        ((n = o), (i = { values: rt(s || []), __prismaRawParameters__: !0 }));
      } else
        switch (t) {
          case 'sqlite':
          case 'mysql': {
            ((n = r.sql), (i = { values: rt(r.values), __prismaRawParameters__: !0 }));
            break;
          }
          case 'cockroachdb':
          case 'postgresql':
          case 'postgres': {
            ((n = r.text), (i = { values: rt(r.values), __prismaRawParameters__: !0 }));
            break;
          }
          case 'sqlserver': {
            ((n = no(r)), (i = { values: rt(r.values), __prismaRawParameters__: !0 }));
            break;
          }
          default:
            throw new Error(`The ${t} provider does not support ${e}`);
        }
      return (
        i?.values ? uo(`prisma.${e}(${n}, ${i.values})`) : uo(`prisma.${e}(${n})`),
        { query: n, parameters: i }
      );
    },
  co = {
    requestArgsToMiddlewareArgs(e) {
      return [e.strings, ...e.values];
    },
    middlewareArgsToRequestArgs(e) {
      let [t, ...r] = e;
      return new X(t, r);
    },
  },
  mo = {
    requestArgsToMiddlewareArgs(e) {
      return [e];
    },
    middlewareArgsToRequestArgs(e) {
      return e[0];
    },
  };
c();
m();
p();
d();
f();
l();
function Xr(e) {
  return function (r) {
    let n,
      i = (o = e) => {
        try {
          return o === void 0 || o?.kind === 'itx' ? (n ??= po(r(o))) : po(r(o));
        } catch (s) {
          return Promise.reject(s);
        }
      };
    return {
      then(o, s) {
        return i().then(o, s);
      },
      catch(o) {
        return i().catch(o);
      },
      finally(o) {
        return i().finally(o);
      },
      requestTransaction(o) {
        let s = i(o);
        return s.requestTransaction ? s.requestTransaction(o) : s;
      },
      [Symbol.toStringTag]: 'PrismaPromise',
    };
  };
}
function po(e) {
  return typeof e.then == 'function' ? e : Promise.resolve(e);
}
c();
m();
p();
d();
f();
l();
var fo = {
    isEnabled() {
      return !1;
    },
    getTraceParent() {
      return '00-10-10-00';
    },
    async createEngineSpan() {},
    getActiveContext() {},
    runInChildSpan(e, t) {
      return t();
    },
  },
  Zr = class {
    isEnabled() {
      return this.getGlobalTracingHelper().isEnabled();
    }
    getTraceParent(t) {
      return this.getGlobalTracingHelper().getTraceParent(t);
    }
    createEngineSpan(t) {
      return this.getGlobalTracingHelper().createEngineSpan(t);
    }
    getActiveContext() {
      return this.getGlobalTracingHelper().getActiveContext();
    }
    runInChildSpan(t, r) {
      return this.getGlobalTracingHelper().runInChildSpan(t, r);
    }
    getGlobalTracingHelper() {
      return globalThis.PRISMA_INSTRUMENTATION?.helper ?? fo;
    }
  };
function go(e) {
  return e.includes('tracing') ? new Zr() : fo;
}
c();
m();
p();
d();
f();
l();
function ho(e, t = () => {}) {
  let r,
    n = new Promise(i => (r = i));
  return {
    then(i) {
      return (--e === 0 && r(t()), i?.(n));
    },
  };
}
c();
m();
p();
d();
f();
l();
function yo(e) {
  return typeof e == 'string'
    ? e
    : e.reduce(
        (t, r) => {
          let n = typeof r == 'string' ? r : r.level;
          return n === 'query' ? t : t && (r === 'info' || t === 'info') ? 'info' : n;
        },
        void 0
      );
}
c();
m();
p();
d();
f();
l();
var cr = class {
  constructor() {
    this._middlewares = [];
  }
  use(t) {
    this._middlewares.push(t);
  }
  get(t) {
    return this._middlewares[t];
  }
  has(t) {
    return !!this._middlewares[t];
  }
  length() {
    return this._middlewares.length;
  }
};
c();
m();
p();
d();
f();
l();
var Eo = Fe(Vn());
c();
m();
p();
d();
f();
l();
function mr(e) {
  return typeof e.batchRequestIdx == 'number';
}
c();
m();
p();
d();
f();
l();
function bo(e) {
  if (e.action !== 'findUnique' && e.action !== 'findUniqueOrThrow') return;
  let t = [];
  return (
    e.modelName && t.push(e.modelName),
    e.query.arguments && t.push(en(e.query.arguments)),
    t.push(en(e.query.selection)),
    t.join('')
  );
}
function en(e) {
  return `(${Object.keys(e)
    .sort()
    .map(r => {
      let n = e[r];
      return typeof n == 'object' && n !== null ? `(${r} ${en(n)})` : r;
    })
    .join(' ')})`;
}
c();
m();
p();
d();
f();
l();
var Wa = {
  aggregate: !1,
  aggregateRaw: !1,
  createMany: !0,
  createManyAndReturn: !0,
  createOne: !0,
  deleteMany: !0,
  deleteOne: !0,
  executeRaw: !0,
  findFirst: !1,
  findFirstOrThrow: !1,
  findMany: !1,
  findRaw: !1,
  findUnique: !1,
  findUniqueOrThrow: !1,
  groupBy: !1,
  queryRaw: !1,
  runCommandRaw: !0,
  updateMany: !0,
  updateOne: !0,
  upsertOne: !0,
};
function tn(e) {
  return Wa[e];
}
c();
m();
p();
d();
f();
l();
var pr = class {
  constructor(t) {
    this.options = t;
    this.tickActive = !1;
    this.batches = {};
  }
  request(t) {
    let r = this.options.batchBy(t);
    return r
      ? (this.batches[r] ||
          ((this.batches[r] = []),
          this.tickActive ||
            ((this.tickActive = !0),
            h.nextTick(() => {
              (this.dispatchBatches(), (this.tickActive = !1));
            }))),
        new Promise((n, i) => {
          this.batches[r].push({ request: t, resolve: n, reject: i });
        }))
      : this.options.singleLoader(t);
  }
  dispatchBatches() {
    for (let t in this.batches) {
      let r = this.batches[t];
      (delete this.batches[t],
        r.length === 1
          ? this.options
              .singleLoader(r[0].request)
              .then(n => {
                n instanceof Error ? r[0].reject(n) : r[0].resolve(n);
              })
              .catch(n => {
                r[0].reject(n);
              })
          : (r.sort((n, i) => this.options.batchOrder(n.request, i.request)),
            this.options
              .batchLoader(r.map(n => n.request))
              .then(n => {
                if (n instanceof Error) for (let i = 0; i < r.length; i++) r[i].reject(n);
                else
                  for (let i = 0; i < r.length; i++) {
                    let o = n[i];
                    o instanceof Error ? r[i].reject(o) : r[i].resolve(o);
                  }
              })
              .catch(n => {
                for (let i = 0; i < r.length; i++) r[i].reject(n);
              })));
    }
  }
  get [Symbol.toStringTag]() {
    return 'DataLoader';
  }
};
c();
m();
p();
d();
f();
l();
l();
function Le(e, t) {
  if (t === null) return t;
  switch (e) {
    case 'bigint':
      return BigInt(t);
    case 'bytes':
      return b.from(t, 'base64');
    case 'decimal':
      return new ue(t);
    case 'datetime':
    case 'date':
      return new Date(t);
    case 'time':
      return new Date(`1970-01-01T${t}Z`);
    case 'bigint-array':
      return t.map(r => Le('bigint', r));
    case 'bytes-array':
      return t.map(r => Le('bytes', r));
    case 'decimal-array':
      return t.map(r => Le('decimal', r));
    case 'datetime-array':
      return t.map(r => Le('datetime', r));
    case 'date-array':
      return t.map(r => Le('date', r));
    case 'time-array':
      return t.map(r => Le('time', r));
    default:
      return t;
  }
}
function wo(e) {
  let t = [],
    r = Ka(e);
  for (let n = 0; n < e.rows.length; n++) {
    let i = e.rows[n],
      o = { ...r };
    for (let s = 0; s < i.length; s++) o[e.columns[s]] = Le(e.types[s], i[s]);
    t.push(o);
  }
  return t;
}
function Ka(e) {
  let t = {};
  for (let r = 0; r < e.columns.length; r++) t[e.columns[r]] = null;
  return t;
}
var Ha = ee('prisma:client:request_handler'),
  dr = class {
    constructor(t, r) {
      ((this.logEmitter = r),
        (this.client = t),
        (this.dataloader = new pr({
          batchLoader: Ji(async ({ requests: n, customDataProxyFetch: i }) => {
            let { transaction: o, otelParentCtx: s } = n[0],
              a = n.map(C => C.protocolQuery),
              u = this.client._tracingHelper.getTraceParent(s),
              g = n.some(C => tn(C.protocolQuery.action));
            return (
              await this.client._engine.requestBatch(a, {
                traceparent: u,
                transaction: za(o),
                containsWrite: g,
                customDataProxyFetch: i,
              })
            ).map((C, O) => {
              if (C instanceof Error) return C;
              try {
                return this.mapQueryEngineResult(n[O], C);
              } catch (A) {
                return A;
              }
            });
          }),
          singleLoader: async n => {
            let i = n.transaction?.kind === 'itx' ? xo(n.transaction) : void 0,
              o = await this.client._engine.request(n.protocolQuery, {
                traceparent: this.client._tracingHelper.getTraceParent(),
                interactiveTransaction: i,
                isWrite: tn(n.protocolQuery.action),
                customDataProxyFetch: n.customDataProxyFetch,
              });
            return this.mapQueryEngineResult(n, o);
          },
          batchBy: n =>
            n.transaction?.id ? `transaction-${n.transaction.id}` : bo(n.protocolQuery),
          batchOrder(n, i) {
            return n.transaction?.kind === 'batch' && i.transaction?.kind === 'batch'
              ? n.transaction.index - i.transaction.index
              : 0;
          },
        })));
    }
    async request(t) {
      try {
        return await this.dataloader.request(t);
      } catch (r) {
        let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a } = t;
        this.handleAndLogRequestError({
          error: r,
          clientMethod: n,
          callsite: i,
          transaction: o,
          args: s,
          modelName: a,
          globalOmit: t.globalOmit,
        });
      }
    }
    mapQueryEngineResult({ dataPath: t, unpacker: r }, n) {
      let i = n?.data,
        o = n?.elapsed,
        s = this.unpack(i, t, r);
      return h.env.PRISMA_CLIENT_GET_TIME ? { data: s, elapsed: o } : s;
    }
    handleAndLogRequestError(t) {
      try {
        this.handleRequestError(t);
      } catch (r) {
        throw (
          this.logEmitter &&
            this.logEmitter.emit('error', {
              message: r.message,
              target: t.clientMethod,
              timestamp: new Date(),
            }),
          r
        );
      }
    }
    handleRequestError({
      error: t,
      clientMethod: r,
      callsite: n,
      transaction: i,
      args: o,
      modelName: s,
      globalOmit: a,
    }) {
      if ((Ha(t), Ya(t, i) || t instanceof we)) throw t;
      if (t instanceof J && Xa(t)) {
        let g = Po(t.meta);
        zt({
          args: o,
          errors: [g],
          callsite: n,
          errorFormat: this.client._errorFormat,
          originalMethod: r,
          clientVersion: this.client._clientVersion,
          globalOmit: a,
        });
      }
      let u = t.message;
      if (
        (n &&
          (u = Je({
            callsite: n,
            originalMethod: r,
            isPanic: t.isPanic,
            showColors: this.client._errorFormat === 'pretty',
            message: u,
          })),
        (u = this.sanitizeMessage(u)),
        t.code)
      ) {
        let g = s ? { modelName: s, ...t.meta } : t.meta;
        throw new J(u, {
          code: t.code,
          clientVersion: this.client._clientVersion,
          meta: g,
          batchRequestIdx: t.batchRequestIdx,
        });
      } else {
        if (t.isPanic) throw new Ee(u, this.client._clientVersion);
        if (t instanceof G)
          throw new G(u, {
            clientVersion: this.client._clientVersion,
            batchRequestIdx: t.batchRequestIdx,
          });
        if (t instanceof L) throw new L(u, this.client._clientVersion);
        if (t instanceof Ee) throw new Ee(u, this.client._clientVersion);
      }
      throw ((t.clientVersion = this.client._clientVersion), t);
    }
    sanitizeMessage(t) {
      return this.client._errorFormat && this.client._errorFormat !== 'pretty'
        ? (0, Eo.default)(t)
        : t;
    }
    unpack(t, r, n) {
      if (!t || (t.data && (t = t.data), !t)) return t;
      let i = Object.keys(t)[0],
        o = Object.values(t)[0],
        s = r.filter(g => g !== 'select' && g !== 'include'),
        a = Jr(o, s),
        u = i === 'queryRaw' ? wo(a) : $e(a);
      return n ? n(u) : u;
    }
    get [Symbol.toStringTag]() {
      return 'RequestHandler';
    }
  };
function za(e) {
  if (e) {
    if (e.kind === 'batch') return { kind: 'batch', options: { isolationLevel: e.isolationLevel } };
    if (e.kind === 'itx') return { kind: 'itx', options: xo(e) };
    be(e, 'Unknown transaction kind');
  }
}
function xo(e) {
  return { id: e.id, payload: e.payload };
}
function Ya(e, t) {
  return mr(e) && t?.kind === 'batch' && e.batchRequestIdx !== t.index;
}
function Xa(e) {
  return e.code === 'P2009' || e.code === 'P2012';
}
function Po(e) {
  if (e.kind === 'Union') return { kind: 'Union', errors: e.errors.map(Po) };
  if (Array.isArray(e.selectionPath)) {
    let [, ...t] = e.selectionPath;
    return { ...e, selectionPath: t };
  }
  return e;
}
c();
m();
p();
d();
f();
l();
var vo = '5.22.0';
var To = vo;
c();
m();
p();
d();
f();
l();
var Oo = Fe(kr());
c();
m();
p();
d();
f();
l();
var _ = class extends Error {
  constructor(t) {
    (super(
      t +
        `
Read more at https://pris.ly/d/client-constructor`
    ),
      (this.name = 'PrismaClientConstructorValidationError'));
  }
  get [Symbol.toStringTag]() {
    return 'PrismaClientConstructorValidationError';
  }
};
K(_, 'PrismaClientConstructorValidationError');
var Co = [
    'datasources',
    'datasourceUrl',
    'errorFormat',
    'adapter',
    'log',
    'transactionOptions',
    'omit',
    '__internal',
  ],
  Ro = ['pretty', 'colorless', 'minimal'],
  Ao = ['info', 'query', 'warn', 'error'],
  el = {
    datasources: (e, { datasourceNames: t }) => {
      if (e) {
        if (typeof e != 'object' || Array.isArray(e))
          throw new _(
            `Invalid value ${JSON.stringify(e)} for "datasources" provided to PrismaClient constructor`
          );
        for (let [r, n] of Object.entries(e)) {
          if (!t.includes(r)) {
            let i = nt(r, t) || ` Available datasources: ${t.join(', ')}`;
            throw new _(`Unknown datasource ${r} provided to PrismaClient constructor.${i}`);
          }
          if (typeof n != 'object' || Array.isArray(n))
            throw new _(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          if (n && typeof n == 'object')
            for (let [i, o] of Object.entries(n)) {
              if (i !== 'url')
                throw new _(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
              if (typeof o != 'string')
                throw new _(`Invalid value ${JSON.stringify(o)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
            }
        }
      }
    },
    adapter: (e, t) => {
      if (e === null) return;
      if (e === void 0)
        throw new _(
          '"adapter" property must not be undefined, use null to conditionally disable driver adapters.'
        );
      if (!ur(t).includes('driverAdapters'))
        throw new _(
          '"adapter" property can only be provided to PrismaClient constructor when "driverAdapters" preview feature is enabled.'
        );
      if (at() === 'binary')
        throw new _(
          'Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.'
        );
    },
    datasourceUrl: e => {
      if (typeof e < 'u' && typeof e != 'string')
        throw new _(`Invalid value ${JSON.stringify(e)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    },
    errorFormat: e => {
      if (e) {
        if (typeof e != 'string')
          throw new _(
            `Invalid value ${JSON.stringify(e)} for "errorFormat" provided to PrismaClient constructor.`
          );
        if (!Ro.includes(e)) {
          let t = nt(e, Ro);
          throw new _(`Invalid errorFormat ${e} provided to PrismaClient constructor.${t}`);
        }
      }
    },
    log: e => {
      if (!e) return;
      if (!Array.isArray(e))
        throw new _(
          `Invalid value ${JSON.stringify(e)} for "log" provided to PrismaClient constructor.`
        );
      function t(r) {
        if (typeof r == 'string' && !Ao.includes(r)) {
          let n = nt(r, Ao);
          throw new _(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
        }
      }
      for (let r of e) {
        t(r);
        let n = {
          level: t,
          emit: i => {
            let o = ['stdout', 'event'];
            if (!o.includes(i)) {
              let s = nt(i, o);
              throw new _(
                `Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`
              );
            }
          },
        };
        if (r && typeof r == 'object')
          for (let [i, o] of Object.entries(r))
            if (n[i]) n[i](o);
            else
              throw new _(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
      }
    },
    transactionOptions: e => {
      if (!e) return;
      let t = e.maxWait;
      if (t != null && t <= 0)
        throw new _(
          `Invalid value ${t} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`
        );
      let r = e.timeout;
      if (r != null && r <= 0)
        throw new _(
          `Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`
        );
    },
    omit: (e, t) => {
      if (typeof e != 'object') throw new _('"omit" option is expected to be an object.');
      if (e === null) throw new _('"omit" option can not be `null`');
      let r = [];
      for (let [n, i] of Object.entries(e)) {
        let o = rl(n, t.runtimeDataModel);
        if (!o) {
          r.push({ kind: 'UnknownModel', modelKey: n });
          continue;
        }
        for (let [s, a] of Object.entries(i)) {
          let u = o.fields.find(g => g.name === s);
          if (!u) {
            r.push({ kind: 'UnknownField', modelKey: n, fieldName: s });
            continue;
          }
          if (u.relationName) {
            r.push({ kind: 'RelationInOmit', modelKey: n, fieldName: s });
            continue;
          }
          typeof a != 'boolean' && r.push({ kind: 'InvalidFieldValue', modelKey: n, fieldName: s });
        }
      }
      if (r.length > 0) throw new _(nl(e, r));
    },
    __internal: e => {
      if (!e) return;
      let t = ['debug', 'engine', 'configOverride'];
      if (typeof e != 'object')
        throw new _(
          `Invalid value ${JSON.stringify(e)} for "__internal" to PrismaClient constructor`
        );
      for (let [r] of Object.entries(e))
        if (!t.includes(r)) {
          let n = nt(r, t);
          throw new _(
            `Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`
          );
        }
    },
  };
function ko(e, t) {
  for (let [r, n] of Object.entries(e)) {
    if (!Co.includes(r)) {
      let i = nt(r, Co);
      throw new _(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
    }
    el[r](n, t);
  }
  if (e.datasourceUrl && e.datasources)
    throw new _(
      'Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them'
    );
}
function nt(e, t) {
  if (t.length === 0 || typeof e != 'string') return '';
  let r = tl(e, t);
  return r ? ` Did you mean "${r}"?` : '';
}
function tl(e, t) {
  if (t.length === 0) return null;
  let r = t.map(i => ({ value: i, distance: (0, Oo.default)(e, i) }));
  r.sort((i, o) => (i.distance < o.distance ? -1 : 1));
  let n = r[0];
  return n.distance < 3 ? n.value : null;
}
function rl(e, t) {
  return So(t.models, e) ?? So(t.types, e);
}
function So(e, t) {
  let r = Object.keys(e).find(n => Ve(n) === t);
  if (r) return e[r];
}
function nl(e, t) {
  let r = Ye(e);
  for (let o of t)
    switch (o.kind) {
      case 'UnknownModel':
        (r.arguments.getField(o.modelKey)?.markAsError(),
          r.addErrorMessage(() => `Unknown model name: ${o.modelKey}.`));
        break;
      case 'UnknownField':
        (r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(),
          r.addErrorMessage(
            () => `Model "${o.modelKey}" does not have a field named "${o.fieldName}".`
          ));
        break;
      case 'RelationInOmit':
        (r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(),
          r.addErrorMessage(
            () => 'Relations are already excluded by default and can not be specified in "omit".'
          ));
        break;
      case 'InvalidFieldValue':
        (r.arguments.getDeepFieldValue([o.modelKey, o.fieldName])?.markAsError(),
          r.addErrorMessage(() => 'Omit field option value must be a boolean.'));
        break;
    }
  let { message: n, args: i } = Ht(r, 'colorless');
  return `Error validating "omit" option:

${i}

${n}`;
}
c();
m();
p();
d();
f();
l();
function Mo(e) {
  return e.length === 0
    ? Promise.resolve([])
    : new Promise((t, r) => {
        let n = new Array(e.length),
          i = null,
          o = !1,
          s = 0,
          a = () => {
            o || (s++, s === e.length && ((o = !0), i ? r(i) : t(n)));
          },
          u = g => {
            o || ((o = !0), r(g));
          };
        for (let g = 0; g < e.length; g++)
          e[g].then(
            T => {
              ((n[g] = T), a());
            },
            T => {
              if (!mr(T)) {
                u(T);
                return;
              }
              T.batchRequestIdx === g ? u(T) : (i || (i = T), a());
            }
          );
      });
}
var Re = ee('prisma:client');
typeof globalThis == 'object' && (globalThis.NODE_CLIENT = !0);
var il = { requestArgsToMiddlewareArgs: e => e, middlewareArgsToRequestArgs: e => e },
  ol = Symbol.for('prisma.client.transaction.id'),
  sl = {
    id: 0,
    nextId() {
      return ++this.id;
    },
  };
function _o(e) {
  class t {
    constructor(n) {
      this._originalClient = this;
      this._middlewares = new cr();
      this._createPrismaPromise = Xr();
      this.$extends = Ni;
      ((e = n?.__internal?.configOverride?.(e) ?? e), zi(e), n && ko(n, e));
      let i = new Ut().on('error', () => {});
      ((this._extensions = Xe.empty()),
        (this._previewFeatures = ur(e)),
        (this._clientVersion = e.clientVersion ?? To),
        (this._activeProvider = e.activeProvider),
        (this._globalOmit = n?.omit),
        (this._tracingHelper = go(this._previewFeatures)));
      let o = {
          rootEnvPath:
            e.relativeEnvPaths.rootEnvPath && st.resolve(e.dirname, e.relativeEnvPaths.rootEnvPath),
          schemaEnvPath:
            e.relativeEnvPaths.schemaEnvPath &&
            st.resolve(e.dirname, e.relativeEnvPaths.schemaEnvPath),
        },
        s;
      if (n?.adapter) {
        s = $r(n.adapter);
        let u = e.activeProvider === 'postgresql' ? 'postgres' : e.activeProvider;
        if (s.provider !== u)
          throw new L(
            `The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${u}\` specified in the Prisma schema.`,
            this._clientVersion
          );
        if (n.datasources || n.datasourceUrl !== void 0)
          throw new L(
            'Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.',
            this._clientVersion
          );
      }
      let a = e.injectableEdgeEnv?.();
      try {
        let u = n ?? {},
          g = u.__internal ?? {},
          T = g.debug === !0;
        T && ee.enable('prisma:client');
        let C = st.resolve(e.dirname, e.relativePath);
        (yn.existsSync(C) || (C = e.dirname),
          Re('dirname', e.dirname),
          Re('relativePath', e.relativePath),
          Re('cwd', C));
        let O = g.engine || {};
        if (
          (u.errorFormat
            ? (this._errorFormat = u.errorFormat)
            : h.env.NODE_ENV === 'production'
              ? (this._errorFormat = 'minimal')
              : h.env.NO_COLOR
                ? (this._errorFormat = 'colorless')
                : (this._errorFormat = 'colorless'),
          (this._runtimeDataModel = e.runtimeDataModel),
          (this._engineConfig = {
            cwd: C,
            dirname: e.dirname,
            enableDebugLogs: T,
            allowTriggerPanic: O.allowTriggerPanic,
            datamodelPath: st.join(e.dirname, e.filename ?? 'schema.prisma'),
            prismaPath: O.binaryPath ?? void 0,
            engineEndpoint: O.endpoint,
            generator: e.generator,
            showColors: this._errorFormat === 'pretty',
            logLevel: u.log && yo(u.log),
            logQueries:
              u.log &&
              !!(typeof u.log == 'string'
                ? u.log === 'query'
                : u.log.find(A => (typeof A == 'string' ? A === 'query' : A.level === 'query'))),
            env: a?.parsed ?? {},
            flags: [],
            engineWasm: e.engineWasm,
            clientVersion: e.clientVersion,
            engineVersion: e.engineVersion,
            previewFeatures: this._previewFeatures,
            activeProvider: e.activeProvider,
            inlineSchema: e.inlineSchema,
            overrideDatasources: Yi(u, e.datasourceNames),
            inlineDatasources: e.inlineDatasources,
            inlineSchemaHash: e.inlineSchemaHash,
            tracingHelper: this._tracingHelper,
            transactionOptions: {
              maxWait: u.transactionOptions?.maxWait ?? 2e3,
              timeout: u.transactionOptions?.timeout ?? 5e3,
              isolationLevel: u.transactionOptions?.isolationLevel,
            },
            logEmitter: i,
            isBundled: e.isBundled,
            adapter: s,
          }),
          (this._accelerateEngineConfig = {
            ...this._engineConfig,
            accelerateUtils: {
              resolveDatasourceUrl: ar,
              getBatchRequestPayload: nr,
              prismaGraphQLToJSError: ir,
              PrismaClientUnknownRequestError: G,
              PrismaClientInitializationError: L,
              PrismaClientKnownRequestError: J,
              debug: ee('prisma:client:accelerateEngine'),
              engineVersion: Lo.version,
              clientVersion: e.clientVersion,
            },
          }),
          Re('clientVersion', e.clientVersion),
          (this._engine = to(e, this._engineConfig)),
          (this._requestHandler = new dr(this, i)),
          u.log)
        )
          for (let A of u.log) {
            let M = typeof A == 'string' ? A : A.emit === 'stdout' ? A.level : null;
            M &&
              this.$on(M, S => {
                ut.log(`${ut.tags[M] ?? ''}`, S.message || S.query);
              });
          }
        this._metrics = new Ze(this._engine);
      } catch (u) {
        throw ((u.clientVersion = this._clientVersion), u);
      }
      return (this._appliedParent = Tt(this));
    }
    get [Symbol.toStringTag]() {
      return 'PrismaClient';
    }
    $use(n) {
      this._middlewares.use(n);
    }
    $on(n, i) {
      n === 'beforeExit'
        ? this._engine.onBeforeExit(i)
        : n && this._engineConfig.logEmitter.on(n, i);
    }
    $connect() {
      try {
        return this._engine.start();
      } catch (n) {
        throw ((n.clientVersion = this._clientVersion), n);
      }
    }
    async $disconnect() {
      try {
        await this._engine.stop();
      } catch (n) {
        throw ((n.clientVersion = this._clientVersion), n);
      } finally {
        Mn();
      }
    }
    $executeRawInternal(n, i, o, s) {
      let a = this._activeProvider;
      return this._request({
        action: 'executeRaw',
        args: o,
        transaction: n,
        clientMethod: i,
        argsMapper: Yr({ clientMethod: i, activeProvider: a }),
        callsite: Te(this._errorFormat),
        dataPath: [],
        middlewareArgsMapper: s,
      });
    }
    $executeRaw(n, ...i) {
      return this._createPrismaPromise(o => {
        if (n.raw !== void 0 || n.sql !== void 0) {
          let [s, a] = Io(n, i);
          return (
            zr(
              this._activeProvider,
              s.text,
              s.values,
              Array.isArray(n) ? 'prisma.$executeRaw`<SQL>`' : 'prisma.$executeRaw(sql`<SQL>`)'
            ),
            this.$executeRawInternal(o, '$executeRaw', s, a)
          );
        }
        throw new j(
          "`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n",
          { clientVersion: this._clientVersion }
        );
      });
    }
    $executeRawUnsafe(n, ...i) {
      return this._createPrismaPromise(
        o => (
          zr(this._activeProvider, n, i, 'prisma.$executeRawUnsafe(<SQL>, [...values])'),
          this.$executeRawInternal(o, '$executeRawUnsafe', [n, ...i])
        )
      );
    }
    $runCommandRaw(n) {
      if (e.activeProvider !== 'mongodb')
        throw new j(
          `The ${e.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`,
          { clientVersion: this._clientVersion }
        );
      return this._createPrismaPromise(i =>
        this._request({
          args: n,
          clientMethod: '$runCommandRaw',
          dataPath: [],
          action: 'runCommandRaw',
          argsMapper: ro,
          callsite: Te(this._errorFormat),
          transaction: i,
        })
      );
    }
    async $queryRawInternal(n, i, o, s) {
      let a = this._activeProvider;
      return this._request({
        action: 'queryRaw',
        args: o,
        transaction: n,
        clientMethod: i,
        argsMapper: Yr({ clientMethod: i, activeProvider: a }),
        callsite: Te(this._errorFormat),
        dataPath: [],
        middlewareArgsMapper: s,
      });
    }
    $queryRaw(n, ...i) {
      return this._createPrismaPromise(o => {
        if (n.raw !== void 0 || n.sql !== void 0)
          return this.$queryRawInternal(o, '$queryRaw', ...Io(n, i));
        throw new j(
          "`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n",
          { clientVersion: this._clientVersion }
        );
      });
    }
    $queryRawTyped(n) {
      return this._createPrismaPromise(i => {
        if (!this._hasPreviewFlag('typedSql'))
          throw new j(
            '`typedSql` preview feature must be enabled in order to access $queryRawTyped API',
            { clientVersion: this._clientVersion }
          );
        return this.$queryRawInternal(i, '$queryRawTyped', n);
      });
    }
    $queryRawUnsafe(n, ...i) {
      return this._createPrismaPromise(o =>
        this.$queryRawInternal(o, '$queryRawUnsafe', [n, ...i])
      );
    }
    _transactionWithArray({ promises: n, options: i }) {
      let o = sl.nextId(),
        s = ho(n.length),
        a = n.map((u, g) => {
          if (u?.[Symbol.toStringTag] !== 'PrismaPromise')
            throw new Error(
              'All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.'
            );
          let T = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel,
            C = { kind: 'batch', id: o, index: g, isolationLevel: T, lock: s };
          return u.requestTransaction?.(C) ?? u;
        });
      return Mo(a);
    }
    async _transactionWithCallback({ callback: n, options: i }) {
      let o = { traceparent: this._tracingHelper.getTraceParent() },
        s = {
          maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait,
          timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout,
          isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel,
        },
        a = await this._engine.transaction('start', o, s),
        u;
      try {
        let g = { kind: 'itx', ...a };
        ((u = await n(this._createItxClient(g))), await this._engine.transaction('commit', o, a));
      } catch (g) {
        throw (await this._engine.transaction('rollback', o, a).catch(() => {}), g);
      }
      return u;
    }
    _createItxClient(n) {
      return Tt(
        ge(Fi(this), [
          H('_appliedParent', () => this._appliedParent._createItxClient(n)),
          H('_createPrismaPromise', () => Xr(n)),
          H(ol, () => n.id),
          et(lo),
        ])
      );
    }
    $transaction(n, i) {
      let o;
      typeof n == 'function'
        ? this._engineConfig.adapter?.adapterName === '@prisma/adapter-d1'
          ? (o = () => {
              throw new Error(
                'Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.'
              );
            })
          : (o = () => this._transactionWithCallback({ callback: n, options: i }))
        : (o = () => this._transactionWithArray({ promises: n, options: i }));
      let s = { name: 'transaction', attributes: { method: '$transaction' } };
      return this._tracingHelper.runInChildSpan(s, o);
    }
    _request(n) {
      n.otelParentCtx = this._tracingHelper.getActiveContext();
      let i = n.middlewareArgsMapper ?? il,
        o = {
          args: i.requestArgsToMiddlewareArgs(n.args),
          dataPath: n.dataPath,
          runInTransaction: !!n.transaction,
          action: n.action,
          model: n.model,
        },
        s = {
          middleware: {
            name: 'middleware',
            middleware: !0,
            attributes: { method: '$use' },
            active: !1,
          },
          operation: {
            name: 'operation',
            attributes: {
              method: o.action,
              model: o.model,
              name: o.model ? `${o.model}.${o.action}` : o.action,
            },
          },
        },
        a = -1,
        u = async g => {
          let T = this._middlewares.get(++a);
          if (T)
            return this._tracingHelper.runInChildSpan(s.middleware, I =>
              T(g, ne => (I?.end(), u(ne)))
            );
          let { runInTransaction: C, args: O, ...A } = g,
            M = { ...n, ...A };
          (O && (M.args = i.middlewareArgsToRequestArgs(O)),
            n.transaction !== void 0 && C === !1 && delete M.transaction);
          let S = await Qi(this, M);
          return M.model
            ? Bi({
                result: S,
                modelName: M.model,
                args: M.args,
                extensions: this._extensions,
                runtimeDataModel: this._runtimeDataModel,
                globalOmit: this._globalOmit,
              })
            : S;
        };
      return this._tracingHelper.runInChildSpan(s.operation, () => u(o));
    }
    async _executeRequest({
      args: n,
      clientMethod: i,
      dataPath: o,
      callsite: s,
      action: a,
      model: u,
      argsMapper: g,
      transaction: T,
      unpacker: C,
      otelParentCtx: O,
      customDataProxyFetch: A,
    }) {
      try {
        n = g ? g(n) : n;
        let M = { name: 'serialize' },
          S = this._tracingHelper.runInChildSpan(M, () =>
            Zt({
              modelName: u,
              runtimeDataModel: this._runtimeDataModel,
              action: a,
              args: n,
              clientMethod: i,
              callsite: s,
              extensions: this._extensions,
              errorFormat: this._errorFormat,
              clientVersion: this._clientVersion,
              previewFeatures: this._previewFeatures,
              globalOmit: this._globalOmit,
            })
          );
        return (
          ee.enabled('prisma:client') &&
            (Re('Prisma Client call:'),
            Re(`prisma.${i}(${Ci(n)})`),
            Re('Generated request:'),
            Re(
              JSON.stringify(S, null, 2) +
                `
`
            )),
          T?.kind === 'batch' && (await T.lock),
          this._requestHandler.request({
            protocolQuery: S,
            modelName: u,
            action: a,
            clientMethod: i,
            dataPath: o,
            callsite: s,
            args: n,
            extensions: this._extensions,
            transaction: T,
            unpacker: C,
            otelParentCtx: O,
            otelChildCtx: this._tracingHelper.getActiveContext(),
            globalOmit: this._globalOmit,
            customDataProxyFetch: A,
          })
        );
      } catch (M) {
        throw ((M.clientVersion = this._clientVersion), M);
      }
    }
    get $metrics() {
      if (!this._hasPreviewFlag('metrics'))
        throw new j('`metrics` preview feature must be enabled in order to access metrics API', {
          clientVersion: this._clientVersion,
        });
      return this._metrics;
    }
    _hasPreviewFlag(n) {
      return !!this._engineConfig.previewFeatures?.includes(n);
    }
    $applyPendingMigrations() {
      return this._engine.applyPendingMigrations();
    }
  }
  return t;
}
function Io(e, t) {
  return al(e) ? [new X(e, t), co] : [e, mo];
}
function al(e) {
  return Array.isArray(e) && Array.isArray(e.raw);
}
c();
m();
p();
d();
f();
l();
var ll = new Set([
  'toJSON',
  '$$typeof',
  'asymmetricMatch',
  Symbol.iterator,
  Symbol.toStringTag,
  Symbol.isConcatSpreadable,
  Symbol.toPrimitive,
]);
function Do(e) {
  return new Proxy(e, {
    get(t, r) {
      if (r in t) return t[r];
      if (!ll.has(r)) throw new TypeError(`Invalid enum value: ${String(r)}`);
    },
  });
}
c();
m();
p();
d();
f();
l();
l();
0 &&
  (module.exports = {
    Debug,
    Decimal,
    Extensions,
    MetricsClient,
    NotFoundError,
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError,
    Public,
    Sql,
    defineDmmfProperty,
    deserializeJsonResponse,
    dmmfToRuntimeDataModel,
    empty,
    getPrismaClient,
    getRuntime,
    join,
    makeStrictEnum,
    makeTypedQueryFactory,
    objectEnumValues,
    raw,
    serializeJsonQuery,
    skip,
    sqltag,
    warnEnvConflicts,
    warnOnce,
  });
//# sourceMappingURL=wasm.js.map
