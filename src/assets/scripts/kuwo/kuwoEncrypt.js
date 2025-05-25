var t = {}
, o = {
    32: 0
}
, d = [];
const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789"

function r(l){
    var s = "";

    for (let i = 1; i <= l; i++){
        s += c[Math.floor(Math.random() * (c.length - 1))]
    }

    return s;
}

function f(t, e) {
    if (null == e || e.length <= 0)
        return null;
    for (var n = "", i = 0; i < e.length; i++)
        n += e.charCodeAt(i).toString();
    var o = Math.floor(n.length / 5)
      , r = parseInt(n.charAt(o) + n.charAt(2 * o) + n.charAt(3 * o) + n.charAt(4 * o) + n.charAt(5 * o))
      , c = Math.ceil(e.length / 2)
      , l = Math.pow(2, 31) - 1;
    if (r < 2)
        return null;
    var d = Math.round(1e9 * Math.random()) % 1e8;
    for (n += d; n.length > 10; )
        n = (parseInt(n.substring(0, 10)) + parseInt(n.substring(10, n.length))).toString();
    n = (r * n + c) % l;
    var f = ""
      , h = "";
    for (i = 0; i < t.length; i++)
        h += (f = parseInt(t.charCodeAt(i) ^ Math.floor(n / l * 255))) < 16 ? "0" + f.toString(16) : f.toString(16),
        n = (r * n + c) % l;
    for (d = d.toString(16); d.length < 8; )
        d = "0" + d;
    return h += d
}

function getUuid(t = undefined, e = undefined, n = undefined) {
    var r, o;
    var l = function(){
        var n = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && "function" == typeof window.msCrypto.getRandomValues && msCrypto.getRandomValues.bind(msCrypto);
        var r = new Uint8Array(16);
        return n(r), 
        r;
    }
    var c = function(t, e){
        for (var n = [], i = 0; i < 256; ++i)
            n[i] = (i + 256).toString(16).substr(1);
        var i = e || 0, r = n;
        return [r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]]].join("");
    };
    var  d = 0, h = 0;
    var i = e && n || 0
      , b = e || []
      , f = (t = t || {}).node || r
      , v = void 0 !== t.clockseq ? t.clockseq : o;
    if (null == f || null == v) {
        var m = l();
        null == f && (f = r = [1 | m[0], m[1], m[2], m[3], m[4], m[5]]),
        null == v && (v = o = 16383 & (m[6] << 8 | m[7]))
    }
    var y = void 0 !== t.msecs ? t.msecs : (new Date).getTime()
      , w = void 0 !== t.nsecs ? t.nsecs : h + 1
      , dt = y - d + (w - h) / 1e4;
    if (dt < 0 && void 0 === t.clockseq && (v = v + 1 & 16383),
    (dt < 0 || y > d) && void 0 === t.nsecs && (w = 0),
    w >= 1e4)
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    d = y,
    h = w,
    o = v;
    var x = (1e4 * (268435455 & (y += 122192928e5)) + w) % 4294967296;
    b[i++] = x >>> 24 & 255,
    b[i++] = x >>> 16 & 255,
    b[i++] = x >>> 8 & 255,
    b[i++] = 255 & x;
    var A = y / 4294967296 * 1e4 & 268435455;
    b[i++] = A >>> 8 & 255,
    b[i++] = 255 & A,
    b[i++] = A >>> 24 & 15 | 16,
    b[i++] = A >>> 16 & 255,
    b[i++] = v >>> 8 | 128,
    b[i++] = 255 & v;
    for (var _ = 0; _ < 6; ++_)
        b[i + _] = f[_];
    return e || c(b)
}

function getKuwoParams(){
    let p = {};

    p.uuid = getUuid();
    p.hm_iuvt = r(32);
    p.secret = f(p.hm_iuvt, "Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324");

    return p;
}

// console.log(getKuwoParams());
export { getKuwoParams };
