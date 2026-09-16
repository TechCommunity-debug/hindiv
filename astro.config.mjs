// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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

  // Sätteri (Astro 7's default Rust Markdown pipeline) is left as-is.
  // Table overflow is handled in CSS rather than by a hast plugin, which
  // keeps the Markdown toolchain dependency-free — see `prose-hi` in
  // src/styles/global.css.
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
