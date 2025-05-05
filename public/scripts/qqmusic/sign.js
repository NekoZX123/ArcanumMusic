// File creation date: 2024.05.04

const window = {
    location: {
        host: 'https://y.qq.com',
        href: 'https://y.qq.com/n/ryqq/'
    },
    navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    },
    document: {}
};

global.window = window;
global.document = window.document;
global.location = window.location;
global.navigator = window.navigator;

let calcSign;

//https://y.qq.com/ryqq/js/vendor.chunk.84a7ebf98d5a5eb6bc5c.js
function x(e, t, n) {
    "use strict";
    (function (e) {
        var G = "undefined" !== typeof e ? e : "undefined" !== typeof window ? window : "undefined" !== typeof self ? self : void 0
            , Y = function (e) {
                return e && "undefined" != typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e
            };
        (function () {
            var e = function (e, t, n) {
                for (var r = [], i = 0; i++ < t;)
                    r.push(e += n);
                return r
            }
                , t = function (e) {
                    for (var t, n, r = String(e).replace(/[=]+$/, ""), o = r.length, a = 0, u = 0, c = []; u < o; u++)
                        ~(n = i[r.charCodeAt(u)]) && (t = a % 4 ? 64 * t + n : n,
                            a++ % 4) && c.push(255 & t >> (-2 * a & 6));
                    return c
                }
                , n = function (e) {
                    return e >> 1 ^ -(1 & e)
                }
                , r = []
                , i = e(0, 43, 0).concat([62, 0, 62, 0, 63]).concat(e(51, 10, 1)).concat(e(0, 8, 0)).concat(e(0, 25, 1)).concat([0, 0, 0, 0, 63, 0]).concat(e(25, 26, 1))
                , o = function (e) {
                    for (var r = [], i = new Int8Array(t(e)), o = i.length, a = 0; o > a;) {
                        var u = i[a++]
                            , c = 127 & u;
                        u >= 0 ? r.push(n(c)) : (c |= (127 & (u = i[a++])) << 7,
                            u >= 0 || (c |= (127 & (u = i[a++])) << 14,
                                u >= 0 || (c |= (127 & (u = i[a++])) << 21,
                                    u >= 0 || (c |= (u = i[a++]) << 28))),
                            r.push(n(c)))
                    }
                    return r
                };
            return function (e, t) {
                var n = o(e)
                    , i = function (e, t, o, u, c) {
                        return function s() {
                            for (var l, f, p = [o, u, t, this, arguments, s, n, 0], d = void 0, h = e, g = []; ;)
                                try {
                                    for (; ;)
                                        switch (n[++h]) {
                                            case 0:
                                                p[n[++h]] = new p[n[++h]](p[n[++h]]);
                                                break;
                                            case 1:
                                                return p[n[++h]];
                                            case 2:
                                                for (l = [],
                                                    f = n[++h]; f > 0; f--)
                                                    l.push(p[n[++h]]);
                                                p[n[++h]] = a(h + n[++h], l, o, u, c);
                                                try {
                                                    Object.defineProperty(p[n[h - 1]], "length", {
                                                        value: n[++h],
                                                        configurable: !0,
                                                        writable: !1,
                                                        enumerable: !1
                                                    })
                                                } catch (m) { }
                                                break;
                                            case 3:
                                                p[n[++h]] = p[n[++h]] < p[n[++h]];
                                                break;
                                            case 4:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 5:
                                                p[n[++h]] = p[n[++h]] >= n[++h];
                                                break;
                                            case 6:
                                                p[n[++h]] = p[n[++h]] >> n[++h],
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 7:
                                                p[n[++h]] = p[n[++h]] < n[++h];
                                                break;
                                            case 8:
                                                p[n[++h]] = p[n[++h]].call(d);
                                                break;
                                            case 9:
                                                p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 10:
                                                p[n[++h]] = p[n[++h]] | n[++h];
                                                break;
                                            case 11:
                                                p[n[++h]] = p[n[++h]] & n[++h],
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 12:
                                                p[n[++h]] = {};
                                                break;
                                            case 13:
                                                p[n[++h]] = p[n[++h]] | p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)];
                                                break;
                                            case 14:
                                                p[n[++h]] = d;
                                                break;
                                            case 15:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 16:
                                                p[n[++h]] = !0;
                                                break;
                                            case 17:
                                                p[n[++h]] = p[n[++h]] === p[n[++h]];
                                                break;
                                            case 18:
                                                p[n[++h]] = p[n[++h]] / p[n[++h]];
                                                break;
                                            case 19:
                                                p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 20:
                                                p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 21:
                                                p[n[++h]] = p[n[++h]] * p[n[++h]];
                                                break;
                                            case 22:
                                                p[n[++h]] = ++p[n[++h]],
                                                    p[n[++h]] = p[n[++h]];
                                                break;
                                            case 23:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    p[n[++h]] = p[n[++h]];
                                                break;
                                            case 24:
                                                p[n[++h]] = p[n[++h]] << n[++h];
                                                break;
                                            case 25:
                                                p[n[++h]] = Y(p[n[++h]]);
                                                break;
                                            case 26:
                                                p[n[++h]] = p[n[++h]] | p[n[++h]];
                                                break;
                                            case 27:
                                                p[n[++h]] = n[++h];
                                                break;
                                            case 28:
                                                p[n[++h]] = p[n[++h]][n[++h]];
                                                break;
                                            case 29:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 30:
                                                p[n[++h]] = p[n[++h]].call(d, p[n[++h]], p[n[++h]]);
                                                break;
                                            case 31:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]] = n[++h],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 32:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 33:
                                                p[n[++h]] = p[n[++h]] === n[++h];
                                                break;
                                            case 34:
                                                p[n[++h]] = p[n[++h]] + n[++h];
                                                break;
                                            case 35:
                                                p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 36:
                                                p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 37:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]][n[++h]];
                                                break;
                                            case 38:
                                                p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 39:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]] === p[n[++h]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)];
                                                break;
                                            case 40:
                                                p[n[++h]] = p[n[++h]] > p[n[++h]];
                                                break;
                                            case 41:
                                                p[n[++h]] = p[n[++h]] - p[n[++h]];
                                                break;
                                            case 42:
                                                p[n[++h]] = p[n[++h]] << p[n[++h]];
                                                break;
                                            case 43:
                                                p[n[++h]] = p[n[++h]] & p[n[++h]];
                                                break;
                                            case 44:
                                                p[n[++h]] = p[n[++h]] & n[++h];
                                                break;
                                            case 45:
                                                p[n[++h]] = -p[n[++h]];
                                                break;
                                            case 46:
                                                for (l = [],
                                                    f = n[++h]; f > 0; f--)
                                                    l.push(p[n[++h]]);
                                                p[n[++h]] = i(h + n[++h], l, o, u, c);
                                                try {
                                                    Object.defineProperty(p[n[h - 1]], "length", {
                                                        value: n[++h],
                                                        configurable: !0,
                                                        writable: !1,
                                                        enumerable: !1
                                                    })
                                                } catch (v) { }
                                                break;
                                            case 47:
                                                h += p[n[++h]] ? n[++h] : n[(++h,
                                                    ++h)];
                                                break;
                                            case 48:
                                                p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 49:
                                                p[n[++h]] = ~p[n[++h]];
                                                break;
                                            case 50:
                                                p[n[++h]] = p[n[++h]].call(p[n[++h]]);
                                                break;
                                            case 51:
                                                p[n[++h]] = p[n[++h]] ^ p[n[++h]];
                                                break;
                                            case 52:
                                                p[n[++h]] = ++p[n[++h]];
                                                break;
                                            case 53:
                                                p[n[++h]] = !1;
                                                break;
                                            case 54:
                                                p[n[++h]] = p[n[++h]] >>> n[++h];
                                                break;
                                            case 55:
                                                p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]] = n[++h],
                                                    p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 56:
                                                p[n[++h]] = Array(n[++h]);
                                                break;
                                            case 57:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 58:
                                                p[n[++h]] = p[n[++h]] % p[n[++h]];
                                                break;
                                            case 59:
                                                p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    p[n[++h]] = p[n[++h]][n[++h]];
                                                break;
                                            case 60:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 61:
                                                p[n[++h]] = p[n[++h]] - n[++h];
                                                break;
                                            case 62:
                                                p[n[++h]] = p[n[++h]] + p[n[++h]];
                                                break;
                                            case 63:
                                                p[n[++h]] = !p[n[++h]];
                                                break;
                                            case 64:
                                                p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 65:
                                                for (p[n[++h]] += String.fromCharCode(n[++h]),
                                                    l = [],
                                                    f = n[++h]; f > 0; f--)
                                                    l.push(p[n[++h]]);
                                                p[n[++h]] = i(h + n[++h], l, o, u, c);
                                                try {
                                                    Object.defineProperty(p[n[h - 1]], "length", {
                                                        value: n[++h],
                                                        configurable: !0,
                                                        writable: !1,
                                                        enumerable: !1
                                                    })
                                                } catch (A) { }
                                                p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 66:
                                                p[n[++h]] = p[n[++h]] - 0;
                                                break;
                                            case 67:
                                                p[n[++h]] = p[n[++h]].call(p[n[++h]], p[n[++h]]);
                                                break;
                                            case 68:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]],
                                                    p[n[++h]] = p[n[++h]] - 0;
                                                break;
                                            case 69:
                                                p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    p[n[++h]] = p[n[++h]] + p[n[++h]];
                                                break;
                                            case 70:
                                                p[n[++h]] = n[++h] + p[n[++h]];
                                                break;
                                            case 71:
                                                p[n[++h]] = p[n[++h]] << p[n[++h]],
                                                    p[n[++h]] = p[n[++h]] | p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 72:
                                                p[n[++h]] = p[n[++h]].call(p[n[++h]], p[n[++h]], p[n[++h]]);
                                                break;
                                            case 73:
                                                p[n[++h]] = p[n[++h]] >> n[++h];
                                                break;
                                            case 74:
                                                p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 75:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]][n[++h]] = p[n[++h]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)];
                                                break;
                                            case 76:
                                                p[n[++h]] = p[n[++h]].call(d, p[n[++h]]);
                                                break;
                                            case 77:
                                                p[n[++h]] = p[n[++h]];
                                                break;
                                            case 78:
                                                p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 79:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]] >> n[++h],
                                                    p[n[++h]] = p[n[++h]] & n[++h];
                                                break;
                                            case 80:
                                                p[n[++h]] = "";
                                                break;
                                            case 81:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 82:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)]
                                        }
                                } catch (y) {
                                    if (g.length > 0 && (r = []),
                                        r.push(h),
                                        0 === g.length)
                                        throw c ? c(y, p, r) : y;
                                    h = g.pop(),
                                        r.pop()
                                }
                        }
                    }
                    , a = function (e, t, o, u, c) {
                        return function s() {
                            for (var l, f, p = [o, u, t, this, arguments, s, n, 0], d = void 0, h = e, g = []; ;)
                                try {
                                    for (; ;)
                                        switch (n[++h]) {
                                            case 0:
                                                p[n[++h]] = new p[n[++h]](p[n[++h]]);
                                                break;
                                            case 1:
                                                return p[n[++h]];
                                            case 2:
                                                for (l = [],
                                                    f = n[++h]; f > 0; f--)
                                                    l.push(p[n[++h]]);
                                                p[n[++h]] = a(h + n[++h], l, o, u, c);
                                                try {
                                                    Object.defineProperty(p[n[h - 1]], "length", {
                                                        value: n[++h],
                                                        configurable: !0,
                                                        writable: !1,
                                                        enumerable: !1
                                                    })
                                                } catch (m) { }
                                                break;
                                            case 3:
                                                p[n[++h]] = p[n[++h]] < p[n[++h]];
                                                break;
                                            case 4:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 5:
                                                p[n[++h]] = p[n[++h]] >= n[++h];
                                                break;
                                            case 6:
                                                p[n[++h]] = p[n[++h]] >> n[++h],
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 7:
                                                p[n[++h]] = p[n[++h]] < n[++h];
                                                break;
                                            case 8:
                                                p[n[++h]] = p[n[++h]].call(d);
                                                break;
                                            case 9:
                                                p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 10:
                                                p[n[++h]] = p[n[++h]] | n[++h];
                                                break;
                                            case 11:
                                                p[n[++h]] = p[n[++h]] & n[++h],
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 12:
                                                p[n[++h]] = {};
                                                break;
                                            case 13:
                                                p[n[++h]] = p[n[++h]] | p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)];
                                                break;
                                            case 14:
                                                p[n[++h]] = d;
                                                break;
                                            case 15:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 16:
                                                p[n[++h]] = !0;
                                                break;
                                            case 17:
                                                p[n[++h]] = p[n[++h]] === p[n[++h]];
                                                break;
                                            case 18:
                                                p[n[++h]] = p[n[++h]] / p[n[++h]];
                                                break;
                                            case 19:
                                                p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 20:
                                                p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 21:
                                                p[n[++h]] = p[n[++h]] * p[n[++h]];
                                                break;
                                            case 22:
                                                p[n[++h]] = ++p[n[++h]],
                                                    p[n[++h]] = p[n[++h]];
                                                break;
                                            case 23:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    p[n[++h]] = p[n[++h]];
                                                break;
                                            case 24:
                                                p[n[++h]] = p[n[++h]] << n[++h];
                                                break;
                                            case 25:
                                                p[n[++h]] = Y(p[n[++h]]);
                                                break;
                                            case 26:
                                                p[n[++h]] = p[n[++h]] | p[n[++h]];
                                                break;
                                            case 27:
                                                p[n[++h]] = n[++h];
                                                break;
                                            case 28:
                                                p[n[++h]] = p[n[++h]][n[++h]];
                                                break;
                                            case 29:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 30:
                                                p[n[++h]] = p[n[++h]].call(d, p[n[++h]], p[n[++h]]);
                                                break;
                                            case 31:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]] = n[++h],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 32:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 33:
                                                p[n[++h]] = p[n[++h]] === n[++h];
                                                break;
                                            case 34:
                                                p[n[++h]] = p[n[++h]] + n[++h];
                                                break;
                                            case 35:
                                                p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 36:
                                                p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 37:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]][n[++h]];
                                                break;
                                            case 38:
                                                p[n[++h]] = "",
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 39:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]] === p[n[++h]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)];
                                                break;
                                            case 40:
                                                p[n[++h]] = p[n[++h]] > p[n[++h]];
                                                break;
                                            case 41:
                                                p[n[++h]] = p[n[++h]] - p[n[++h]];
                                                break;
                                            case 42:
                                                p[n[++h]] = p[n[++h]] << p[n[++h]];
                                                break;
                                            case 43:
                                                p[n[++h]] = p[n[++h]] & p[n[++h]];
                                                break;
                                            case 44:
                                                p[n[++h]] = p[n[++h]] & n[++h];
                                                break;
                                            case 45:
                                                p[n[++h]] = -p[n[++h]];
                                                break;
                                            case 46:
                                                for (l = [],
                                                    f = n[++h]; f > 0; f--)
                                                    l.push(p[n[++h]]);
                                                p[n[++h]] = i(h + n[++h], l, o, u, c);
                                                try {
                                                    Object.defineProperty(p[n[h - 1]], "length", {
                                                        value: n[++h],
                                                        configurable: !0,
                                                        writable: !1,
                                                        enumerable: !1
                                                    })
                                                } catch (v) { }
                                                break;
                                            case 47:
                                                h += p[n[++h]] ? n[++h] : n[(++h,
                                                    ++h)];
                                                break;
                                            case 48:
                                                p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 49:
                                                p[n[++h]] = ~p[n[++h]];
                                                break;
                                            case 50:
                                                p[n[++h]] = p[n[++h]].call(p[n[++h]]);
                                                break;
                                            case 51:
                                                p[n[++h]] = p[n[++h]] ^ p[n[++h]];
                                                break;
                                            case 52:
                                                p[n[++h]] = ++p[n[++h]];
                                                break;
                                            case 53:
                                                p[n[++h]] = !1;
                                                break;
                                            case 54:
                                                p[n[++h]] = p[n[++h]] >>> n[++h];
                                                break;
                                            case 55:
                                                p[n[++h]][n[++h]] = p[n[++h]],
                                                    p[n[++h]] = n[++h],
                                                    p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 56:
                                                p[n[++h]] = Array(n[++h]);
                                                break;
                                            case 57:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]][n[++h]] = p[n[++h]];
                                                break;
                                            case 58:
                                                p[n[++h]] = p[n[++h]] % p[n[++h]];
                                                break;
                                            case 59:
                                                p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    p[n[++h]] = p[n[++h]][n[++h]];
                                                break;
                                            case 60:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = n[++h];
                                                break;
                                            case 61:
                                                p[n[++h]] = p[n[++h]] - n[++h];
                                                break;
                                            case 62:
                                                p[n[++h]] = p[n[++h]] + p[n[++h]];
                                                break;
                                            case 63:
                                                p[n[++h]] = !p[n[++h]];
                                                break;
                                            case 64:
                                                p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 65:
                                                for (p[n[++h]] += String.fromCharCode(n[++h]),
                                                    l = [],
                                                    f = n[++h]; f > 0; f--)
                                                    l.push(p[n[++h]]);
                                                p[n[++h]] = i(h + n[++h], l, o, u, c);
                                                try {
                                                    Object.defineProperty(p[n[h - 1]], "length", {
                                                        value: n[++h],
                                                        configurable: !0,
                                                        writable: !1,
                                                        enumerable: !1
                                                    })
                                                } catch (A) { }
                                                p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 66:
                                                p[n[++h]] = p[n[++h]] - 0;
                                                break;
                                            case 67:
                                                p[n[++h]] = p[n[++h]].call(p[n[++h]], p[n[++h]]);
                                                break;
                                            case 68:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]],
                                                    p[n[++h]] = p[n[++h]] - 0;
                                                break;
                                            case 69:
                                                p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    p[n[++h]] = p[n[++h]] + p[n[++h]];
                                                break;
                                            case 70:
                                                p[n[++h]] = n[++h] + p[n[++h]];
                                                break;
                                            case 71:
                                                p[n[++h]] = p[n[++h]] << p[n[++h]],
                                                    p[n[++h]] = p[n[++h]] | p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 72:
                                                p[n[++h]] = p[n[++h]].call(p[n[++h]], p[n[++h]], p[n[++h]]);
                                                break;
                                            case 73:
                                                p[n[++h]] = p[n[++h]] >> n[++h];
                                                break;
                                            case 74:
                                                p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]],
                                                    p[n[++h]][p[n[++h]]] = p[n[++h]];
                                                break;
                                            case 75:
                                                p[n[++h]] = n[++h],
                                                    p[n[++h]][n[++h]] = p[n[++h]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)];
                                                break;
                                            case 76:
                                                p[n[++h]] = p[n[++h]].call(d, p[n[++h]]);
                                                break;
                                            case 77:
                                                p[n[++h]] = p[n[++h]];
                                                break;
                                            case 78:
                                                p[n[++h]] = p[n[++h]][p[n[++h]]];
                                                break;
                                            case 79:
                                                p[n[++h]] = p[n[++h]][n[++h]],
                                                    p[n[++h]] = p[n[++h]] >> n[++h],
                                                    p[n[++h]] = p[n[++h]] & n[++h];
                                                break;
                                            case 80:
                                                p[n[++h]] = "";
                                                break;
                                            case 81:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] += String.fromCharCode(n[++h]);
                                                break;
                                            case 82:
                                                p[n[++h]] += String.fromCharCode(n[++h]),
                                                    p[n[++h]] = p[n[++h]][p[n[++h]]],
                                                    h += p[n[++h]] ? n[++h] : n[(++h,
                                                        ++h)]
                                        }
                                } catch (y) {
                                    if (g.length > 0 && (r = []),
                                        r.push(h),
                                        0 === g.length)
                                        throw c ? c(y, p, r) : y;
                                    h = g.pop(),
                                        r.pop()
                                }
                        }
                    };
                return t ? i : a
            }
        }
        )()("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", !1)(3944, [], G, [void 0, 1732584193, 4023233417, 2562383102, 3285377520, !1, !0, 2147483648, 4294967295, 4294967296, 1518500249, 1859775393, 1894007588], void 0)();
        var P = G._getSecuritySign;

        //////////////////////////////
        // 偷取 _getSecuritySign 函数
        calcSign = P;
        //////////////////////////////

    }
    ).call(this, n(80))
}

var webpack;

!function (e) {
    function t(t) {
        for (var a, n, d = t[0], c = t[1], i = t[2], l = 0, b = []; l < d.length; l++)
            n = d[l],
                Object.prototype.hasOwnProperty.call(o, n) && o[n] && b.push(o[n][0]),
                o[n] = 0;
        for (a in c)
            Object.prototype.hasOwnProperty.call(c, a) && (e[a] = c[a]);
        for (u && u(t); b.length;)
            b.shift()();
        return f.push.apply(f, i || []),
            r()
    }
    function r() {
        for (var e, t = 0; t < f.length; t++) {
            for (var r = f[t], a = !0, n = 1; n < r.length; n++) {
                var c = r[n];
                0 !== o[c] && (a = !1)
            }
            a && (f.splice(t--, 1),
                e = d(d.s = r[0]))
        }
        return e
    }
    var a = {}
        , n = {
            21: 0
        }
        , o = {
            21: 0
        }
        , f = [];
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
    d.e = function (e) {
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
            22: 1,
            23: 1,
            24: 1,
            25: 1,
            26: 1
        }[e] && t.push(n[e] = new Promise((function (t, r) {
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
                20: "radio",
                22: "search",
                23: "singer",
                24: "singer_list",
                25: "songDetail",
                26: "toplist"
            }[e] || e) + "." + {
                1: "092d215c4a601df90f9f",
                3: "5cf0d69eaf29bcab23d2",
                4: "798353db5b0eb05d5358",
                5: "df4c243f917604263e58",
                6: "20d532d798099a44bc88",
                7: "e3bedf2b5810f8db0684",
                8: "559f0a2e11f1f5800b13",
                9: "59ffdfc7a5006250b070",
                10: "020422608fe8bfb1719a",
                11: "8bdb1df6c5436b790baa",
                12: "47ce9300786df1b70584",
                13: "4aee33230ba2d6b81dce",
                14: "e6f63b0cf57dd029fbd6",
                15: "1d2dbefbea113438324a",
                16: "d893492de07ce97d8048",
                17: "9484fde660fe93d9f9f0",
                18: "67fb85e7f96455763c83",
                19: "5e8c651e74b13244f7cf",
                20: "3befd83c10b19893ec66",
                22: "b2d11f89ea6a512a2302",
                23: "c7a38353c5f4ebb47491",
                24: "df0961952a2d3f022894",
                25: "4c080567e394fd45608b",
                26: "8edb142553f97482e00f"
            }[e] + ".chunk.css?max_age=2592000", o = d.p + a, f = document.getElementsByTagName("link"), c = 0; c < f.length; c++) {
                var i = (u = f[c]).getAttribute("data-href") || u.getAttribute("href");
                if ("stylesheet" === u.rel && (i === a || i === o))
                    return t()
            }
            var l = document.getElementsByTagName("style");
            for (c = 0; c < l.length; c++) {
                var u;
                if ((i = (u = l[c]).getAttribute("data-href")) === a || i === o)
                    return t()
            }
            var b = document.createElement("link");
            b.rel = "stylesheet",
                b.type = "text/css",
                b.onload = t,
                b.onerror = function (t) {
                    var a = t && t.target && t.target.src || o
                        , f = new Error("Loading CSS chunk " + e + " failed.\n(" + a + ")");
                    f.code = "CSS_CHUNK_LOAD_FAILED",
                        f.request = a,
                        delete n[e],
                        b.parentNode.removeChild(b),
                        r(f)
                }
                ,
                b.href = o,
                0 !== b.href.indexOf(window.location.origin + "/") && (b.crossOrigin = "anonymous"),
                document.getElementsByTagName("head")[0].appendChild(b)
        }
        )).then((function () {
            n[e] = 0
        }
        )));
        var r = o[e];
        if (0 !== r)
            if (r)
                t.push(r[2]);
            else {
                var a = new Promise((function (t, a) {
                    r = o[e] = [t, a]
                }
                ));
                t.push(r[2] = a);
                var f, c = document.createElement("script");
                c.charset = "utf-8",
                    c.timeout = 120,
                    d.nc && c.setAttribute("nonce", d.nc),
                    c.src = function (e) {
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
                            20: "radio",
                            22: "search",
                            23: "singer",
                            24: "singer_list",
                            25: "songDetail",
                            26: "toplist"
                        }[e] || e) + ".chunk." + {
                            1: "b096963c423b06bf1a3e",
                            3: "d4d3979e9ba3c087286a",
                            4: "d650d59bfd73854b82a0",
                            5: "63cd6f1fe08dd6a8d245",
                            6: "49aeef31720f10c42449",
                            7: "90024d349553c48f9866",
                            8: "e266fcd1bf9f6ac35581",
                            9: "dd2ee666406708258818",
                            10: "d6f59b9088fdade46fe1",
                            11: "deb619b278b9cb821d03",
                            12: "80e4eb94a7ee6f0e2975",
                            13: "22f8adf508ca8f8df0f3",
                            14: "45527f9c866b1fc05cc9",
                            15: "e98c7e5c9d1fc344aa20",
                            16: "3a60b3fec022622fac04",
                            17: "5f86562c053e52d336d9",
                            18: "ea6b03eb7fc6e86887d1",
                            19: "8ce77ebc2694b425913b",
                            20: "e0c027e69fa86ead1af3",
                            22: "85cb99e95eb8bea4acf0",
                            23: "3e158c7afddc674f542f",
                            24: "6f71f44ea0d368bb4d4a",
                            25: "16cee9c59e2e367251bb",
                            26: "31c919710ded8f069572"
                        }[e] + ".js?max_age=2592000"
                    }(e),
                    0 !== c.src.indexOf(window.location.origin + "/") && (c.crossOrigin = "anonymous");
                var i = new Error;
                f = function (t) {
                    c.onerror = c.onload = null,
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
                var l = setTimeout((function () {
                    f({
                        type: "timeout",
                        target: c
                    })
                }
                ), 12e4);
                c.onerror = c.onload = f,
                    document.head.appendChild(c)
            }
        return Promise.all(t)
    }
        ,
        d.m = e,
        d.c = a,
        d.d = function (e, t, r) {
            d.o(e, t) || Object.defineProperty(e, t, {
                enumerable: !0,
                get: r
            })
        }
        ,
        d.r = function (e) {
            "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }),
                Object.defineProperty(e, "__esModule", {
                    value: !0
                })
        }
        ,
        d.t = function (e, t) {
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
                    d.d(r, a, function (t) {
                        return e[t]
                    }
                        .bind(null, a));
            return r
        }
        ,
        d.n = function (e) {
            var t = e && e.__esModule ? function () {
                return e.default
            }
                : function () {
                    return e
                }
                ;
            return d.d(t, "a", t),
                t
        }
        ,
        d.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }
        ,
        d.p = "/ryqq/",
        d.oe = function (e) {
            throw e
        }
        ;
    var c = window.webpackJsonp = window.webpackJsonp || []
        , i = c.push.bind(c);
    c.push = t,
        c = c.slice();
    for (var l = 0; l < c.length; l++)
        t(c[l]);
    var u = i;
    r();

    webpack = d;
}({
    350: x,
    80: function (e, t) {
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

/**
 * 获取 QQ 音乐加密请求的 `sign` 参数
 * 
 * @param {*} data 请求数据
 * @returns 
 */
function getSign(data) {
    // 获取 _getSecuritySign 函数
    webpack(350).default;
    let result = calcSign(data);

    return result;
}

// 调试时使用
// const TEST_DATA = '{"comm":{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":2168979907,"g_tk_new_20200303":240514324,"g_tk":240514324},"req_1":{"module":"userInfo.VipQueryServer","method":"SRFVipQuery_V2","param":{"uin_list":["2168979907"]}},"req_2":{"module":"userInfo.BaseUserInfoServer","method":"get_user_baseinfo_v2","param":{"vec_uin":["2168979907"]}},"req_3":{"module":"music.lvz.VipIconUiShowSvr","method":"GetVipIconUiV2","param":{"PID":3}},"req_4":{"module":"music.musicasset.SongFavRead","method":"IsSongFanByMid","param":{"v_songMid":["002p9bv72ydmlK","0038gCuw2PSkvm","003UlmlI0hkj8t"]}},"req_5":{"module":"music.musichallSong.PlayLyricInfo","method":"GetPlayLyricInfo","param":{"songMID":"002p9bv72ydmlK","songID":467111407}},"req_6":{"method":"GetCommentCount","module":"music.globalComment.GlobalCommentRead","param":{"request_list":[{"biz_type":1,"biz_id":"467111407","biz_sub_type":0}]}},"req_7":{"module":"music.musichallAlbum.AlbumInfoServer","method":"GetAlbumDetail","param":{"albumMid":"002ALg9c0ePhUe"}},"req_8":{"module":"music.vkey.GetEVkey","method":"GetUrl","param":{"guid":"4826849620","songmid":["002p9bv72ydmlK"],"songtype":[0],"uin":"2168979907","loginflag":1,"platform":"20","xcdn":1,"qdesc":"lq96kOgg"}}}';
// const TEST_DATA2 = '{"comm":{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":2168979907,"g_tk_new_20200303":240514324,"g_tk":240514324},"req_1":{"module":"music.musicsearch.HotkeyService","method":"GetHotkeyForQQMusicMobile","param":{"searchid":"21081778325530410","remoteplace":"txt.yqq.top","from":"yqqweb"}},"req_2":{"method":"GetRecommendFeed","module":"music.playlist.PlaylistSquare","param":{"From":0,"Size":25}},"req_3":{"method":"get_hot_category","module":"music.web_category_svr","param":{"location":0}},"req_4":{"module":"newsong.NewSongServer","method":"get_new_song_info","param":{"type":5}},"req_5":{"method":"GetRecommendFeed","module":"music.playlist.PlaylistSquare","param":{"From":0,"Size":25}},"req_6":{"method":"get_hot_category","module":"music.web_category_svr","param":{"location":0}},"req_7":{"module":"newsong.NewSongServer","method":"get_new_song_info","param":{"type":5}},"req_8":{"module":"music.paycenterapi.LoginStateVerificationApi","method":"GetChargeAccount","param":{"appid":"mlive"}},"req_9":{"module":"userInfo.VipQueryServer","method":"SRFVipQuery_V2","param":{"uin_list":["2168979907"]}},"req_10":{"module":"userInfo.BaseUserInfoServer","method":"get_user_baseinfo_v2","param":{"vec_uin":["2168979907"]}},"req_11":{"module":"music.lvz.VipIconUiShowSvr","method":"GetVipIconUiV2","param":{"PID":3}},"req_12":{"module":"MessageCenter.MessageCenterServer","method":"GetMessage","param":{"uin":"2168979907","red_dot":[{"msg_type":1}]}},"req_13":{"module":"GlobalComment.GlobalCommentMessageReadServer","method":"GetMessage","param":{"uin":"2168979907","page_num":0,"page_size":1,"last_msg_id":"","type":0}}}';
// const TARGET_SIGN = 'zzc2bf9f69jbqtydgodepafey5h4hiz8mr4ksfd4398e0';
// const sign = getSign(TEST_DATA2)
// console.log(sign, sign === TARGET_SIGN);

const DATA = 'com.arcanummusic.qqmusicsigndata';
console.log(getSign(DATA));
