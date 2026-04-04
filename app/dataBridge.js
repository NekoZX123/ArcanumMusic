const dataStroage = {
    songProgress: 0
};

const identifierList = ['moe.nekozx123.arcanummusic.desktoplyrics', 'moe.nekozx123.arcanummusic.audioplayer'];

function writeData(key, value, identifier) {
    if (!identifierList.includes(identifier)) {
        console.warn(`[Warning] Unauthorized identifier "${identifier}"`);
        return;
    }
    dataStroage[key] = value;
}

function readData(key, identifier) {
    if (!identifierList.includes(identifier)) {
        console.warn(`[Warning] Unauthorized identifier "${identifier}"`);
        return null;
    }
    return dataStroage[key];
}

export { writeData, readData };
