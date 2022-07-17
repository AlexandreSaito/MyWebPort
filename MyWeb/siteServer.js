import url from 'url';
import http from 'http';
import fs from 'fs';
import { getFileContent } from './webMethods.js';
import { getModule } from './helpers.js';
import { create } from 'domain';
const port = process.env.PORT || 1337;

var server = null;
const pagesFolder = './pages';

const layout = () => getFileContent({ fileName: `${pagesFolder}/_layout.html` });

const mime = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/stylesheet',
    txt: 'text/plain',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+html',
    json: 'application/json',
};

async function createServer() {
    console.log(`starting server...`);
    server = http.createServer(async function (req, res) {
        const q = url.parse(req.url, true);
        const query = q.query;

        var path = q.pathname;
        if (path == '/')
            path = '/index';

        console.log(`Searching: ${path}`);

        let pattern = /\.[a-z]{1,5}$/i;
        if (!path.match(pattern)) {
            var routes = path.split('/').filter(x => x != '');

            if (routes.length <= 1) {
                routes.unshift('default');
            }

            let routeJS = `./webPages/${routes[0]}.js`;
            if (fs.existsSync(routeJS)) {
                getModule(routeJS).then((module) => {
                    let page = module[routes[1]];
                    if (page != undefined) {
                        page.preProcess({ self: page }).then(() => {
                            getHtmlFromPage(page).then(htmlPage => {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.write(htmlPage);
                                res.end();
                            });
                        });
                    }
                });
            }
            // Implementar webMethods AKA Post methods
            //else {
            //    routeJS = `./webMethods/${routes[0]}.js`;
            //    if (fs.existsSync(routeJS)) {
            //        //console.log(`importing ${routeJS}`);
            //        //let mod = await getModule(routeJS);
            //        //let page = mod[routes[1]];
            //        //console.log(`Not avaliable: ${path}`);
            //        res.writeHead(504, { 'Content-Type': 'text/html' });
            //        return res.end();
            //    }
            //}

        } else {
            let dotIndex = path.lastIndexOf('.') + 1;
            let type = path.slice(dotIndex);
            var s = fs.createReadStream(`.${path}`);
            s.on('open', function () {
                res.setHeader('Content-Type', mime[type]);
                s.pipe(res);
            });
            s.on('error', function (e) {
                console.log("error on read stream");
                console.log(e);
                res.setHeader('Content-Type', 'text/plain');
                res.statusCode = 404;
                res.end('Not Found');
            });
        }

    }).listen(port);
}

async function getHtmlFromPage(page) {
    let htmlPage = await page.getPage();
    if (page.replaceLayout) {
        htmlPage = layout()
            .replaceAll('[pageContent]', htmlPage)
            .replaceAll('[pageScript]', page.getPageScript())
            .replaceAll('[pageHeader]', page.getPageHeader())
            .replaceAll('[pageStyles]', page.getPageStyles());

    }

    page.replaces.forEach(x => { htmlPage = htmlPage.replaceAll(x.name, x.new) });

    return htmlPage;
}

function getServer() {
    return server;
}

var Site = { createServer: createServer, getServer: getServer };

export default Site;