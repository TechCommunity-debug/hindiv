/**
 * Renders the social share cards into public/ as 1200×630 PNGs.
 *
 * These are committed, not built on every `astro build`, for two reasons.
 * They change only when the site's name or the topic count does, so
 * regenerating them 45 times a deploy would be waste; and a crawler that
 * asks for og:image must get a static file from the CDN rather than wait
 * behind a headless browser. Run it by hand after such a change:
 *
 *     node scripts/generate-og.mjs
 *
 * It drives the system Chrome through playwright-core, exactly as
 * generate-pdfs.mjs does — same dependency, same PDF_CHROME override, so
 * a machine that can build the PDFs can build these too. The Devanagari
 * comes from the system Noto faces; if the card renders as tofu boxes,
 * install fonts-noto-devanagari and run it again.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

/** Same palette as src/styles/global.css, light theme. */
const INK = '#17171a';
const BODY = '#3d3d45';
const CANVAS = '#fbfaf8';
const ACCENT = '#0761d1';
const HAIRLINE = '#e2ded7';

/** The seven खंड colours, for the spectrum rule along the top edge. */
const SPECTRUM = ['#7c4dff', '#0761d1', '#0b8a6b', '#b8860b', '#c2410c', '#be123c', '#6d28d9'];

/**
 * A card is the same layout every time: eyebrow, big two-line title,
 * one line of support, and a footer rule carrying the domain. Only the
 * strings change, so there is one template rather than one file per card.
 */
const card = ({ eyebrow, titleLatin, titleHindi, support, badge }) => `<!doctype html>
<html lang="hi">
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        background: ${CANVAS};
        font-family: 'Noto Sans Devanagari', sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .spectrum { display: flex; height: 10px; flex: 0 0 auto; }
      .spectrum span { flex: 1; }
      main { flex: 1; padding: 62px 72px 0; display: flex; flex-direction: column; }
      .eyebrow {
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: ${ACCENT};
      }
      h1 {
        margin-top: 26px;
        font-family: 'Noto Serif Devanagari', serif;
        font-size: 82px;
        font-weight: 700;
        line-height: 1.24;
        color: ${INK};
        letter-spacing: -0.01em;
      }
      h1 .hi { display: block; font-size: 72px; color: ${ACCENT}; }
      p {
        margin-top: 28px;
        font-size: 30px;
        line-height: 1.55;
        color: ${BODY};
        max-width: 960px;
      }
      footer {
        margin-top: auto;
        padding: 26px 72px 34px;
        border-top: 1px solid ${HAIRLINE};
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .domain { font-size: 28px; font-weight: 600; color: ${INK}; letter-spacing: -0.01em; }
      .badge {
        font-size: 24px;
        font-weight: 600;
        color: #fff;
        background: ${ACCENT};
        border-radius: 999px;
        padding: 10px 26px;
      }
    </style>
  </head>
  <body>
    <div class="spectrum">${SPECTRUM.map((c) => `<span style="background:${c}"></span>`).join('')}</div>
    <main>
      <div class="eyebrow">${eyebrow}</div>
      <h1>${titleLatin}<span class="hi">${titleHindi}</span></h1>
      <p>${support}</p>
    </main>
    <footer>
      <div class="domain">hindivyakaran.net</div>
      <div class="badge">${badge}</div>
    </footer>
  </body>
</html>`;

/**
 * Two cards, because the site has two distinct search intents and they
 * deserve different thumbnails in a share: the grammar itself, and the
 * downloadable book.
 */
const CARDS = [
  {
    file: 'og-image.png',
    eyebrow: 'संदर्भ · अध्ययन · अभ्यास',
    titleLatin: 'Hindi Vyakaran',
    titleHindi: 'हिंदी व्याकरण',
    support:
      'सम्पूर्ण हिंदी व्याकरण — सात खंड, 45 विषय। परिभाषा, भेद, उदाहरण और अभ्यास सहित, बिल्कुल मुफ़्त।',
    badge: 'मुफ़्त',
  },
  {
    file: 'og-pdf.png',
    eyebrow: 'डाउनलोड · मुफ़्त · बिना पंजीकरण',
    titleLatin: 'Hindi Vyakaran PDF',
    titleHindi: 'हिंदी व्याकरण PDF',
    support:
      'पूरी हिंदी व्याकरण बुक PDF में डाउनलोड करें — सात खंड, 45 विषय, अभ्यास-प्रश्नों के उत्तर सहित।',
    badge: 'PDF डाउनलोड',
  },
];

const browser = await chromium.launch({
  executablePath: process.env.PDF_CHROME || undefined,
  channel: process.env.PDF_CHROME ? undefined : 'chrome',
});

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  for (const { file, ...content } of CARDS) {
    await page.setContent(card(content), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: 'png' });
    await writeFile(join(PUBLIC, file), png);
    console.log(`og: public/${file} (${(png.length / 1024).toFixed(0)} KB)`);
  }
} finally {
  await browser.close();
}
