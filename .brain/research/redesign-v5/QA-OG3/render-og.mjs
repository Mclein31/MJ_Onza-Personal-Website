import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const outPath = join(root, 'assets/images/og-image.jpg');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

function readJpegDimensions(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.route('https://og.local/**', async (route) => {
    let reqPath = normalize(decodeURIComponent(new URL(route.request().url()).pathname));
    if (reqPath.endsWith('/')) reqPath += 'index.html';
    try {
      const body = await readFile(join(root, reqPath));
      await route.fulfill({
        status: 200,
        contentType: mime[extname(reqPath).toLowerCase()] || 'application/octet-stream',
        body,
      });
    } catch {
      await route.fulfill({ status: 404, body: 'Not found' });
    }
  });

  await page.goto('https://og.local/.brain/research/redesign-v5/QA-OG3/og-preview.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 85 });

  const info = await stat(outPath);
  const buf = await readFile(outPath);
  const dims = readJpegDimensions(buf);
  console.log(JSON.stringify({
    path: 'assets/images/og-image.jpg',
    bytes: info.size,
    kb: Number((info.size / 1024).toFixed(1)),
    dimensions: dims,
  }));
} finally {
  await browser.close();
}
