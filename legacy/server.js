const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 8080;
const journeysPath = path.join(root, 'data', 'journeys.json');

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function send(res, status, body, type) {
    res.writeHead(status, {
        'Content-Type': type || 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 20 * 1024 * 1024) {
                reject(new Error('Request body too large'));
                req.destroy();
            }
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

function resolveStaticPath(urlPath) {
    const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
    const requested = cleanPath === '/' ? '/index.html' : cleanPath;
    const filePath = path.normalize(path.join(root, requested));
    if (!filePath.startsWith(root)) return null;
    return filePath;
}

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        if (req.method === 'POST' && url.pathname === '/api/journeys') {
            const body = await readBody(req);
            const data = JSON.parse(body);
            if (!Array.isArray(data)) {
                return send(res, 400, JSON.stringify({ ok: false, error: 'Expected an array' }), 'application/json; charset=utf-8');
            }
            fs.mkdirSync(path.dirname(journeysPath), { recursive: true });
            fs.writeFileSync(journeysPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
            return send(res, 200, JSON.stringify({ ok: true, path: 'data/journeys.json' }), 'application/json; charset=utf-8');
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return send(res, 405, 'Method not allowed');
        }

        const filePath = resolveStaticPath(url.pathname);
        if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return send(res, 404, 'Not found');
        }

        const ext = path.extname(filePath).toLowerCase();
        const type = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': ext === '.json' ? 'no-store' : 'no-cache',
        });
        if (req.method === 'HEAD') return res.end();
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        console.error(err);
        send(res, 500, JSON.stringify({ ok: false, error: err.message }), 'application/json; charset=utf-8');
    }
});

server.listen(port, () => {
    console.log(`HSN Journeys local server: http://127.0.0.1:${port}`);
    console.log('Saving in the website will update data/journeys.json.');
});
