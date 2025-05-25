// !Last validated: 2025/05/25

// const window = {};
// window.addEventListener = function () { };
// const document = {};
// document.cookie = '';
// const location = {};
// location.host = 'https://www.kugou.com/';
// const navigator = {};
// navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0';
// navigator.plugins = {};
// navigator.cookieEnabled = true;
// const self = window;

var kgUser, infSign;

// https://staticssl.kugou.com/common/js/min/npm/getBaseInfo.min.js
!function (e, n) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : (e = "undefined" != typeof globalThis ? globalThis : e || self).getBaseInfo = n()
}(this, function () {
    "use strict";
    function n(n, e) {
        var t, i = Object.keys(n);
        return Object.getOwnPropertySymbols && (t = Object.getOwnPropertySymbols(n),
            e && (t = t.filter(function (e) {
                return Object.getOwnPropertyDescriptor(n, e).enumerable
            })),
            i.push.apply(i, t)),
            i
    }
    function u(i) {
        for (var e = 1; e < arguments.length; e++) {
            var r = null != arguments[e] ? arguments[e] : {};
            e % 2 ? n(r, !0).forEach(function (e) {
                var n, t;
                n = i,
                    e = r[t = e],
                    t in n ? Object.defineProperty(n, t, {
                        value: e,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    }) : n[t] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(i, Object.getOwnPropertyDescriptors(r)) : n(r).forEach(function (e) {
                Object.defineProperty(i, e, Object.getOwnPropertyDescriptor(r, e))
            })
        }
        return i
    }
    var d = {
        Cookie: {
            write: function (e, n, t, i, r, o) {
                /^\w*$/.test(e) || alert("cookie格式不正确"),
                    /; /.test(n) && alert("cookie格式不正确");
                e = e + "=" + n;
                t && ((n = new Date).setTime(n.getTime() + 1e3 * t),
                    e += "; expires=" + n.toGMTString()),
                    i && (e += "; path=" + i),
                    r && (e += "; domain=" + r),
                    o && (e += "; secure"),
                    document.cookie = e
            },
            rewriteKey: function (e, n, t, i, r, o, a) {
                var l, c = n;
                t && (l = this.read(e),
                    n = new RegExp("\\b" + n + "=([^&]*)\\b", "g"),
                    c = l.replace(n, function (e, n) {
                        return e.replace(n, t)
                    })),
                    /^\d+(s|m|h|d)$/i.test(i) ? (/^\d+s$/i.test(i) && this.setSec(e, c, i.replace(/s$/i, ""), r, o, a),
                        /^\d+m$/i.test(i) && this.setMin(e, c, i.replace(/m$/i, ""), r, o, a),
                        /^\d+h$/i.test(i) && this.setHour(e, c, i.replace(/h$/i, ""), r, o, a),
                        /^\d+d$/i.test(i) && this.setDay(e, c, i.replace(/d$/i, ""), r, o, a)) : this.write(e, c, i, r, o, a)
            },
            setDay: function (e, n, t, i, r, o) {
                this.write(e, n, 24 * t * 60 * 60, i, r, o)
            },
            setHour: function (e, n, t, i, r, o) {
                this.write(e, n, 60 * t * 60, i, r, o)
            },
            setMin: function (e, n, t, i, r, o) {
                this.write(e, n, 60 * t, i, r, o)
            },
            setSec: function (e, n, t, i, r, o) {
                this.write(e, n, t, i, r, o)
            },
            read: function (e, n, t) {
                for (var i = "", r = document.cookie.split("; "), o = 0; o < r.length; o++) {
                    var a = r[o].match(/^(\w+)=(.+)$/);
                    if (a && 1 < a.length && a[1] == e) {
                        i = a[2];
                        break
                    }
                }
                return "" == i ? null : n ? (t ? JSON : new d.Param).parse(i)[n] : i
            },
            remove: function (e, n, t) {
                e += "=";
                n && (e += "; path=" + n),
                    t && (e += ";domain=" + t),
                    e += "; expires=Fri, 02-Jan-1970 00:00:00 GMT",
                    document.cookie = e
            }
        },
        Md5: function (e) {
            var n, r = 8;
            function l(e, n, t, i, r, o) {
                return g((o = g(g(n, e), g(i, o))) << r | o >>> 32 - r, t)
            }
            function d(e, n, t, i, r, o, a) {
                return l(n & t | ~n & i, e, n, r, o, a)
            }
            function p(e, n, t, i, r, o, a) {
                return l(n & i | t & ~i, e, n, r, o, a)
            }
            function f(e, n, t, i, r, o, a) {
                return l(n ^ t ^ i, e, n, r, o, a)
            }
            function m(e, n, t, i, r, o, a) {
                return l(t ^ (n | ~i), e, n, r, o, a)
            }
            function g(e, n) {
                var t = (65535 & e) + (65535 & n);
                return (e >> 16) + (n >> 16) + (t >> 16) << 16 | 65535 & t
            }
            return e = e ? function (e) {
                for (var n = "0123456789abcdef", t = "", i = 0; i < 4 * e.length; i++)
                    t += n.charAt(e[i >> 2] >> i % 4 * 8 + 4 & 15) + n.charAt(e[i >> 2] >> i % 4 * 8 & 15);
                return t
            }(function (e, n) {
                e[n >> 5] |= 128 << n % 32,
                    e[14 + (n + 64 >>> 9 << 4)] = n;
                for (var t = 1732584193, i = -271733879, r = -1732584194, o = 271733878, a = 0; a < e.length; a += 16) {
                    var l = t
                        , c = i
                        , s = r
                        , u = o;
                    t = d(t, i, r, o, e[a + 0], 7, -680876936),
                        o = d(o, t, i, r, e[a + 1], 12, -389564586),
                        r = d(r, o, t, i, e[a + 2], 17, 606105819),
                        i = d(i, r, o, t, e[a + 3], 22, -1044525330),
                        t = d(t, i, r, o, e[a + 4], 7, -176418897),
                        o = d(o, t, i, r, e[a + 5], 12, 1200080426),
                        r = d(r, o, t, i, e[a + 6], 17, -1473231341),
                        i = d(i, r, o, t, e[a + 7], 22, -45705983),
                        t = d(t, i, r, o, e[a + 8], 7, 1770035416),
                        o = d(o, t, i, r, e[a + 9], 12, -1958414417),
                        r = d(r, o, t, i, e[a + 10], 17, -42063),
                        i = d(i, r, o, t, e[a + 11], 22, -1990404162),
                        t = d(t, i, r, o, e[a + 12], 7, 1804603682),
                        o = d(o, t, i, r, e[a + 13], 12, -40341101),
                        r = d(r, o, t, i, e[a + 14], 17, -1502002290),
                        i = d(i, r, o, t, e[a + 15], 22, 1236535329),
                        t = p(t, i, r, o, e[a + 1], 5, -165796510),
                        o = p(o, t, i, r, e[a + 6], 9, -1069501632),
                        r = p(r, o, t, i, e[a + 11], 14, 643717713),
                        i = p(i, r, o, t, e[a + 0], 20, -373897302),
                        t = p(t, i, r, o, e[a + 5], 5, -701558691),
                        o = p(o, t, i, r, e[a + 10], 9, 38016083),
                        r = p(r, o, t, i, e[a + 15], 14, -660478335),
                        i = p(i, r, o, t, e[a + 4], 20, -405537848),
                        t = p(t, i, r, o, e[a + 9], 5, 568446438),
                        o = p(o, t, i, r, e[a + 14], 9, -1019803690),
                        r = p(r, o, t, i, e[a + 3], 14, -187363961),
                        i = p(i, r, o, t, e[a + 8], 20, 1163531501),
                        t = p(t, i, r, o, e[a + 13], 5, -1444681467),
                        o = p(o, t, i, r, e[a + 2], 9, -51403784),
                        r = p(r, o, t, i, e[a + 7], 14, 1735328473),
                        i = p(i, r, o, t, e[a + 12], 20, -1926607734),
                        t = f(t, i, r, o, e[a + 5], 4, -378558),
                        o = f(o, t, i, r, e[a + 8], 11, -2022574463),
                        r = f(r, o, t, i, e[a + 11], 16, 1839030562),
                        i = f(i, r, o, t, e[a + 14], 23, -35309556),
                        t = f(t, i, r, o, e[a + 1], 4, -1530992060),
                        o = f(o, t, i, r, e[a + 4], 11, 1272893353),
                        r = f(r, o, t, i, e[a + 7], 16, -155497632),
                        i = f(i, r, o, t, e[a + 10], 23, -1094730640),
                        t = f(t, i, r, o, e[a + 13], 4, 681279174),
                        o = f(o, t, i, r, e[a + 0], 11, -358537222),
                        r = f(r, o, t, i, e[a + 3], 16, -722521979),
                        i = f(i, r, o, t, e[a + 6], 23, 76029189),
                        t = f(t, i, r, o, e[a + 9], 4, -640364487),
                        o = f(o, t, i, r, e[a + 12], 11, -421815835),
                        r = f(r, o, t, i, e[a + 15], 16, 530742520),
                        i = f(i, r, o, t, e[a + 2], 23, -995338651),
                        t = m(t, i, r, o, e[a + 0], 6, -198630844),
                        o = m(o, t, i, r, e[a + 7], 10, 1126891415),
                        r = m(r, o, t, i, e[a + 14], 15, -1416354905),
                        i = m(i, r, o, t, e[a + 5], 21, -57434055),
                        t = m(t, i, r, o, e[a + 12], 6, 1700485571),
                        o = m(o, t, i, r, e[a + 3], 10, -1894986606),
                        r = m(r, o, t, i, e[a + 10], 15, -1051523),
                        i = m(i, r, o, t, e[a + 1], 21, -2054922799),
                        t = m(t, i, r, o, e[a + 8], 6, 1873313359),
                        o = m(o, t, i, r, e[a + 15], 10, -30611744),
                        r = m(r, o, t, i, e[a + 6], 15, -1560198380),
                        i = m(i, r, o, t, e[a + 13], 21, 1309151649),
                        t = m(t, i, r, o, e[a + 4], 6, -145523070),
                        o = m(o, t, i, r, e[a + 11], 10, -1120210379),
                        r = m(r, o, t, i, e[a + 2], 15, 718787259),
                        i = m(i, r, o, t, e[a + 9], 21, -343485551),
                        t = g(t, l),
                        i = g(i, c),
                        r = g(r, s),
                        o = g(o, u)
                }
                return Array(t, i, r, o)
            }(function (e) {
                for (var n = Array(), t = (1 << r) - 1, i = 0; i < e.length * r; i += r)
                    n[i >> 5] |= (e.charCodeAt(i / r) & t) << i % 32;
                return n
            }(n = e), n.length * r)) : ""
        },
        Param: function () {
            var t = []
                , o = {};
            this.parse = function (e) {
                for (var n = e.split("&"), t = 0, i = n.length; t < i; t++) {
                    var r = n[t].split("=");
                    o[r[0]] = r[1]
                }
                return o
            }
                ,
                this.toString = function (e) {
                    return t.join(e = e || "&")
                }
                ,
                this.add = function (e, n) {
                    return t.push(e + "=" + n),
                        this
                }
        },
        IsEmpty: function (e) {
            return void 0 === e || null == e || "" == e
        },
        Guid: function () {
            function e() {
                return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
            }
            return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
        },
        getKgMid: function () {
            var e = d.Cookie.read("kg_mid");
            if (navigator.cookieEnabled) {
                if (d.IsEmpty(e)) {
                    var n = d.Guid()
                        , e = d.Md5(n);
                    try {
                        d.Cookie.write("kg_mid", d.Md5(n), 864e6, "/", "kugou.com")
                    } catch (e) { }
                }
            } else {
                var t = navigator.userAgent
                    , i = function () {
                        var e = navigator.plugins
                            , n = "";
                        if (0 < e.length) {
                            for (var t = [], i = 0, r = e.length; i < r; i++) {
                                var o = e[i].name;
                                t.push(o)
                            }
                            n = t.toString()
                        }
                        return n
                    }()
                    , r = screen.width + "x" + screen.height
                    , o = screen.colorDepth || ""
                    , a = screen.pixelDepth || ""
                    , n = function () {
                        var e = ["canvas"];
                        try {
                            var n, t = document.createElement("canvas");
                            t.getContext && t.getContext("2d") && (t.width = 200,
                                t.height = 200,
                                t.style.display = "inline",
                                (n = t.getContext("2d")).rect(0, 0, 10, 10),
                                n.rect(2, 2, 6, 6),
                                e.push("canvas winding:" + (!1 === n.isPointInPath(5, 5, "evenodd") ? "yes" : "no")),
                                n.textBaseline = "alphabetic",
                                n.fillStyle = "#f60",
                                n.fillRect(125, 1, 62, 20),
                                n.fillStyle = "#069",
                                n.font = "14px 'Arial'",
                                n.fillText("hello kugou", 2, 15),
                                n.fillStyle = "rgba(102, 204, 0, 0.2)",
                                n.font = "18pt Arial",
                                n.fillText("hello kugou", 4, 45),
                                n.globalCompositeOperation = "multiply",
                                n.fillStyle = "rgb(255,0,255)",
                                n.beginPath(),
                                n.arc(50, 50, 50, 0, 2 * Math.PI, !0),
                                n.closePath(),
                                n.fill(),
                                n.fillStyle = "rgb(0,255,255)",
                                n.beginPath(),
                                n.arc(100, 50, 50, 0, 2 * Math.PI, !0),
                                n.closePath(),
                                n.fill(),
                                n.fillStyle = "rgb(255,255,0)",
                                n.beginPath(),
                                n.arc(75, 100, 50, 0, 2 * Math.PI, !0),
                                n.closePath(),
                                n.fill(),
                                n.fillStyle = "rgb(255,0,255)",
                                n.arc(75, 75, 75, 0, 2 * Math.PI, !0),
                                n.arc(75, 75, 25, 0, 2 * Math.PI, !0),
                                n.fill("evenodd"),
                                t.toDataURL && e.push("canvas fp:" + t.toDataURL()))
                        } catch (e) { }
                        return d.Md5(e.toString())
                    }();
                e = d.Md5(t + i + r + o + a + n)
            }
            return e
        },
        isiOS: function () {
            var e = navigator.userAgent
                , n = e.match(/(iPad).*OS\s([\d_]+)/)
                , t = e.match(/(iPod)(.*OS\s([\d_]+))?/)
                , e = !n && e.match(/(iPhone\sOS)\s([\d_]+)/);
            return !!(n || t || e)
        },
        GetPCClientUserInfo: function (n) {
            var t = "KGSupercall_GetUserInfo" + Math.random().toString().substr(2, 9)
                , e = null;
            window[t] = function (e) {
                n && n(e),
                    window[t] = null
            }
                ;
            try {
                e = external.SuperCall(504, '{"callback":"' + t + '"}')
            } catch (e) { }
            if (void 0 === e || !n)
                return n ? void 0 : (window[t] = null,
                    e);
            window[t](e)
        },
        getPCMID_APPID: function (n) {
            try {
                var t;
                "function" == typeof n ? (t = "KGSupercall_getMID_APPID" + Math.random().toString().substr(2, 9),
                    top.window[t] = function (e) {
                        e && (top.window[t] = null,
                            n && n(e))
                    }
                    ,
                    external.SuperCall(822, '{"callback":"' + t + '"}')) : external.SuperCall(822, n)
            } catch (e) { }
        },
        isPCClient: function () {
            var e = !1;
            return e = window.external && window.external.SuperCall && "function" == typeof window.external.SuperCall && window.external.GetVersion && 0 < window.external.GetVersion() ? !0 : e
        }
    };
    kgUser = d;
    var e, p = (function (e) {
        function n(n, e) {
            var t, i = Object.keys(n);
            return Object.getOwnPropertySymbols && (t = Object.getOwnPropertySymbols(n),
                e && (t = t.filter(function (e) {
                    return Object.getOwnPropertyDescriptor(n, e).enumerable
                })),
                i.push.apply(i, t)),
                i
        }
        function o(i) {
            for (var e = 1; e < arguments.length; e++) {
                var r = null != arguments[e] ? arguments[e] : {};
                e % 2 ? n(Object(r), !0).forEach(function (e) {
                    var n, t = i;
                    e = r[n = e],
                        n in t ? Object.defineProperty(t, n, {
                            value: e,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0
                        }) : t[n] = e
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(i, Object.getOwnPropertyDescriptors(r)) : n(Object(r)).forEach(function (e) {
                    Object.defineProperty(i, e, Object.getOwnPropertyDescriptor(r, e))
                })
            }
            return i
        }
        var c;
        e.exports = (c = {
            str2Json: function (e) {
                var n = {};
                if ("[object String]" === Object.prototype.toString.call(e))
                    try {
                        n = JSON.parse(e)
                    } catch (e) {
                        n = {}
                    }
                return n
            },
            json2Str: function (e) {
                var n = e;
                if ("string" != typeof e)
                    try {
                        n = JSON.stringify(e)
                    } catch (e) {
                        n = ""
                    }
                return n
            },
            cbNum: 0,
            isIOS: !!navigator.userAgent.match(/KGBrowser/gi),
            isKugouAndroid: !!navigator.userAgent.match(/kugouandroid/gi),
            isAndroid: "undefined" != typeof external && void 0 !== external.superCall,
            isDKAPP: !!navigator.userAgent.match(/kgshortvideo/gi),
            isKGRing: !!navigator.userAgent.match(/KGRingCode/gi),
            isFXAPP: !!navigator.userAgent.match(/Fanxing/gi),
            isFXQianBanAPP: !!navigator.userAgent.match(/QianBan/gi),
            isIframePage: window.parent && window.parent != window,
            isInClient: function () {
                return !!(c.isAndroid || c.isKugouAndroid || c.isIOS || c.isFXAPP || c.isFXQianBanAPP || c.isDKAPP || c.isKGRing)
            },
            loadUrl: function (e) {
                var n = document.createElement("iframe");
                n.setAttribute("src", e),
                    n.setAttribute("style", "display:none;"),
                    n.setAttribute("height", "0px"),
                    n.setAttribute("width", "0px"),
                    n.setAttribute("frameborder", "0"),
                    document.body.appendChild(n),
                    n.parentNode.removeChild(n)
            },
            mobileCallInIframe: function (e, n, t) {
                e = {
                    type: "KgMobileCall",
                    cmd: e
                },
                    n && (e.dataJson = n),
                    t && (e.cbName = t),
                    e.source = "personal",
                    window.parent.postMessage(e, "*")
            },
            receiveMessage: function (e) {
                var n = e.data;
                "KgMobileCall" == n.type && window[n.cbName] && (n.dataJson ? window[n.cbName](n.dataJson) : window[n.cbName](),
                    window[n.cbName] = null),
                    "KgWebMobileCall" == n.type && (e = n.funcName.split("."),
                        KgWebMobileCall[e[1]] && (n.dataJson ? KgWebMobileCall[e[1]](n.dataJson) : KgWebMobileCall[e[1]]()))
            },
            callCmd: function (t) {
                var e, n, i = c, r = "kugouurl", r = i.isKugouAndroid ? "kugoujsbridge" : i.isAndroid ? "superCall" : i.isFXAPP || i.isFXQianBanAPP ? "fanxing2" : "kugouurl";
                if ("kugoujsbridge" == (r = t && t.useMobileCallType ? t.useMobileCallType : r)) {
                    var o = {}
                        , a = "";
                    t.cmd && (o.cmd = t.cmd),
                        t.jsonStr && (o.jsonStr = t.jsonStr),
                        t.callback && (i.cbNum++,
                            a = "kgandroidmobilecall_" + (t.cmd || 0) + "_" + i.cbNum + Math.random().toString().substr(2, 9),
                            o.callback = a,
                            window[a] = function (e, n) {
                                if (void 0 !== e)
                                    if ("[object String]" === Object.prototype.toString.call(e)) {
                                        try {
                                            e = "#" === n ? decodeURIComponent(e) : decodeURIComponent(decodeURIComponent(e))
                                        } catch (e) {
                                            console.error("decodeURIComponent", e)
                                        }
                                        t.callback(i.str2Json(e))
                                    } else
                                        t.callback(e)
                            }
                        ),
                        t.AndroidCallback && ((l = i.str2Json(t.jsonStr)).AndroidCallback = a,
                            t.jsonStr = i.json2Str(l),
                            t.jsonStr && (o.jsonStr = t.jsonStr));
                    var l = encodeURIComponent(JSON.stringify(o))
                        , l = "kugoujsbridge://start.kugou_jsbridge/?".concat(l);
                    i.isIframePage ? i.mobileCallInIframe(o.cmd, o.jsonStr, a) : i.loadUrl(l)
                } else if ("superCall" == r) {
                    if (a = o = "",
                        t.jsonStr)
                        if (t.callback && "" !== t.callback && !0 === t.AndroidCallback && (i.cbNum++,
                            a = "kgmobilecall_" + (t.cmd || 0) + "_" + i.cbNum + Math.random().toString().substr(2, 9),
                            window[a] = function (e, n) {
                                if (void 0 !== e)
                                    if ("[object String]" === Object.prototype.toString.call(e)) {
                                        try {
                                            e = "#" === n ? decodeURIComponent(e) : decodeURIComponent(decodeURIComponent(e))
                                        } catch (e) {
                                            console.error("decodeURIComponent", decodeURIComponent)
                                        }
                                        t.callback(i.str2Json(e))
                                    } else
                                        t.callback(e)
                            }
                            ,
                            (l = i.str2Json(t.jsonStr)).AndroidCallback = a,
                            t.jsonStr = i.json2Str(l)),
                            i.isIframePage && t.AndroidCallback)
                            i.mobileCallInIframe(t.cmd, t.jsonStr, a);
                        else
                            try {
                                o = external.superCall(t.cmd, t.jsonStr)
                            } catch (e) { }
                    else
                        try {
                            o = external.superCall(t.cmd)
                        } catch (e) { }
                    t.AndroidCallback || t.callback && "" !== t.callback && "AndroidCallback" != o && (o = i.str2Json(o),
                        t.callback(o))
                } else
                    "fanxing2" == r ? (r = n = "",
                        n = t.callback ? (i.cbNum++,
                            r = "kgmobilecall_" + (t.cmd || 0) + "_" + i.cbNum + Math.random().toString().substr(2, 9),
                            window[r] = function (e) {
                                void 0 !== e && t.callback && ("[object String]" === Object.prototype.toString.call(e) ? t.callback(i.str2Json(e)) : t.callback(e))
                            }
                            ,
                            t.jsonStr ? 'fanxing2://send.message/?{"cmd":' + t.cmd + ', "jsonStr":' + t.jsonStr + ', "callback":"' + r + '"}' : 'fanxing2://send.message/?{"cmd":' + t.cmd + ', "callback":"' + r + '"}') : t.jsonStr ? 'fanxing2://send.message/?{"cmd":' + t.cmd + ', "jsonStr":' + t.jsonStr + "}" : 'fanxing2://send.message/?{"cmd":' + t.cmd + "}",
                        i.isIframePage ? i.mobileCallInIframe(t.cmd, t.jsonStr, r) : navigator.userAgent.match(/(Android);?[\s\/]+([\d.]+)?/) ? external && external.callFanxing ? (e = {
                            cmd: t.cmd,
                            jsonStr: t.jsonStr || "",
                            callback: r
                        },
                            external.callFanxing(JSON.stringify(e))) : window.prompt(n) : i.loadUrl(n)) : (n = e = "",
                                t.callback && (i.cbNum++,
                                    n = "kgmobilecall_" + (t.cmd || 0) + "_" + i.cbNum + Math.random().toString().substr(2, 9),
                                    window[n] = function (e) {
                                        void 0 !== e && t.callback && ("[object String]" === Object.prototype.toString.call(e) ? t.callback(i.str2Json(e)) : t.callback(e))
                                    }
                                ),
                                n && "" != n && t.jsonStr && (e = 'kugouurl://start.music/?{"cmd":' + t.cmd + ', "jsonStr":' + t.jsonStr + ', "callback":"' + n + '"}'),
                                n && "" != n && !t.jsonStr && (e = 'kugouurl://start.music/?{"cmd":' + t.cmd + ', "callback":"' + n + '"}'),
                                "" == n && t.jsonStr && (e = 'kugouurl://start.music/?{"cmd":' + t.cmd + ', "jsonStr":' + t.jsonStr + "}"),
                                "" != n || t.jsonStr || (e = 'kugouurl://start.music/?{"cmd":' + t.cmd + "}"),
                                i.isIframePage ? i.mobileCallInIframe(t.cmd, t.jsonStr, n) : i.loadUrl(e))
            },
            sendCommandOrder: function (e) {
                var n = window.location.origin
                    , t = ~n.indexOf("voo.kugou.com") || ~n.indexOf("http://10.16.4.19:8099") || ~n.indexOf("http://test.kugou.com:8099")
                    , i = window._VO_ACT_ID_;
                t && i && e && (e = {
                    actId: i,
                    cmd: e
                },
                    e = c.json2Str({
                        url: "".concat(n, "/public/addCommandOrder"),
                        method: "post",
                        param: c.json2Str(e),
                        header: {
                            "Content-Type": "application/json"
                        },
                        AndroidCallback: !0
                    }),
                    c.callCmd({
                        cmd: 186,
                        jsonStr: e,
                        callback: function (e) {
                            ~window.location.href.indexOf("debugCmd") && console.log(e)
                        }
                    }))
            }
        },
            e = {
                isIOS: c.isIOS,
                isKugouAndroid: c.isKugouAndroid,
                isAndroid: c.isAndroid,
                isFXAPP: c.isFXAPP,
                isFXQianBanAPP: c.isFXQianBanAPP,
                isDKAPP: c.isDKAPP,
                isKGRing: c.isKGRing,
                isInClient: function () {
                    return c.isInClient()
                },
                mobileCall: function (e, n, t, i) {
                    var r = "";
                    if (n && (r = c.json2Str(n)),
                        !e)
                        return console.error("请输入命令号！"),
                            !1;
                    if (n = {},
                        e && (n.cmd = e),
                        "" != r && (n.jsonStr = r),
                        t && (n.callback = t),
                        n = o(o({}, n), i),
                        !e || 186 != e && 225 != e || t && (n.AndroidCallback = !0),
                        n.AndroidCallback && !n.jsonStr && (n.jsonStr = {}),
                        c.isInClient()) {
                        c.callCmd(n);
                        try {
                            c.sendCommandOrder(e)
                        } catch (e) { }
                    }
                },
                KgWebMobileCall: function (i, r) {
                    if (i)
                        try {
                            c.isIframePage && window.parent.postMessage({
                                type: "KgWebMobileCall",
                                funcName: i
                            }, "*");
                            var o = i.split(".");
                            o.reduce(function (e, n) {
                                if (e[n]) {
                                    if (n !== o[o.length - 1])
                                        return e[n];
                                    var t = e[n];
                                    return "function" == typeof t ? (e[n] = function () {
                                        t && t.apply(void 0, arguments),
                                            r && r.apply(void 0, arguments)
                                    }
                                        ,
                                        e[n]) : (console.error("请检查，当前环境变量已注册了对象：" + i + "，且该对象不是方法"),
                                            null)
                                }
                                return n === o[o.length - 1] ? e[n] = function () {
                                    r && r.apply(void 0, arguments)
                                }
                                    : e[n] = new Object,
                                    e[n]
                            }, window)
                        } catch (e) { }
                }
            },
            window.addEventListener("message", function (e) {
                c.receiveMessage(e)
            }, !1),
            e)
    }(e = {
        exports: {}
    }),
        e.exports);
    return function (e, i, n, r) {
        var o = {
            useMobileCallType: ""
        };
        n && p.isKugouAndroid && !p.isIOS && (o = {
            useMobileCallType: "superCall"
        });
        function a(n, t) {
            return Array.isArray(r) && r.length && r.forEach(function (e) {
                n.hasOwnProperty(e) || (n[e] = t[e] || "")
            }),
                n
        }
        var t = 101
            , l = 122
            , c = 124
            , s = {
                appid: null,
                mid: null,
                uuid: null,
                plat: null,
                dfid: null,
                userid: null,
                userpic: null,
                userNickName: null,
                token: null,
                clientver: null
            };
        window.MiniApp && window.MiniApp.listenGetUserInfo ? window.MiniApp && window.MiniApp.listenGetUserInfo({
            success: function (e) {
                var n = parseInt((new Date).getTime())
                    , n = {
                        appid: Number(e.appid) || 1058,
                        clientver: e.clientver || 12e3,
                        uuid: e.uuid || e.mid || n,
                        mid: e.mid || n,
                        dfid: e.dfid || "-",
                        userid: e.kugouID,
                        token: e.token,
                        clienttime: n
                    };
                1e3 === n.appid ? n.plat = 2 : 1005 === n.appid ? n.plat = 1 : n.plat = 4,
                    i && i(n)
            },
            fail: function (e) {
                console.error("miniapp 获取用户信息失败"),
                    i && i(null)
            }
        }) : p.isInClient() && !p.isFXAPP ? p.mobileCall(t, null, function (t) {
            1 == t.status ? (s.userid = t.kugouID,
                s.token = t.token,
                s.userpic = t.photo,
                s.userNickName = t.nickName,
                s.isVIP = t.isVIP || t.isVip) : (s.userid = null,
                    s.token = null,
                    s.userpic = null,
                    s.userNickName = null),
                s.appid = t.appid,
                p.mobileCall(l, null, function (n) {
                    s.clientver = n.version,
                        s.platform = n.platform || "",
                        p.mobileCall(c, null, function (e) {
                            s.mid = e.mid_v2 || e.mid,
                                s.dfid = e.dfid || "-",
                                s.uuid = e.uuid || s.mid,
                                s.osVersion = e.osVersion || "",
                                p.isIOS ? s.plat = 2 : s.plat = 1,
                                s = a(s, u({}, t, {}, n, {}, e)),
                                i && i(s)
                        }, o)
                }, o)
        }, o) : p.isInClient() && p.isFXAPP ? p.mobileCall(625, null, function (e) {
            e = JSON.parse(e.jsonStr);
            s.clientver = e.version,
                s.mid = e.mid,
                s.uuid = e.uuid || s.mid,
                s.dfid = e.dfid || "-",
                s.appid = e.appId,
                d.isiOS() ? s.plat = 2 : s.plat = 1,
                p.mobileCall(410, null, function (e) {
                    1 == JSON.parse(e.jsonStr).status ? p.mobileCall(411, {}, function (e) {
                        e = JSON.parse(e.jsonStr).jsonStr ? JSON.parse(e.jsonStr).jsonStr : JSON.parse(e.jsonStr);
                        s.userid = e.kugouId,
                            s.token = e.token,
                            s.pic = e.userLogo,
                            s.nickName = e.nickName,
                            i && i(s)
                    }) : (s.userid = null,
                        s.token = null,
                        s.userpic = null,
                        s.userNickName = null,
                        i && i(s))
                })
        }) : d.isPCClient() ? d.GetPCClientUserInfo(function (e) {
            try {
                e = JSON.parse(e)
            } catch (e) { }
            s.userid = e.kugouid || "",
                s.token = e.token || "",
                s.userNickName = e.nickname || "",
                s.userpic = e.usrPic || "",
                s.userNickName = s.userNickName ? unescape(s.userNickName) : "",
                d.getPCMID_APPID(function (e) {
                    try {
                        e = JSON.parse(e)
                    } catch (e) { }
                    s.appid = e.appid || 1001,
                        s.dfid = e.dfid || "-",
                        s.mid = e.mid || "",
                        s.uuid = e.uuid || s.mid,
                        s.plat = 3,
                        s.clientver = window.external.GetVersion(),
                        s = a(s),
                        i && i(s)
                })
        }) : (n = d.Cookie.read("a_id"),
            t = d.Cookie.read("KuGoo", "a_id"),
            s.appid = e || null,
            s.mid = d.getKgMid(),
            s.uuid = s.mid,
            s.plat = 4,
            s.dfid = d.Cookie.read("kg_dfid") || "-",
            s.userid = d.Cookie.read("KuGoo", "KugooID"),
            s.userpic = d.Cookie.read("KuGoo", "Pic"),
            s.userNickName = d.Cookie.read("KuGoo", "NickName"),
            s.token = d.Cookie.read("KuGoo", "t"),
            s.appid = s.appid || t || n || null,
            t && t != s.appid && s.appid && (1010 != t && 1014 != t || 1010 != s.appid && 1014 != s.appid) && (s.userid = null,
                s.token = null,
                s.userpic = null,
                s.userNickName = null),
            s.clientver = 1e3,
            s.userNickName = s.userNickName ? unescape(s.userNickName) : "",
            i && i(s))
    }
});

// https://staticssl.kugou.com/common/js/min/infSign.min.js
!function (t, n) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : (t = t || self,
        t.infSign = n())
}(this, function () {
    "use strict";
    function t(t, n, r) {
        return n in t ? Object.defineProperty(t, n, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : t[n] = r,
            t
    }
    function n(t, n) {
        var r = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
            var e = Object.getOwnPropertySymbols(t);
            n && (e = e.filter(function (n) {
                return Object.getOwnPropertyDescriptor(t, n).enumerable
            })),
                r.push.apply(r, e)
        }
        return r
    }
    function r(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? n(o, !0).forEach(function (n) {
                t(r, n, o[n])
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : n(o).forEach(function (t) {
                Object.defineProperty(r, t, Object.getOwnPropertyDescriptor(o, t))
            })
        }
        return r
    }
    function e(t, n) {
        return n = {
            exports: {}
        },
            t(n, n.exports),
            n.exports
    }
    function o(t) {
        return !!t.constructor && "function" == typeof t.constructor.isBuffer && t.constructor.isBuffer(t)
    }
    function i(t) {
        return "function" == typeof t.readFloatLE && "function" == typeof t.slice && o(t.slice(0, 0))
    }
    function c() {
        var t, n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "", o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, i = !1, c = !1, a = "json", l = r({}, n), u = s.isInClient();
        "function" == typeof o ? t = o : (t = o.callback,
            i = o.useH5 || !1,
            a = o.postType || "json",
            c = o.isCDN || !1),
            e && ("[object Object]" != Object.prototype.toString.call(e) ? u = !1 : "urlencoded" == a && (u = !1));
        var f = function () {
            var n = (new Date).getTime()
                , i = []
                , s = []
                , u = "NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt"
                , f = {
                    srcappid: "2919",
                    clientver: "20000",
                    clienttime: n,
                    mid: n,
                    uuid: n,
                    dfid: "-"
                };
            c && (delete f.clienttime,
                delete f.mid,
                delete f.uuid,
                delete f.dfid),
                l = r({}, f, {}, l);
            for (var g in l)
                i.push(g);
            if (i.sort(),
                i.forEach(function (t) {
                    s.push(t + "=" + l[t])
                }),
                e)
                if ("[object Object]" == Object.prototype.toString.call(e))
                    if ("json" == a)
                        s.push(JSON.stringify(e));
                    else {
                        var b = [];
                        for (var g in e)
                            b.push(g + "=" + e[g]);
                        s.push(b.join("&"))
                    }
                else
                    s.push(e);
            s.unshift(u);
            s.push(u);
            l.signature = d(s.join(""));
            return l;
        };
        return f();
    }
    "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;
    infSign = c;
    var s = e(function (t, n) {
        !function (n, r) {
            t.exports = function () {
                var t = {
                    str2Json: function (t) {
                        var n = {};
                        if ("[object String]" === Object.prototype.toString.call(t))
                            try {
                                n = JSON.parse(t)
                            } catch (t) {
                                n = {}
                            }
                        return n
                    },
                    json2Str: function (t) {
                        var n = t;
                        if ("string" != typeof t)
                            try {
                                n = JSON.stringify(t)
                            } catch (t) {
                                n = ""
                            }
                        return n
                    },
                    _extend: function (t, n) {
                        if (n)
                            for (var r in t)
                                n.hasOwnProperty(r) || (n[r] = t[r]);
                        return n
                    },
                    formatURL: {
                        browser: "",
                        url: ""
                    },
                    formatSong: {
                        filename: "",
                        filesize: "",
                        hash: "",
                        bitrate: "",
                        extname: "",
                        duration: "",
                        mvhash: "",
                        m4afilesize: "",
                        "320hash": "",
                        "320filesize": "",
                        sqhash: "",
                        sqfilesize: 0,
                        feetype: 0,
                        isfirst: 0
                    },
                    formatMV: {
                        filename: "",
                        singername: "",
                        hash: "",
                        imgurl: ""
                    },
                    formatShare: {
                        shareName: "",
                        topicName: "",
                        hash: "",
                        listID: "",
                        type: "",
                        suid: "",
                        slid: "",
                        imgUrl: "",
                        filename: "",
                        duration: "",
                        shareData: {
                            linkUrl: "",
                            picUrl: "",
                            content: "",
                            title: ""
                        }
                    },
                    cbNum: 0,
                    isIOS: !!navigator.userAgent.match(/KGBrowser/gi),
                    isKugouAndroid: !!navigator.userAgent.match(/kugouandroid/gi),
                    isAndroid: "undefined" != typeof external && void 0 !== external.superCall,
                    loadUrl: function (t) {
                        var n = document.createElement("iframe");
                        n.setAttribute("src", t),
                            n.setAttribute("style", "display:none;"),
                            n.setAttribute("height", "0px"),
                            n.setAttribute("width", "0px"),
                            n.setAttribute("frameborder", "0"),
                            document.body.appendChild(n),
                            n.parentNode.removeChild(n),
                            n = null
                    },
                    callCmd: function (n) {
                        var r = t;
                        if (r.isKugouAndroid) {
                            var e = {}
                                , o = "";
                            if (n.cmd && (e.cmd = n.cmd),
                                n.jsonStr && (e.jsonStr = n.jsonStr),
                                n.callback && (o = "kgandroidmobilecall" + ++r.cbNum + Math.random().toString().substr(2, 9),
                                    e.callback = o,
                                    window[o] = function (t, e) {
                                        void 0 !== t && ("[object String]" === Object.prototype.toString.call(t) ? (t = "#" === e ? decodeURIComponent(t) : decodeURIComponent(decodeURIComponent(t)),
                                            n.callback(r.str2Json(t))) : n.callback(t))
                                    }
                                ),
                                n.AndroidCallback) {
                                var i = r.str2Json(n.jsonStr);
                                i.AndroidCallback = o,
                                    n.jsonStr = r.json2Str(i),
                                    n.jsonStr && (e.jsonStr = n.jsonStr)
                            }
                            var c = encodeURIComponent(JSON.stringify(e))
                                , s = "kugoujsbridge://start.kugou_jsbridge/?".concat(c);
                            r.loadUrl(s)
                        } else if (r.isAndroid) {
                            var a = ""
                                , l = "";
                            if (n.jsonStr) {
                                if (n.callback && "" !== n.callback && !0 === n.AndroidCallback) {
                                    l = "kgmobilecall" + ++r.cbNum + Math.random().toString().substr(2, 9),
                                        window[l] = function (t, e) {
                                            void 0 !== t && ("[object String]" === Object.prototype.toString.call(t) ? (t = "#" === e ? decodeURIComponent(t) : decodeURIComponent(decodeURIComponent(t)),
                                                n.callback(r.str2Json(t))) : n.callback(t))
                                        }
                                        ;
                                    var u = r.str2Json(n.jsonStr);
                                    u.AndroidCallback = l,
                                        n.jsonStr = r.json2Str(u)
                                }
                                try {
                                    a = external.superCall(n.cmd, n.jsonStr)
                                } catch (t) { }
                            } else
                                try {
                                    a = external.superCall(n.cmd)
                                } catch (t) { }
                            n.callback && "" !== n.callback && "AndroidCallback" != a && (a = r.str2Json(a),
                                n.callback(a))
                        } else {
                            var f = ""
                                , d = "";
                            n.callback && (d = "kgmobilecall" + ++r.cbNum + Math.random().toString().substr(2, 9),
                                window[d] = function (t) {
                                    void 0 !== t && n.callback && ("[object String]" === Object.prototype.toString.call(t) ? n.callback(r.str2Json(t)) : n.callback(t))
                                }
                            ),
                                d && "" != d && n.jsonStr && (f = 'kugouurl://start.music/?{"cmd":' + n.cmd + ', "jsonStr":' + n.jsonStr + ', "callback":"' + d + '"}'),
                                d && "" != d && !n.jsonStr && (f = 'kugouurl://start.music/?{"cmd":' + n.cmd + ', "callback":"' + d + '"}'),
                                "" == d && n.jsonStr && (f = 'kugouurl://start.music/?{"cmd":' + n.cmd + ', "jsonStr":' + n.jsonStr + "}"),
                                "" != d || n.jsonStr || (f = 'kugouurl://start.music/?{"cmd":' + n.cmd + "}"),
                                r.loadUrl(f)
                        }
                    },
                    formartData: function (n, r) {
                        n && 123 == n && r && (r = t._extend(t.formatURL, r)),
                            n && 123 == n && r && (r = t._extend(t.formatURL, r))
                    }
                };
                return {
                    isIOS: t.isIOS,
                    isKugouAndroid: t.isKugouAndroid,
                    isAndroid: t.isAndroid,
                    isInClient: function () {
                        return !(!t.isAndroid && !t.isKugouAndroid && !t.isIOS)
                    },
                    mobileCall: function (n, r, e) {
                        var o = "";
                        if (r && (o = t.json2Str(r)),
                            !n)
                            return console.error("请输入命令号！"),
                                !1;
                        var i = {};
                        n && (i.cmd = n),
                            "" != o && (i.jsonStr = o),
                            e && (i.callback = e),
                            n && 186 == n && e && (i.AndroidCallback = !0),
                            t.callCmd(i)
                    },
                    KgWebMobileCall: function (t, n) {
                        if (t)
                            try {
                                var r = t.split(".");
                                r.reduce(function (e, o) {
                                    if (e[o]) {
                                        if (o === r[r.length - 1]) {
                                            var i = e[o];
                                            return "function" == typeof i ? (e[o] = function (t) {
                                                i && i(t),
                                                    n && n(t)
                                            }
                                                ,
                                                e[o]) : (console.error("请检查，当前环境变量已注册了对象：" + t + "，且该对象不是方法"),
                                                    null)
                                        }
                                        return e[o]
                                    }
                                    return o === r[r.length - 1] ? e[o] = function (t) {
                                        n && n(t)
                                    }
                                        : e[o] = new Object,
                                        e[o]
                                }, window)
                            } catch (t) { }
                    }
                }
            }()
        }()
    })
        , a = e(function (t) {
            !function () {
                var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
                    , r = {
                        rotl: function (t, n) {
                            return t << n | t >>> 32 - n
                        },
                        rotr: function (t, n) {
                            return t << 32 - n | t >>> n
                        },
                        endian: function (t) {
                            if (t.constructor == Number)
                                return 16711935 & r.rotl(t, 8) | 4278255360 & r.rotl(t, 24);
                            for (var n = 0; n < t.length; n++)
                                t[n] = r.endian(t[n]);
                            return t
                        },
                        randomBytes: function (t) {
                            for (var n = []; t > 0; t--)
                                n.push(Math.floor(256 * Math.random()));
                            return n
                        },
                        bytesToWords: function (t) {
                            for (var n = [], r = 0, e = 0; r < t.length; r++,
                                e += 8)
                                n[e >>> 5] |= t[r] << 24 - e % 32;
                            return n
                        },
                        wordsToBytes: function (t) {
                            for (var n = [], r = 0; r < 32 * t.length; r += 8)
                                n.push(t[r >>> 5] >>> 24 - r % 32 & 255);
                            return n
                        },
                        bytesToHex: function (t) {
                            for (var n = [], r = 0; r < t.length; r++)
                                n.push((t[r] >>> 4).toString(16)),
                                    n.push((15 & t[r]).toString(16));
                            return n.join("")
                        },
                        hexToBytes: function (t) {
                            for (var n = [], r = 0; r < t.length; r += 2)
                                n.push(parseInt(t.substr(r, 2), 16));
                            return n
                        },
                        bytesToBase64: function (t) {
                            for (var r = [], e = 0; e < t.length; e += 3)
                                for (var o = t[e] << 16 | t[e + 1] << 8 | t[e + 2], i = 0; i < 4; i++)
                                    8 * e + 6 * i <= 8 * t.length ? r.push(n.charAt(o >>> 6 * (3 - i) & 63)) : r.push("=");
                            return r.join("")
                        },
                        base64ToBytes: function (t) {
                            t = t.replace(/[^A-Z0-9+\/]/gi, "");
                            for (var r = [], e = 0, o = 0; e < t.length; o = ++e % 4)
                                0 != o && r.push((n.indexOf(t.charAt(e - 1)) & Math.pow(2, -2 * o + 8) - 1) << 2 * o | n.indexOf(t.charAt(e)) >>> 6 - 2 * o);
                            return r
                        }
                    };
                t.exports = r
            }()
        })
        , l = {
            utf8: {
                stringToBytes: function (t) {
                    return l.bin.stringToBytes(unescape(encodeURIComponent(t)))
                },
                bytesToString: function (t) {
                    return decodeURIComponent(escape(l.bin.bytesToString(t)))
                }
            },
            bin: {
                stringToBytes: function (t) {
                    for (var n = [], r = 0; r < t.length; r++)
                        n.push(255 & t.charCodeAt(r));
                    return n
                },
                bytesToString: function (t) {
                    for (var n = [], r = 0; r < t.length; r++)
                        n.push(String.fromCharCode(t[r]));
                    return n.join("")
                }
            }
        }
        , u = l
        , f = function (t) {
            return null != t && (o(t) || i(t) || !!t._isBuffer)
        }
        , d = e(function (t) {
            !function () {
                var n = a
                    , r = u.utf8
                    , e = f
                    , o = u.bin
                    , i = function (t, c) {
                        t.constructor == String ? t = c && "binary" === c.encoding ? o.stringToBytes(t) : r.stringToBytes(t) : e(t) ? t = Array.prototype.slice.call(t, 0) : Array.isArray(t) || (t = t.toString());
                        for (var s = n.bytesToWords(t), a = 8 * t.length, l = 1732584193, u = -271733879, f = -1732584194, d = 271733878, g = 0; g < s.length; g++)
                            s[g] = 16711935 & (s[g] << 8 | s[g] >>> 24) | 4278255360 & (s[g] << 24 | s[g] >>> 8);
                        s[a >>> 5] |= 128 << a % 32,
                            s[14 + (a + 64 >>> 9 << 4)] = a;
                        for (var b = i._ff, p = i._gg, h = i._hh, m = i._ii, g = 0; g < s.length; g += 16) {
                            var y = l
                                , j = u
                                , S = f
                                , v = d;
                            u = m(u = m(u = m(u = m(u = h(u = h(u = h(u = h(u = p(u = p(u = p(u = p(u = b(u = b(u = b(u = b(u, f = b(f, d = b(d, l = b(l, u, f, d, s[g + 0], 7, -680876936), u, f, s[g + 1], 12, -389564586), l, u, s[g + 2], 17, 606105819), d, l, s[g + 3], 22, -1044525330), f = b(f, d = b(d, l = b(l, u, f, d, s[g + 4], 7, -176418897), u, f, s[g + 5], 12, 1200080426), l, u, s[g + 6], 17, -1473231341), d, l, s[g + 7], 22, -45705983), f = b(f, d = b(d, l = b(l, u, f, d, s[g + 8], 7, 1770035416), u, f, s[g + 9], 12, -1958414417), l, u, s[g + 10], 17, -42063), d, l, s[g + 11], 22, -1990404162), f = b(f, d = b(d, l = b(l, u, f, d, s[g + 12], 7, 1804603682), u, f, s[g + 13], 12, -40341101), l, u, s[g + 14], 17, -1502002290), d, l, s[g + 15], 22, 1236535329), f = p(f, d = p(d, l = p(l, u, f, d, s[g + 1], 5, -165796510), u, f, s[g + 6], 9, -1069501632), l, u, s[g + 11], 14, 643717713), d, l, s[g + 0], 20, -373897302), f = p(f, d = p(d, l = p(l, u, f, d, s[g + 5], 5, -701558691), u, f, s[g + 10], 9, 38016083), l, u, s[g + 15], 14, -660478335), d, l, s[g + 4], 20, -405537848), f = p(f, d = p(d, l = p(l, u, f, d, s[g + 9], 5, 568446438), u, f, s[g + 14], 9, -1019803690), l, u, s[g + 3], 14, -187363961), d, l, s[g + 8], 20, 1163531501), f = p(f, d = p(d, l = p(l, u, f, d, s[g + 13], 5, -1444681467), u, f, s[g + 2], 9, -51403784), l, u, s[g + 7], 14, 1735328473), d, l, s[g + 12], 20, -1926607734), f = h(f, d = h(d, l = h(l, u, f, d, s[g + 5], 4, -378558), u, f, s[g + 8], 11, -2022574463), l, u, s[g + 11], 16, 1839030562), d, l, s[g + 14], 23, -35309556), f = h(f, d = h(d, l = h(l, u, f, d, s[g + 1], 4, -1530992060), u, f, s[g + 4], 11, 1272893353), l, u, s[g + 7], 16, -155497632), d, l, s[g + 10], 23, -1094730640), f = h(f, d = h(d, l = h(l, u, f, d, s[g + 13], 4, 681279174), u, f, s[g + 0], 11, -358537222), l, u, s[g + 3], 16, -722521979), d, l, s[g + 6], 23, 76029189), f = h(f, d = h(d, l = h(l, u, f, d, s[g + 9], 4, -640364487), u, f, s[g + 12], 11, -421815835), l, u, s[g + 15], 16, 530742520), d, l, s[g + 2], 23, -995338651), f = m(f, d = m(d, l = m(l, u, f, d, s[g + 0], 6, -198630844), u, f, s[g + 7], 10, 1126891415), l, u, s[g + 14], 15, -1416354905), d, l, s[g + 5], 21, -57434055), f = m(f, d = m(d, l = m(l, u, f, d, s[g + 12], 6, 1700485571), u, f, s[g + 3], 10, -1894986606), l, u, s[g + 10], 15, -1051523), d, l, s[g + 1], 21, -2054922799), f = m(f, d = m(d, l = m(l, u, f, d, s[g + 8], 6, 1873313359), u, f, s[g + 15], 10, -30611744), l, u, s[g + 6], 15, -1560198380), d, l, s[g + 13], 21, 1309151649), f = m(f, d = m(d, l = m(l, u, f, d, s[g + 4], 6, -145523070), u, f, s[g + 11], 10, -1120210379), l, u, s[g + 2], 15, 718787259), d, l, s[g + 9], 21, -343485551),
                                l = l + y >>> 0,
                                u = u + j >>> 0,
                                f = f + S >>> 0,
                                d = d + v >>> 0
                        }
                        return n.endian([l, u, f, d])
                    };
                i._ff = function (t, n, r, e, o, i, c) {
                    var s = t + (n & r | ~n & e) + (o >>> 0) + c;
                    return (s << i | s >>> 32 - i) + n
                }
                    ,
                    i._gg = function (t, n, r, e, o, i, c) {
                        var s = t + (n & e | r & ~e) + (o >>> 0) + c;
                        return (s << i | s >>> 32 - i) + n
                    }
                    ,
                    i._hh = function (t, n, r, e, o, i, c) {
                        var s = t + (n ^ r ^ e) + (o >>> 0) + c;
                        return (s << i | s >>> 32 - i) + n
                    }
                    ,
                    i._ii = function (t, n, r, e, o, i, c) {
                        var s = t + (r ^ (n | ~e)) + (o >>> 0) + c;
                        return (s << i | s >>> 32 - i) + n
                    }
                    ,
                    i._blocksize = 16,
                    i._digestsize = 16,
                    t.exports = function (t, r) {
                        if (void 0 === t || null === t)
                            throw new Error("Illegal argument " + t);
                        var e = n.wordsToBytes(i(t, r));
                        return r && r.asBytes ? e : r && r.asString ? o.bytesToString(e) : n.bytesToHex(e)
                    }
            }()
        });
    return c;
});

function getSignedParams(params) {
    var mid = kgUser.getKgMid();

    params.mid = mid;
    params.uuid = mid;

    return infSign(params, null);
}

export { getSignedParams };

// Debug only
// console.log(getParams('7q696414', 0))
// console.log(getParams('青空Magic Day', 1))
