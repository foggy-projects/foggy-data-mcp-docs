import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, '.vitepress', 'dist');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 5173);
const basePath = normalizeBasePath(process.env.BASE_PATH || '/foggy-data-mcp-docs/');

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

if (!fs.existsSync(distDir)) {
  console.error(`Build output not found: ${distDir}`);
  console.error('Run `npm run build` first, or use `npm run serve:lan`.');
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === '/' && basePath !== '/') {
    redirect(response, basePath);
    return;
  }

  if (!pathname.startsWith(basePath)) {
    notFound(response);
    return;
  }

  const relativePath = pathname.slice(basePath.length);
  const filePath = resolveFilePath(relativePath);

  if (!filePath) {
    notFound(response);
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': contentTypes.get(extension) || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Serving ${distDir}`);
  console.log(`Local:   http://127.0.0.1:${port}${basePath}`);
  for (const address of getLanAddresses()) {
    console.log(`Network: http://${address}:${port}${basePath}`);
  }
});

server.on('error', error => {
  console.error(error.message);
  process.exit(1);
});

function normalizeBasePath(value) {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function resolveFilePath(relativePath) {
  const cleanRelativePath = relativePath.replace(/^\/+/, '');
  const candidates = [];

  if (cleanRelativePath === '') {
    candidates.push(path.join(distDir, 'index.html'));
  } else {
    const directPath = path.join(distDir, cleanRelativePath);
    candidates.push(directPath);
    candidates.push(path.join(directPath, 'index.html'));
    candidates.push(`${directPath}.html`);
  }

  for (const candidate of candidates) {
    const resolvedPath = path.resolve(candidate);
    if (!resolvedPath.startsWith(distDir + path.sep) && resolvedPath !== distDir) {
      continue;
    }
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      return resolvedPath;
    }
  }

  return null;
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function notFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(address => address && address.family === 'IPv4' && !address.internal)
    .map(address => address.address);
}
