import { v1 as uuidv1 } from "uuid";

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

function getKuwoParams(){
    let p = {};

    const node = [];
    for (let i = 0; i < 6; i++) node.push(Math.floor(Math.random() * 256));
    p.uuid = uuidv1({
        'node': node,
        'nsecs': Math.floor(Math.random() * 9999)
    });
    p.hm_iuvt = r(32);
    p.secret = f(p.hm_iuvt, "Hm_Iuvt_cdb524f42f23cer9b268564v7y735ewrq2324");

    return p;
}

// console.log(getKuwoParams());
export { getKuwoParams };
