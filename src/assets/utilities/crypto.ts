import CryptoJS from "crypto-js";

function encrypt(plainText: string, password: string) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);

    // 通过 PBKDF2 派生密钥（AES-256）
    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA256
    });

    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return {
        cipherText: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Base64),
        salt: salt.toString(CryptoJS.enc.Base64)
    };
};

function decrypt(cipher: { iv: string, salt: string, cipherText: string }, password: string) {
    const { iv, salt, cipherText } = cipher;

    // 转换 IV 和 Salt 为 WordArray
    const ivWordArray = CryptoJS.enc.Base64.parse(iv);
    const saltWordArray = CryptoJS.enc.Base64.parse(salt);

    // 重新派生密钥
    const key = CryptoJS.PBKDF2(password, saltWordArray, {
        keySize: 256 / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA256
    });

    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
};

export { encrypt, decrypt };
