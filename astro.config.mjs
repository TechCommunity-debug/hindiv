// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/** Wraps every `<table>` in `<div class="table-scroll">` so the scroll
 *  container and the table layout are separate boxes — see the markdown
 *  config comment below for why that split is necessary. */
function wrapTablesForScroll() {
  return (/** @type {any} */ tree) => {
    /** @param {any} node */
    function visit(node) {
      if (!node.children) return;
      node.children = node.children.map((/** @type {any} */ child) => {
        visit(child);
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-scroll'] },
            children: [child],
          };
        }
        return child;
      });
    }
    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://hindivyakaran.net',
  trailingSlash: 'always',

  // The /print/ routes exist only to be rasterised into PDFs by
  // scripts/generate-pdfs.mjs; they are bare duplicates of real topic
  // pages, so listing them would be asking to be judged on duplicate
  // content. pdf-manifest.json is build scaffolding the same script
  // deletes on its way out. Both are also noindex at the page level —
  // this keeps them out of the sitemap as well, so nothing invites a
  // crawler to them in the first place.
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/print\/|\/pdf-manifest\.json$/.test(page),
    }),
  ],

  // Astro's HTML compressor collapses whitespace that spans a newline down to
  // nothing, so an inline <a> wrapped onto its own line in a paragraph loses
  // the space before it — "…पूछना हो तो<a>…". Prose here is wrapped for
  // readability and links sit mid-sentence all over the standing pages, so the
  // few bytes saved are not worth proof-reading every line break.
  compressHTML: false,

  vite: {
    plugins: [tailwindcss()],
  },

  // Devanagari-first type stack. Geist (per DESIGN.md) has no Devanagari
  // coverage, so the Noto Devanagari superfamily carries the site instead:
  // serif for headings (reference-book authority), sans for reading and UI.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans Devanagari',
      cssVariable: '--font-devanagari-sans',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['devanagari', 'latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Noto Serif Devanagari',
      cssVariable: '--font-devanagari-serif',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['devanagari', 'latin'],
      fallbacks: ['serif'],
    },
  ],

  // A table can't both stretch to fill when it fits and scroll when it
  // doesn't via CSS alone — display:block on the <table> itself leaves the
  // real (anonymous) table box shrink-wrapped inside it, stranding empty
  // space to the right whenever the columns are narrower than the
  // container. Wrapping each table in its own scroll div fixes that; the
  // scroll styling lives on `.table-scroll` in `prose-hi`,
  // src/styles/global.css. That wrap needs a rehype plugin, which needs
  // @astrojs/markdown-remark's unified pipeline in place of Astro 7's
  // default Rust processor (Sätteri) — the dependency this trades in for.
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
    rehypePlugins: [wrapTablesForScroll],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
