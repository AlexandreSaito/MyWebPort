import { getFileContent } from '../webMethods.js';

const defaultPagesFolder = './pages';
const defaultCssFolder = './css';
const defaultJsFolder = './js';

const folders = {
    defaultPagesFolder,
    defaultCssFolder,
    defaultJsFolder
};

function createPage({ name, preProcess, headerTitle = '', pagesFolder = '', csss = [], jss = [], replaces = [], replaceLayout = true }) {

    if (preProcess == undefined)
        preProcess = ({ }) => { };

    return {
        name: name,
        preProcess: async () => { preProcess },
        pagesFolder: pagesFolder,
        replaceLayout: replaceLayout,
        replaces: replaces,
        csss: csss,
        js:jss,
        getPage: async function () {
            return getFileContent({ fileName: `${this.pagesFolder}/${this.name}.html` });
        },
        getPageHeader: function () {
            return headerTitle;
        },
        getPageStyles: function () {
            let css = '';
            csss.forEach(x => css += x)
            return css;
        },
        getPageScript: function () {
            let js = '';
            jss.forEach(x => js += x);
            return js;
        },
    }
}

export { folders, createPage };