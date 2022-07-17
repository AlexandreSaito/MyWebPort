import url from 'url';
import fs from 'fs';

function getFileContent({ fileName }) {
    if (fileName == undefined)
        return '';
    if (fs.existsSync(fileName)) {
        //console.log(`reading file '${fileName}'`);
        return fs.readFileSync(fileName).toString();
    }

    console.log(`file do not exists '${fileName}'`);
    return '';
}

export { getFileContent };