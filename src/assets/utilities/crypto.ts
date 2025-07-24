import CryptoJS from "crypto-js";

function uuidv4(): string {
    // Use crypto.getRandomValues if available for secure random numbers
    const getRandomValues = (typeof crypto !== "undefined" && crypto.getRandomValues)
        ? crypto.getRandomValues.bind(crypto)
        : null;

    const rnds = new Uint8Array(16);
    if (getRandomValues) {
        getRandomValues(rnds);
    } else {
        // Fallback to Math.random (less secure)
        for (let i = 0; i < 16; i++) {
            rnds[i] = Math.floor(Math.random() * 256);
        }
    }

    // Per RFC4122
    rnds[6] = (rnds[6] & 0x0f) | 0x40; // version 4
    rnds[8] = (rnds[8] & 0x3f) | 0x80; // variant

    const hex = Array.from(rnds, b => b.toString(16).padStart(2, "0")).join("");
    return (
        hex.slice(0, 8) + "-" +
        hex.slice(8, 12) + "-" +
        hex.slice(12, 16) + "-" +
        hex.slice(16, 20) + "-" +
        hex.slice(20)
    );
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
