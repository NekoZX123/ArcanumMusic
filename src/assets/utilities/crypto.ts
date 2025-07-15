import CryptoJS from "crypto-js";

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function getNewPassword() {
    let uuid = uuidv4();
    const username = await window.electron.getUserName();
    const usernameHash = CryptoJS.SHA256(username);
    const password = `moe.nekozx.arcanummusic.pwd#${uuid}@${usernameHash}`;
    return password;
}
async function encrypt(plainText: string) {
    const password = await getNewPassword();
    console.log(`[Debug] Password: ${password}`);
    const passwordUuid = password.split('#')[1].split('@')[0];
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

    const b64uuid = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(passwordUuid));
    const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const encryptIv = iv.toString(CryptoJS.enc.Base64);
    const encryptSalt = salt.toString(CryptoJS.enc.Base64);
    const fileContent = `${b64uuid}*${cipherText}*${encryptIv}*${encryptSalt}`;
    const hash = CryptoJS.SHA256(fileContent).toString();

    return `${fileContent}@${hash}`;
};

async function decrypt(cipher: string) {
    const [fileContent, hash] = cipher.split('@');
    const hashExpected = CryptoJS.SHA256(fileContent).toString();
    if (hash !== hashExpected) {
        console.error(`Hash mismatch: expected ${hashExpected}, got ${hash}`);
        return null;
    }
    const cipherData = fileContent.split('*');
    const [b64uuid, cipherText, iv, salt] = cipherData;

    const passwordUuid = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(b64uuid));
    const username = await window.electron.getUserName();
    const usernameHash = CryptoJS.SHA256(username);
    const password = `moe.nekozx.arcanummusic.pwd#${passwordUuid}@${usernameHash}`;

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
