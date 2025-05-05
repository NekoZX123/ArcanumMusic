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

// 获取搜索 'searchId' 参数
var a = function(e, t) {
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
  , r = function(e, t) {
    for (var n = "".concat(e).split("").reverse(), a = "".concat(t).split("").reverse(), r = n.length, i = a.length, o = 0, c = 0, s = 0, l = 0, u = 0, m = Math.max(r, i); u < m; u++)
        c = u < r ? parseInt(n[u], 10) : 0,
        s = u < i ? parseInt(a[u], 10) : 0,
        l = Math.round(c) + Math.round(s) + o,
        n[u] = "".concat(l % 10),
        o = l >= 10 ? 1 : 0;
    return 1 == o && n.push("1"),
    n.reverse().join("")
}
  , i = function(e) {
    var t = a(e, "18014398509481984")
      , n = a(Math.round(Math.random() * parseInt("4194304", 10)), "4294967296")
      , i = new Date
      , o = 1e3 * (3600 * i.getHours() + 60 * i.getMinutes() + i.getSeconds()) + i.getMilliseconds();
    return r(r(t, n), o)
}

function getSearchId() {
    return i(3);
}

console.log(getSearchId())
