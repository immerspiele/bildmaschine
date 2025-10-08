import config from './config.mjs';
import http from 'node:http';
import path from 'node:path';
import { createWriteStream, createReadStream } from 'node:fs';
import { fileExists, ensureDirectoryExists } from './utils.mjs';
import { createHmac } from 'node:crypto';
import { perform } from './processor.mjs';
import parseFileName from './parseFileName.mjs';

const BASE_URL = `http://${config.host}:${config.port}`;
const DESTINATION = path.resolve(config.destination);
const GENERATE_HTML_PATH = path.resolve('./static/generate.html');

const server = http.createServer(async (request, response) => {
  const url = new URL(`${BASE_URL}${request.url}`);
  let pathname = url.pathname;

  if (request.method !== 'GET') {
    response.writeHead(405, { 'Content-Type': 'text/plain' });
    response.end('Method not allowed\n');
    return;
  }

  if (pathname === '/generate') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    const htmlStream = createReadStream(GENERATE_HTML_PATH);
    htmlStream.pipe(response);
    return;
  }

  if (url.pathname.startsWith(config.path) === false) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found\n');
    return;
  }

  pathname = pathname.slice(config.path.length);

  if (!pathname) {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.end('Missing path\n');
    return;
  }

  const query = parseFileName(pathname);

  if (!query) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Invalid file query\n');
    return;
  }

  // Check if image exists in destination
  const destination = path.join(DESTINATION, query.destinationFilePath);
  if (await fileExists(destination)) {
    const readStream = createReadStream(destination);
    response.writeHead(200, {
      'Content-Type': query.format.mime,
      'X-Bildmaschine-Cache': 'HIT',
    });
    readStream.pipe(response);
    return;
  }

  if (url.searchParams.has('s') === false) {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.end('Missing signature\n');
    return;
  }

  const providedSignature = url.searchParams.get('s');

  if (!query.bucket) {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.end('Missing bucket\n');
    return;
  }

  const bucket = config.buckets[query.bucket];

  const signature = createHmac('sha256', bucket.key)
    .update(query.queryString + ':' + query.filePath)
    .digest('hex')
    .slice(0, 10);

  if (signature !== providedSignature) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    response.end('Invalid signature\n');
    return;
  }

  try {
    const result = await perform(query);
    response.writeHead(200, {
      'Content-Type': result.format.mime,
      'X-Bildmaschine-Cache': 'MISS',
    });

    result.stream.pipe(response);

    // Write stream to file
    await ensureDirectoryExists(destination);
    const fileStream = createWriteStream(destination);

    result.stream.pipe(fileStream);
  } catch (error) {
    console.log(error)
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end(`Error processing image: ${error.message}\n`);
  }
});

export default server;
