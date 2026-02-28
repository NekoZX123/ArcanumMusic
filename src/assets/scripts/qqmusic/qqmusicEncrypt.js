// // 模拟 `window` 对象
// const window = {
//     location: {
//         host: 'https://y.qq.com',
//         href: 'https://y.qq.com/n/ryqq/'
//     },
//     navigator: {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
//     },
//     document: {}
// };

// global.window = window;
// global.document = window.document;
// global.location = window.location;
// global.navigator = window.navigator;

let calcSign, cgiEncrypt, cgiDecrypt;

//https://y.qq.com/ryqq/js/vendor.chunk.xxx.js
function x(e, t, n) {
    "use strict";
    (function (e) {
        var ne = "undefined" !== typeof e ? e : "undefined" !== typeof window ? window : "undefined" !== typeof self ? self : void 0
          , re = function(e) {
            return e && "undefined" != typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e
        };
        (function() {
            var e = function(e, t, n) {
                for (var r = [], i = 0; i++ < t; )
                    r.push(e += n);
                return r
            }
              , t = function(e) {
                for (var t, n, r = String(e).replace(/[=]+$/, ""), o = r.length, a = 0, s = 0, u = []; s < o; s++)
                    ~(n = i[r.charCodeAt(s)]) && (t = a % 4 ? 64 * t + n : n,
                    a++ % 4) && u.push(255 & t >> (-2 * a & 6));
                return u
            }
              , n = function(e) {
                return e >> 1 ^ -(1 & e)
            }
              , r = []
              , i = e(0, 43, 0).concat([62, 0, 62, 0, 63]).concat(e(51, 10, 1)).concat(e(0, 8, 0)).concat(e(0, 25, 1)).concat([0, 0, 0, 0, 63, 0]).concat(e(25, 26, 1))
              , o = function(e) {
                for (var r = [], i = new Int8Array(t(e)), o = i.length, a = 0; o > a; ) {
                    var s = i[a++]
                      , u = 127 & s;
                    s >= 0 ? r.push(n(u)) : (u |= (127 & (s = i[a++])) << 7,
                    s >= 0 || (u |= (127 & (s = i[a++])) << 14,
                    s >= 0 || (u |= (127 & (s = i[a++])) << 21,
                    s >= 0 || (u |= (s = i[a++]) << 28))),
                    r.push(n(u)))
                }
                return r
            };
            return function(e, t) {
                var n = o(e)
                  , i = function(e, t, o, s, u) {
                    return function c() {
                        for (var l, f, h = [o, s, t, this, arguments, c, n, 0], d = void 0, p = e, g = []; ; )
                            try {
                                for (; ; )
                                    switch (n[++p]) {
                                    case 0:
                                        h[n[++p]] = new h[n[++p]](h[n[++p]]);
                                        break;
                                    case 1:
                                        return h[n[++p]];
                                    case 2:
                                        for (l = [],
                                        f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = a(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (m) {}
                                        break;
                                    case 3:
                                        h[n[++p]] = h[n[++p]] < h[n[++p]];
                                        break;
                                    case 4:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 5:
                                        h[n[++p]] = h[n[++p]] >= n[++p];
                                        break;
                                    case 6:
                                        h[n[++p]] = h[n[++p]] >> n[++p],
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 7:
                                        h[n[++p]] = h[n[++p]] < n[++p];
                                        break;
                                    case 8:
                                        h[n[++p]] = h[n[++p]].call(d);
                                        break;
                                    case 9:
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 10:
                                        h[n[++p]] = h[n[++p]] | n[++p];
                                        break;
                                    case 11:
                                        h[n[++p]] = h[n[++p]] & n[++p],
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 12:
                                        h[n[++p]] = {};
                                        break;
                                    case 13:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 14:
                                        h[n[++p]] = d;
                                        break;
                                    case 15:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 16:
                                        h[n[++p]] = !0;
                                        break;
                                    case 17:
                                        h[n[++p]] = h[n[++p]] === h[n[++p]];
                                        break;
                                    case 18:
                                        h[n[++p]] = h[n[++p]] / h[n[++p]];
                                        break;
                                    case 19:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 20:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 21:
                                        h[n[++p]] = h[n[++p]] * h[n[++p]];
                                        break;
                                    case 22:
                                        h[n[++p]] = ++h[n[++p]],
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 23:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 24:
                                        h[n[++p]] = h[n[++p]] << n[++p];
                                        break;
                                    case 25:
                                        h[n[++p]] = re(h[n[++p]]);
                                        break;
                                    case 26:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]];
                                        break;
                                    case 27:
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 28:
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 29:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 30:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]], h[n[++p]]);
                                        break;
                                    case 31:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]] = n[++p],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 32:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 33:
                                        h[n[++p]] = h[n[++p]] === n[++p];
                                        break;
                                    case 34:
                                        h[n[++p]] = h[n[++p]] + n[++p];
                                        break;
                                    case 35:
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 36:
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 37:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 38:
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 39:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]] === h[n[++p]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 40:
                                        h[n[++p]] = h[n[++p]] > h[n[++p]];
                                        break;
                                    case 41:
                                        h[n[++p]] = h[n[++p]] - h[n[++p]];
                                        break;
                                    case 42:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]];
                                        break;
                                    case 43:
                                        h[n[++p]] = h[n[++p]] & h[n[++p]];
                                        break;
                                    case 44:
                                        h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 45:
                                        h[n[++p]] = -h[n[++p]];
                                        break;
                                    case 46:
                                        for (l = [],
                                        f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (v) {}
                                        break;
                                    case 47:
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 48:
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 49:
                                        h[n[++p]] = ~h[n[++p]];
                                        break;
                                    case 50:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]]);
                                        break;
                                    case 51:
                                        h[n[++p]] = h[n[++p]] ^ h[n[++p]];
                                        break;
                                    case 52:
                                        h[n[++p]] = ++h[n[++p]];
                                        break;
                                    case 53:
                                        h[n[++p]] = !1;
                                        break;
                                    case 54:
                                        h[n[++p]] = h[n[++p]] >>> n[++p];
                                        break;
                                    case 55:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 56:
                                        h[n[++p]] = Array(n[++p]);
                                        break;
                                    case 57:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 58:
                                        h[n[++p]] = h[n[++p]] % h[n[++p]];
                                        break;
                                    case 59:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 60:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 61:
                                        h[n[++p]] = h[n[++p]] - n[++p];
                                        break;
                                    case 62:
                                        h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 63:
                                        h[n[++p]] = !h[n[++p]];
                                        break;
                                    case 64:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 65:
                                        for (h[n[++p]] += String.fromCharCode(n[++p]),
                                        l = [],
                                        f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (y) {}
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 66:
                                        h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 67:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]]);
                                        break;
                                    case 68:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]],
                                        h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 69:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 70:
                                        h[n[++p]] = n[++p] + h[n[++p]];
                                        break;
                                    case 71:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]],
                                        h[n[++p]] = h[n[++p]] | h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 72:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]], h[n[++p]]);
                                        break;
                                    case 73:
                                        h[n[++p]] = h[n[++p]] >> n[++p];
                                        break;
                                    case 74:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 75:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 76:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]]);
                                        break;
                                    case 77:
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 78:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 79:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]] >> n[++p],
                                        h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 80:
                                        h[n[++p]] = "";
                                        break;
                                    case 81:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 82:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)]
                                    }
                            } catch (A) {
                                if (g.length > 0 && (r = []),
                                r.push(p),
                                0 === g.length)
                                    throw u ? u(A, h, r) : A;
                                p = g.pop(),
                                r.pop()
                            }
                    }
                }
                  , a = function(e, t, o, s, u) {
                    return function c() {
                        for (var l, f, h = [o, s, t, this, arguments, c, n, 0], d = void 0, p = e, g = []; ; )
                            try {
                                for (; ; )
                                    switch (n[++p]) {
                                    case 0:
                                        h[n[++p]] = new h[n[++p]](h[n[++p]]);
                                        break;
                                    case 1:
                                        return h[n[++p]];
                                    case 2:
                                        for (l = [],
                                        f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = a(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (m) {}
                                        break;
                                    case 3:
                                        h[n[++p]] = h[n[++p]] < h[n[++p]];
                                        break;
                                    case 4:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 5:
                                        h[n[++p]] = h[n[++p]] >= n[++p];
                                        break;
                                    case 6:
                                        h[n[++p]] = h[n[++p]] >> n[++p],
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 7:
                                        h[n[++p]] = h[n[++p]] < n[++p];
                                        break;
                                    case 8:
                                        h[n[++p]] = h[n[++p]].call(d);
                                        break;
                                    case 9:
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 10:
                                        h[n[++p]] = h[n[++p]] | n[++p];
                                        break;
                                    case 11:
                                        h[n[++p]] = h[n[++p]] & n[++p],
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 12:
                                        h[n[++p]] = {};
                                        break;
                                    case 13:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 14:
                                        h[n[++p]] = d;
                                        break;
                                    case 15:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 16:
                                        h[n[++p]] = !0;
                                        break;
                                    case 17:
                                        h[n[++p]] = h[n[++p]] === h[n[++p]];
                                        break;
                                    case 18:
                                        h[n[++p]] = h[n[++p]] / h[n[++p]];
                                        break;
                                    case 19:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 20:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 21:
                                        h[n[++p]] = h[n[++p]] * h[n[++p]];
                                        break;
                                    case 22:
                                        h[n[++p]] = ++h[n[++p]],
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 23:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 24:
                                        h[n[++p]] = h[n[++p]] << n[++p];
                                        break;
                                    case 25:
                                        h[n[++p]] = re(h[n[++p]]);
                                        break;
                                    case 26:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]];
                                        break;
                                    case 27:
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 28:
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 29:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 30:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]], h[n[++p]]);
                                        break;
                                    case 31:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]] = n[++p],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 32:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 33:
                                        h[n[++p]] = h[n[++p]] === n[++p];
                                        break;
                                    case 34:
                                        h[n[++p]] = h[n[++p]] + n[++p];
                                        break;
                                    case 35:
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 36:
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 37:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 38:
                                        h[n[++p]] = "",
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 39:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]] === h[n[++p]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 40:
                                        h[n[++p]] = h[n[++p]] > h[n[++p]];
                                        break;
                                    case 41:
                                        h[n[++p]] = h[n[++p]] - h[n[++p]];
                                        break;
                                    case 42:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]];
                                        break;
                                    case 43:
                                        h[n[++p]] = h[n[++p]] & h[n[++p]];
                                        break;
                                    case 44:
                                        h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 45:
                                        h[n[++p]] = -h[n[++p]];
                                        break;
                                    case 46:
                                        for (l = [],
                                        f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (v) {}
                                        break;
                                    case 47:
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 48:
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 49:
                                        h[n[++p]] = ~h[n[++p]];
                                        break;
                                    case 50:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]]);
                                        break;
                                    case 51:
                                        h[n[++p]] = h[n[++p]] ^ h[n[++p]];
                                        break;
                                    case 52:
                                        h[n[++p]] = ++h[n[++p]];
                                        break;
                                    case 53:
                                        h[n[++p]] = !1;
                                        break;
                                    case 54:
                                        h[n[++p]] = h[n[++p]] >>> n[++p];
                                        break;
                                    case 55:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 56:
                                        h[n[++p]] = Array(n[++p]);
                                        break;
                                    case 57:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 58:
                                        h[n[++p]] = h[n[++p]] % h[n[++p]];
                                        break;
                                    case 59:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 60:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 61:
                                        h[n[++p]] = h[n[++p]] - n[++p];
                                        break;
                                    case 62:
                                        h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 63:
                                        h[n[++p]] = !h[n[++p]];
                                        break;
                                    case 64:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 65:
                                        for (h[n[++p]] += String.fromCharCode(n[++p]),
                                        l = [],
                                        f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (y) {}
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 66:
                                        h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 67:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]]);
                                        break;
                                    case 68:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]],
                                        h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 69:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 70:
                                        h[n[++p]] = n[++p] + h[n[++p]];
                                        break;
                                    case 71:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]],
                                        h[n[++p]] = h[n[++p]] | h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 72:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]], h[n[++p]]);
                                        break;
                                    case 73:
                                        h[n[++p]] = h[n[++p]] >> n[++p];
                                        break;
                                    case 74:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 75:
                                        h[n[++p]] = n[++p],
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)];
                                        break;
                                    case 76:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]]);
                                        break;
                                    case 77:
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 78:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 79:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                        h[n[++p]] = h[n[++p]] >> n[++p],
                                        h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 80:
                                        h[n[++p]] = "";
                                        break;
                                    case 81:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 82:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                        ++p)]
                                    }
                            } catch (A) {
                                if (g.length > 0 && (r = []),
                                r.push(p),
                                0 === g.length)
                                    throw u ? u(A, h, r) : A;
                                p = g.pop(),
                                r.pop()
                            }
                    }
                };
                return t ? i : a
            }
        }
        )()("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", !1)(3944, [], ne, [void 0, 1732584193, 4023233417, 2562383102, 3285377520, !1, !0, 2147483648, 4294967295, 4294967296, 1518500249, 1859775393, 1894007588], void 0)();
        var ie = ne._getSecuritySign;

        //////////////////////////////////

        // 获取 getSecutirySign()
        calcSign = ne._getSecuritySign;

        //////////////////////////////////

        var oe = "undefined" !== typeof e ? e : "undefined" !== typeof window ? window : "undefined" !== typeof self ? self : void 0;
        (function() {
            var e = [];
            function t(e, t, n) {
                for (var r = [], i = 0; i++ < t; )
                    r.push(e += n);
                return r
            }
            var n = t(0, 43, 0).concat([62, 0, 62, 0, 63]).concat(t(51, 10, 1)).concat(t(0, 8, 0)).concat(t(0, 25, 1)).concat([0, 0, 0, 0, 63, 0]).concat(t(25, 26, 1));
            function r(e) {
                for (var t, r, i = String(e).replace(/[=]+$/, ""), o = i.length, a = 0, s = 0, u = []; s < o; s++)
                    ~(r = n[i.charCodeAt(s)]) && (t = a % 4 ? 64 * t + r : r,
                    a++ % 4) && u.push(255 & t >> (-2 * a & 6));
                return u
            }
            function i(e) {
                return e >> 1 ^ -(1 & e)
            }
            var o = function(e) {
                for (var t = [], n = "undefined" != typeof Int8Array ? new Int8Array(r(e)) : r(e), o = n.length, a = 0; o > a; ) {
                    var s = n[a++]
                      , u = 127 & s;
                    s >= 0 ? t.push(i(u)) : (u |= (127 & (s = n[a++])) << 7,
                    s >= 0 || (u |= (127 & (s = n[a++])) << 14,
                    s >= 0 || (u |= (127 & (s = n[a++])) << 21,
                    s >= 0 || (u |= (s = n[a++]) << 28))),
                    t.push(i(u)))
                }
                return t
            };
            return function(t, n) {
                var r = o(t)
                  , i = function(t, n, o, s, u) {
                    return function c() {
                        for (var l, f, h = [o, s, n, this, arguments, c, r, 0], d = void 0, p = t, g = []; ; )
                            try {
                                for (; ; )
                                    switch (r[++p]) {
                                    case 0:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 1:
                                        h[r[++p]] = !1;
                                        break;
                                    case 2:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 3:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 4:
                                        h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 5:
                                        h[r[++p]] = h[r[++p]] | h[r[++p]];
                                        break;
                                    case 6:
                                        for (l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) {}
                                        break;
                                    case 7:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 8:
                                        h[r[++p]] = h[r[++p]] - 0;
                                        break;
                                    case 9:
                                        h[r[++p]] = h[r[++p]] ^ h[r[++p]];
                                        break;
                                    case 10:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                        h[r[++p]] = r[++p],
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 11:
                                        h[r[++p]] = new h[r[++p]];
                                        break;
                                    case 12:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 13:
                                        for (l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = a(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) {}
                                        break;
                                    case 14:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = Array(r[++p]),
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 15:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 16:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]]);
                                        break;
                                    case 17:
                                        return h[r[++p]];
                                    case 18:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 19:
                                        h[r[++p]] = h[r[++p]] + h[r[++p]],
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 20:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 21:
                                        h[r[++p]] = h[r[++p]] + r[++p];
                                        break;
                                    case 22:
                                        h[r[++p]] = new h[r[++p]](h[r[++p]]);
                                        break;
                                    case 23:
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 24:
                                        h[r[++p]][h[r[++p]]] = h[r[++p]];
                                        break;
                                    case 25:
                                        h[r[++p]] = "",
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 26:
                                        h[r[++p]] = ++h[r[++p]];
                                        break;
                                    case 27:
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 28:
                                        h[r[++p]] = "";
                                        break;
                                    case 29:
                                        for (l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = h[r[++p]].apply(h[r[++p]], l);
                                        break;
                                    case 30:
                                        h[r[++p]] = h[r[++p]].call(d);
                                        break;
                                    case 31:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]] >> r[++p],
                                        h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 32:
                                        h[r[++p]] = typeof h[r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 33:
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 34:
                                        h[r[++p]] = null;
                                        break;
                                    case 35:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 36:
                                        h[r[++p]] = d;
                                        break;
                                    case 37:
                                        for (h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) {}
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 38:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 39:
                                        h[r[++p]] = r[++p],
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 40:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 41:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]], h[r[++p]]);
                                        break;
                                    case 42:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = typeof h[r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 43:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = r[++p],
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 44:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 45:
                                        h[r[++p]] = h[r[++p]] << r[++p];
                                        break;
                                    case 46:
                                        return h[r[++p]] = d,
                                        h[r[++p]];
                                    case 47:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]] < h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 48:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 49:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 50:
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 51:
                                        h[r[++p]] = !0;
                                        break;
                                    case 52:
                                        h[r[++p]] = h[r[++p]] === r[++p];
                                        break;
                                    case 53:
                                        h[r[++p]] = {};
                                        break;
                                    case 54:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = h[r[++p]] === h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 55:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]]);
                                        break;
                                    case 56:
                                        h[r[++p]] = r[++p];
                                        break;
                                    case 57:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 58:
                                        h[r[++p]] = Array(r[++p]);
                                        break;
                                    case 59:
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 60:
                                        h[r[++p]] = h[r[++p]] % h[r[++p]];
                                        break;
                                    case 61:
                                        h[r[++p]] = h[r[++p]] < h[r[++p]];
                                        break;
                                    case 62:
                                        h[r[++p]] = -h[r[++p]];
                                        break;
                                    case 63:
                                        h[r[++p]] = h[r[++p]] === h[r[++p]];
                                        break;
                                    case 64:
                                        h[r[++p]] = r[++p],
                                        h[r[++p]] = h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 65:
                                        h[r[++p]] = h[r[++p]] > h[r[++p]];
                                        break;
                                    case 66:
                                        h[r[++p]] = h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 67:
                                        h[r[++p]] = !h[r[++p]];
                                        break;
                                    case 68:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]] + r[++p],
                                        h[r[++p]] = ""
                                    }
                            } catch (t) {
                                if (g.length > 0 && (e = []),
                                e.push(p),
                                0 === g.length)
                                    throw u ? u(t, h, e) : t;
                                p = g.pop(),
                                e.pop()
                            }
                    }
                }
                  , a = function(t, n, o, s, u) {
                    return function c() {
                        for (var l, f, h = [o, s, n, this, arguments, c, r, 0], d = void 0, p = t, g = []; ; )
                            try {
                                for (; ; )
                                    switch (r[++p]) {
                                    case 0:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 1:
                                        h[r[++p]] = !1;
                                        break;
                                    case 2:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 3:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 4:
                                        h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 5:
                                        h[r[++p]] = h[r[++p]] | h[r[++p]];
                                        break;
                                    case 6:
                                        for (l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) {}
                                        break;
                                    case 7:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 8:
                                        h[r[++p]] = h[r[++p]] - 0;
                                        break;
                                    case 9:
                                        h[r[++p]] = h[r[++p]] ^ h[r[++p]];
                                        break;
                                    case 10:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                        h[r[++p]] = r[++p],
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 11:
                                        h[r[++p]] = new h[r[++p]];
                                        break;
                                    case 12:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 13:
                                        for (l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = a(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) {}
                                        break;
                                    case 14:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = Array(r[++p]),
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 15:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 16:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]]);
                                        break;
                                    case 17:
                                        return h[r[++p]];
                                    case 18:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 19:
                                        h[r[++p]] = h[r[++p]] + h[r[++p]],
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 20:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 21:
                                        h[r[++p]] = h[r[++p]] + r[++p];
                                        break;
                                    case 22:
                                        h[r[++p]] = new h[r[++p]](h[r[++p]]);
                                        break;
                                    case 23:
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 24:
                                        h[r[++p]][h[r[++p]]] = h[r[++p]];
                                        break;
                                    case 25:
                                        h[r[++p]] = "",
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 26:
                                        h[r[++p]] = ++h[r[++p]];
                                        break;
                                    case 27:
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 28:
                                        h[r[++p]] = "";
                                        break;
                                    case 29:
                                        for (l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = h[r[++p]].apply(h[r[++p]], l);
                                        break;
                                    case 30:
                                        h[r[++p]] = h[r[++p]].call(d);
                                        break;
                                    case 31:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]] >> r[++p],
                                        h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 32:
                                        h[r[++p]] = typeof h[r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 33:
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 34:
                                        h[r[++p]] = null;
                                        break;
                                    case 35:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 36:
                                        h[r[++p]] = d;
                                        break;
                                    case 37:
                                        for (h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        l = [],
                                        f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) {}
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 38:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 39:
                                        h[r[++p]] = r[++p],
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 40:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 41:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]], h[r[++p]]);
                                        break;
                                    case 42:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = typeof h[r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 43:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = r[++p],
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 44:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 45:
                                        h[r[++p]] = h[r[++p]] << r[++p];
                                        break;
                                    case 46:
                                        return h[r[++p]] = d,
                                        h[r[++p]];
                                    case 47:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]] < h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 48:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 49:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                        h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 50:
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 51:
                                        h[r[++p]] = !0;
                                        break;
                                    case 52:
                                        h[r[++p]] = h[r[++p]] === r[++p];
                                        break;
                                    case 53:
                                        h[r[++p]] = {};
                                        break;
                                    case 54:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                        h[r[++p]] = h[r[++p]] === h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 55:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]]);
                                        break;
                                    case 56:
                                        h[r[++p]] = r[++p];
                                        break;
                                    case 57:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                        h[r[++p]] = "";
                                        break;
                                    case 58:
                                        h[r[++p]] = Array(r[++p]);
                                        break;
                                    case 59:
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 60:
                                        h[r[++p]] = h[r[++p]] % h[r[++p]];
                                        break;
                                    case 61:
                                        h[r[++p]] = h[r[++p]] < h[r[++p]];
                                        break;
                                    case 62:
                                        h[r[++p]] = -h[r[++p]];
                                        break;
                                    case 63:
                                        h[r[++p]] = h[r[++p]] === h[r[++p]];
                                        break;
                                    case 64:
                                        h[r[++p]] = r[++p],
                                        h[r[++p]] = h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 65:
                                        h[r[++p]] = h[r[++p]] > h[r[++p]];
                                        break;
                                    case 66:
                                        h[r[++p]] = h[r[++p]],
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                        ++p)];
                                        break;
                                    case 67:
                                        h[r[++p]] = !h[r[++p]];
                                        break;
                                    case 68:
                                        h[r[++p]] = h[r[++p]],
                                        h[r[++p]] = h[r[++p]] + r[++p],
                                        h[r[++p]] = ""
                                    }
                            } catch (t) {
                                if (g.length > 0 && (e = []),
                                e.push(p),
                                0 === g.length)
                                    throw u ? u(t, h, e) : t;
                                p = g.pop(),
                                e.pop()
                            }
                    }
                };
                return n ? i : a
            }
        }
        )()("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", !1)(6151, [], oe, [void 0, null, !0, !1], void 0)();
        
        var ae = oe.__cgiEncrypt
          , se = oe.__cgiDecrypt;

        //////////////////////////////////
        
        // 获取 cgiEncrypt(), cgiDecrypt()
        cgiEncrypt = oe.__cgiEncrypt;
        cgiDecrypt = oe.__cgiDecrypt;

        //////////////////////////////////

    }
    ).call(this, n(16))
}

var webpack;

!function(e) {
    function t(t) {
        for (var a, n, d = t[0], f = t[1], i = t[2], l = 0, s = []; l < d.length; l++)
            n = d[l],
            Object.prototype.hasOwnProperty.call(o, n) && o[n] && s.push(o[n][0]),
            o[n] = 0;
        for (a in f)
            Object.prototype.hasOwnProperty.call(f, a) && (e[a] = f[a]);
        for (u && u(t); s.length; )
            s.shift()();
        return c.push.apply(c, i || []),
        r()
    }
    function r() {
        for (var e, t = 0; t < c.length; t++) {
            for (var r = c[t], a = !0, n = 1; n < r.length; n++) {
                var f = r[n];
                0 !== o[f] && (a = !1)
            }
            a && (c.splice(t--, 1),
            e = d(d.s = r[0]))
        }
        return e
    }
    var a = {}
      , n = {
        22: 0
    }
      , o = {
        22: 0
    }
      , c = [];
    function d(t) {
        if (a[t])
            return a[t].exports;
        var r = a[t] = {
            i: t,
            l: !1,
            exports: {}
        };
        return e[t].call(r.exports, r, r.exports, d),
        r.l = !0,
        r.exports
    }
    d.e = function(e) {
        var t = [];
        n[e] ? t.push(n[e]) : 0 !== n[e] && {
            1: 1,
            3: 1,
            4: 1,
            5: 1,
            6: 1,
            7: 1,
            8: 1,
            9: 1,
            10: 1,
            11: 1,
            12: 1,
            13: 1,
            14: 1,
            15: 1,
            16: 1,
            17: 1,
            18: 1,
            19: 1,
            20: 1,
            21: 1,
            23: 1,
            24: 1,
            25: 1,
            26: 1,
            27: 1
        }[e] && t.push(n[e] = new Promise((function(t, r) {
            for (var a = "css/" + ({
                1: "common",
                3: "album",
                4: "albumDetail",
                5: "album_mall",
                6: "category",
                7: "cmtpage",
                8: "download_detail",
                9: "index",
                10: "msg_center",
                11: "mv",
                12: "mvList",
                13: "mv_toplist",
                14: "notfound",
                15: "player",
                16: "player_radio",
                17: "playlist",
                18: "playlist_edit",
                19: "profile",
                20: "putao_store",
                21: "radio",
                23: "search",
                24: "singer",
                25: "singer_list",
                26: "songDetail",
                27: "toplist"
            }[e] || e) + "." + {
                1: "96ad6f6b7cd07d748f31",
                3: "5cf0d69eaf29bcab23d2",
                4: "798353db5b0eb05d5358",
                5: "df4c243f917604263e58",
                6: "20d532d798099a44bc88",
                7: "e3bedf2b5810f8db0684",
                8: "559f0a2e11f1f5800b13",
                9: "c8751688d5a423f6a395",
                10: "020422608fe8bfb1719a",
                11: "8bdb1df6c5436b790baa",
                12: "47ce9300786df1b70584",
                13: "4aee33230ba2d6b81dce",
                14: "e6f63b0cf57dd029fbd6",
                15: "662de90eaaf6404101dd",
                16: "d893492de07ce97d8048",
                17: "9484fde660fe93d9f9f0",
                18: "67fb85e7f96455763c83",
                19: "5e8c651e74b13244f7cf",
                20: "19180bc6a9878c8971e4",
                21: "3befd83c10b19893ec66",
                23: "b2d11f89ea6a512a2302",
                24: "c7a38353c5f4ebb47491",
                25: "df0961952a2d3f022894",
                26: "4c080567e394fd45608b",
                27: "8edb142553f97482e00f"
            }[e] + ".chunk.css?max_age=2592000", o = d.p + a, c = document.getElementsByTagName("link"), f = 0; f < c.length; f++) {
                var i = (u = c[f]).getAttribute("data-href") || u.getAttribute("href");
                if ("stylesheet" === u.rel && (i === a || i === o))
                    return t()
            }
            var l = document.getElementsByTagName("style");
            for (f = 0; f < l.length; f++) {
                var u;
                if ((i = (u = l[f]).getAttribute("data-href")) === a || i === o)
                    return t()
            }
            var s = document.createElement("link");
            s.rel = "stylesheet",
            s.type = "text/css",
            s.onload = t,
            s.onerror = function(t) {
                var a = t && t.target && t.target.src || o
                  , c = new Error("Loading CSS chunk " + e + " failed.\n(" + a + ")");
                c.code = "CSS_CHUNK_LOAD_FAILED",
                c.request = a,
                delete n[e],
                s.parentNode.removeChild(s),
                r(c)
            }
            ,
            s.href = o,
            0 !== s.href.indexOf(window.location.origin + "/") && (s.crossOrigin = "anonymous"),
            document.getElementsByTagName("head")[0].appendChild(s)
        }
        )).then((function() {
            n[e] = 0
        }
        )));
        var r = o[e];
        if (0 !== r)
            if (r)
                t.push(r[2]);
            else {
                var a = new Promise((function(t, a) {
                    r = o[e] = [t, a]
                }
                ));
                t.push(r[2] = a);
                var c, f = document.createElement("script");
                f.charset = "utf-8",
                f.timeout = 120,
                d.nc && f.setAttribute("nonce", d.nc),
                f.src = function(e) {
                    return d.p + "js/" + ({
                        1: "common",
                        3: "album",
                        4: "albumDetail",
                        5: "album_mall",
                        6: "category",
                        7: "cmtpage",
                        8: "download_detail",
                        9: "index",
                        10: "msg_center",
                        11: "mv",
                        12: "mvList",
                        13: "mv_toplist",
                        14: "notfound",
                        15: "player",
                        16: "player_radio",
                        17: "playlist",
                        18: "playlist_edit",
                        19: "profile",
                        20: "putao_store",
                        21: "radio",
                        23: "search",
                        24: "singer",
                        25: "singer_list",
                        26: "songDetail",
                        27: "toplist"
                    }[e] || e) + ".chunk." + {
                        1: "fb1a2387f051b2c41881",
                        3: "58230f302858271cd069",
                        4: "d3094e6d281cbc087214",
                        5: "90cd0b983b63bf32de43",
                        6: "713401999c768c603095",
                        7: "dc8ccaec0bc304a09fdb",
                        8: "6b8abab5d253c1ce7dc9",
                        9: "dbe7249d116aea254235",
                        10: "cd3cf5101fd0789492dc",
                        11: "dc747147c01025d61e61",
                        12: "84175cbe9f598ad5e122",
                        13: "10489e79209b4b741b0a",
                        14: "1d89ee7186ac5cd98ca7",
                        15: "bb6d4fb9cec6e65a1aa0",
                        16: "182cad8b80d807ee56d5",
                        17: "cc544d1f2e42c362021e",
                        18: "be10c1f456f6ea2a50d0",
                        19: "819e098e787acf9fcc4c",
                        20: "206cdaa984feffe7fe2e",
                        21: "651797a5d5a8d72e0187",
                        23: "442d3c5256e36b61eb97",
                        24: "6ec16a246f6cf34cee73",
                        25: "0704b5dae4c6955d77d2",
                        26: "cf8ad40f34d5bd87679a",
                        27: "07ef39606be2fabd562c"
                    }[e] + ".js?max_age=2592000"
                }(e),
                0 !== f.src.indexOf(window.location.origin + "/") && (f.crossOrigin = "anonymous");
                var i = new Error;
                c = function(t) {
                    f.onerror = f.onload = null,
                    clearTimeout(l);
                    var r = o[e];
                    if (0 !== r) {
                        if (r) {
                            var a = t && ("load" === t.type ? "missing" : t.type)
                              , n = t && t.target && t.target.src;
                            i.message = "Loading chunk " + e + " failed.\n(" + a + ": " + n + ")",
                            i.name = "ChunkLoadError",
                            i.type = a,
                            i.request = n,
                            r[1](i)
                        }
                        o[e] = void 0
                    }
                }
                ;
                var l = setTimeout((function() {
                    c({
                        type: "timeout",
                        target: f
                    })
                }
                ), 12e4);
                f.onerror = f.onload = c,
                document.head.appendChild(f)
            }
        return Promise.all(t)
    }
    ,
    d.m = e,
    d.c = a,
    d.d = function(e, t, r) {
        d.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: r
        })
    }
    ,
    d.r = function(e) {
        "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }
    ,
    d.t = function(e, t) {
        if (1 & t && (e = d(e)),
        8 & t)
            return e;
        if (4 & t && "object" === typeof e && e && e.__esModule)
            return e;
        var r = Object.create(null);
        if (d.r(r),
        Object.defineProperty(r, "default", {
            enumerable: !0,
            value: e
        }),
        2 & t && "string" != typeof e)
            for (var a in e)
                d.d(r, a, function(t) {
                    return e[t]
                }
                .bind(null, a));
        return r
    }
    ,
    d.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        }
        : function() {
            return e
        }
        ;
        return d.d(t, "a", t),
        t
    }
    ,
    d.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }
    ,
    d.p = "/ryqq/",
    d.oe = function(e) {
        throw e
    }
    ;
    var f = window.webpackJsonp = window.webpackJsonp || []
      , i = f.push.bind(f);
    f.push = t,
    f = f.slice();
    for (var l = 0; l < f.length; l++)
        t(f[l]);
    var u = i;
    r()

    webpack = d;
}({
    350: x,
    16: function (e, t) {
        var n;
        n = function () {
            return this
        }();
        try {
            n = n || new Function("return this")()
        } catch (r) {
            "object" === typeof window && (n = window)
        }
        e.exports = n
    }
});

// 准备函数
webpack(350).default;

/**
 * QQMusic.20260227.js
 * 
 * 用于破解 QQ音乐 API 的 JS文件
 * 
 * @function getRequestParams
 * 获取 QQ音乐 请求参数加密结果
 *  @returns `Promise<object>`
 *  包含加密结果的对象
 * 
 *  对象内容: 
 *  - data: (string) - 加密后的数据
 *  - sign: (string) - 摘要签名参数
 * ```
 */
function getRequestParams(data) {
    // console.log(calcSign);
    return new Promise((resolve) => {
        cgiEncrypt(data)
            .then((encrypted) => {
                const result = {
                    data: encrypted,
                    sign: calcSign(data)
                };
                resolve(result);
            })
    });
}

function getSign(data) {
    return calcSign(data);
}

/**
 * 解密数据
 * @param {*} encryptedData 加密过的响应数据
 * @returns string - 解密后的数据
 * 
 * @deprecated 可通过删去请求 URL 中的 `encoding=ag-1` 参数来避免加密, 尽量不使用此函数 (可能无法正确解密)
 */
function decryptData(encryptedData) {
    // webpack(350).default;
    console.log(encryptedData);
    let decrypted = cgiDecrypt(encryptedData);

    return decrypted;
}

var a = function (e, t) {
    for (var n = "".concat(e).split("").reverse(), a = "".concat(t).split("").reverse(), r = [], i = n.length, o = a.length, c = 0, s = i + o - 1; c <= s; c++)
        r[c] = 0;
    for (var l = 0; l < o; l++)
        for (var u = 0; u < i; u++)
            r[u + l] += parseInt(n[u], 10) * parseInt(a[l], 10),
                r[u + 1 + l] += Math.floor(r[u + l] / 10),
                r[u + l] = r[u + l] % 10;
    return r.reverse(),
        0 == r[0] && r.shift(),
        r.join("")
}
    , r = function (e, t) {
        for (var n = "".concat(e).split("").reverse(), a = "".concat(t).split("").reverse(), r = n.length, i = a.length, o = 0, c = 0, s = 0, l = 0, u = 0, m = Math.max(r, i); u < m; u++)
            c = u < r ? parseInt(n[u], 10) : 0,
                s = u < i ? parseInt(a[u], 10) : 0,
                l = Math.round(c) + Math.round(s) + o,
                n[u] = "".concat(l % 10),
                o = l >= 10 ? 1 : 0;
        return 1 == o && n.push("1"),
            n.reverse().join("")
    }
    , i = function (e) {
        var t = a(e, "18014398509481984")
            , n = a(Math.round(Math.random() * parseInt("4194304", 10)), "4294967296")
            , i = new Date
            , o = 1e3 * (3600 * i.getHours() + 60 * i.getMinutes() + i.getSeconds()) + i.getMilliseconds();
        return r(r(t, n), o)
    }

function getSearchId(param) {
    var searchId = i(param);

    return searchId;
}

function validate() {
    const TEST_DATA = '{"comm":{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":2168979907,"g_tk_new_20200303":433675273,"g_tk":433675273},"req_1":{"module":"userInfo.VipQueryServer","method":"SRFVipQuery_V2","param":{"uin_list":["2168979907"]}},"req_2":{"module":"userInfo.BaseUserInfoServer","method":"get_user_baseinfo_v2","param":{"vec_uin":["2168979907"]}},"req_3":{"module":"music.lvz.VipIconUiShowSvr","method":"GetVipIconUiV2","param":{"PID":3}},"req_4":{"module":"music.musicasset.SongFavRead","method":"IsSongFanByMid","param":{"v_songMid":["003UlmlI0hkj8t","002tfbql3DrAe8","002p9bv72ydmlK","0038gCuw2PSkvm"]}},"req_5":{"module":"music.musichallSong.PlayLyricInfo","method":"GetPlayLyricInfo","param":{"songMID":"003UlmlI0hkj8t","songID":422658329}},"req_6":{"method":"GetCommentCount","module":"music.globalComment.GlobalCommentRead","param":{"request_list":[{"biz_type":1,"biz_id":"422658329","biz_sub_type":0}]}},"req_7":{"module":"music.musichallAlbum.AlbumInfoServer","method":"GetAlbumDetail","param":{"albumMid":"002vWow03IHAU6"}},"req_8":{"module":"music.vkey.GetEVkey","method":"GetUrl","param":{"guid":"4133620090","songmid":["003UlmlI0hkj8t"],"songtype":[0],"uin":"2168979907","loginflag":1,"platform":"20","xcdn":1,"qdesc":"lq96kOgg"}}}';
    const TARGET_SIGN = 'zzc7b3c328fmz5plbvxuwnhkz8wtlcmsgnuxc3d46896a';
    const sign = calcSign(TEST_DATA);
    
    return sign === TARGET_SIGN;
}

export { getSign, getRequestParams, getSearchId, decryptData, validate };
