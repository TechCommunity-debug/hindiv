/**
 * Renders every /print/ route in dist/ to a PDF under dist/pdf/.
 *
 * Runs after `astro build`, so the PDFs are ordinary static files by the
 * time anything is deployed: no serverless function, no cold start, no
 * per-request render, and a CDN can cache them forever. The alternative
 * — generating on demand — would put a headless browser in the request
 * path of a download link that exists precisely because the reader's
 * connection is slow.
 *
 * It drives the system Chrome through playwright-core rather than
 * `playwright`, which keeps the dependency at ~14 MB and skips the
 * ~150 MB browser download on every CI run. Any recent Chrome or
 * Chromium will do; point PDF_CHROME at one if it is somewhere unusual.
 *
 * Set SKIP_PDF=1 to build the site without the PDFs — useful on a
 * machine with no browser, at the cost of dead download links.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, readFile } from 'node:fs/promises';
import { dirname, join, normalize, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const MANIFEST = join(DIST, 'pdf-manifest.json');

/** Only what a statically-built Astro page can actually ask for. */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

/**
 * A static server over dist/, rather than loading the pages as file://
 * URLs. Astro emits root-absolute asset paths (/_astro/..., and the
 * self-hosted font faces), every one of which resolves to the
 * filesystem root under file:// — the PDFs would come out unstyled and
 * set in whatever fallback face Chrome had lying around.
 */
function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      // normalize() collapses any ../ before it can escape dist/.
      let path = join(DIST, normalize(decodeURIComponent(url.pathname)));
      if (!path.startsWith(DIST)) {
        res.writeHead(403).end();
        return;
      }

      // trailingSlash: 'always' means routes are directories on disk.
      const info = await stat(path).catch(() => null);
      if (info?.isDirectory()) path = join(path, 'index.html');

      const body = await stat(path).catch(() => null);
      if (!body?.isFile()) {
        res.writeHead(404).end('Not found');
        return;
      }

      res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
      createReadStream(path).pipe(res);
    } catch {
      res.writeHead(500).end();
    }
  });

  return new Promise((ok) => {
    // Port 0: let the OS pick, so a dev server already on 4321 (or a
    // parallel CI job) cannot collide with the build.
    server.listen(0, '127.0.0.1', () => ok({ server, port: server.address().port }));
  });
}

/**
 * Chrome's own header/footer templates, which is the only way to get a
 * running page number into the output. Kept to Latin and the site's
 * grey: the templates render in an isolated context that does not see
 * the page's @font-face rules, so Devanagari here would come out as
 * tofu. `pageNumber`/`totalPages` are substituted by Chrome.
 */
const FOOTER = `
  <div style="width:100%;font-family:system-ui,sans-serif;font-size:8px;color:#7e7e88;
              padding:0 14mm;display:flex;justify-content:space-between;">
    <span>hindivyakaran.net</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

const EMPTY_HEADER = '<div></div>';

async function renderPdf(page, origin, route, outPath) {
  const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
  if (!response?.ok()) {
    throw new Error(`${route} returned ${response?.status() ?? 'no response'}`);
  }

  /*
    The single most important line in this file. Devanagari matras and
    conjuncts are shaped by the font, not synthesised by the renderer,
    so printing before the Noto faces have loaded does not produce an
    ugly PDF — it produces forty pages of tofu boxes, and the build
    still exits 0. Waiting on document.fonts.ready is what makes that
    failure impossible rather than merely unlikely.
  */
  await page.evaluate(() => document.fonts.ready);

  await mkdir(dirname(outPath), { recursive: true });
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: EMPTY_HEADER,
    footerTemplate: FOOTER,
    // Generous outer margins: Devanagari sets taller than Latin at the
    // same point size, and a cramped measure is unreadable on paper.
    margin: { top: '16mm', bottom: '16mm', left: '16mm', right: '16mm' },
  });

  const { size } = await stat(outPath);
  return size;
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  if (process.env.SKIP_PDF === '1') {
    console.log('[pdf] SKIP_PDF=1 — skipping PDF generation (download links will 404)');
    return;
  }

  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const { server, port } = await serveDist();
  const origin = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({
    executablePath: process.env.PDF_CHROME || undefined,
    channel: process.env.PDF_CHROME ? undefined : 'chrome',
  });

  const started = Date.now();
  let total = 0;

  try {
    const page = await browser.newPage();

    // The whole book first: it is by far the slowest render, so if
    // something is wrong with the pipeline the build fails in seconds
    // rather than after forty successful topic PDFs.
    const jobs = [manifest.complete, ...manifest.topics];

    for (const job of jobs) {
      const out = join(DIST, job.pdf);
      const size = await renderPdf(page, origin, job.print, out);
      total += size;
      console.log(`[pdf] ${job.pdf.padEnd(44)} ${kb(size).padStart(8)}  ${job.title}`);
    }

    console.log(
      `[pdf] ${jobs.length} files, ${kb(total)} total, ${((Date.now() - started) / 1000).toFixed(1)}s`,
    );
  } finally {
    await browser.close();
    server.close();
  }

  // The manifest is build scaffolding, not something to deploy.
  await rm(MANIFEST, { force: true });
}

main().catch((error) => {
  console.error('\n[pdf] generation failed:', error.message);
  console.error(
    '[pdf] Needs a Chrome/Chromium install. Set PDF_CHROME to its path,\n' +
      '[pdf] or SKIP_PDF=1 to build the site without downloadable PDFs.',
  );
  process.exit(1);
});
