const http = require('http');
const url = require('url');
const fs = require('fs');
const lobby = require('./game_handle/lobby.js');
//https://socket.io/docs/v3/how-it-works/
const pagesFolder = "./pages";

const server = http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var query = q.query;
    if (q.pathname == '/')
        q.pathname = '/index';

    handlePages({ req: req, q: q, query: query, res: res });
});

server.listen(8080);
lobby.startServer(server);

function handlePages({ req, q, query, res }) {

    // criar exceções

    if (q.pathname.includes('/socket.io'))
        return;

    if (q.pathname.endsWith('.js') || q.pathname.endsWith('.css')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(getFile({ fileName: `.${q.pathname}` }));
        return res.end();
    }

    try {
        switch (q.pathname) {
            case 'kokoro':
                var page = getFile({ fileName: `${pagesFolder}${q.pathname}.html` });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(getFile({ fileName: `${pagesFolder}${q.pathname}.html` }));
                return res.end();
            default:
                //console.log(q);
                var layout = getLayoutPage();
                var page = getFile({ fileName: `${pagesFolder}${q.pathname}.html` });
                var pageScript = getHtmlScriptPage({ fileName: `${pagesFolder}${q.pathname}.js.html` });
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(layout
                    .replace('[PageContent]', page)
                    .replace('[PageScript]', pageScript));
                return res.end();
        }
    } catch (ex) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end(`<h3>404 Not Found</h3><p>${ex}</p>`);
    }

    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end("Not handled");
}

function getLayoutPage() {
    return fs.readFileSync(`${pagesFolder}/_layout.html`).toString();
}

function getFile({ fileName }) {
    return fs.readFileSync(fileName).toString();
}

function getHtmlScriptPage({ fileName }) {
    if (!fs.existsSync(fileName))
        return "";

    return fs.readFileSync(fileName).toString();
}