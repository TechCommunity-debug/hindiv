// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hindivyakaran.net',
  trailingSlash: 'always',

  integrations: [mdx(), sitemap()],

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
