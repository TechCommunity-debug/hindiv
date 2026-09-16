import type { APIRoute } from 'astro';
import { getAllTopics, categoryTitle } from '../lib/content';
import {
  printUrl,
  pdfUrl,
  COMPLETE_PRINT_URL,
  COMPLETE_PDF_URL,
} from '../lib/pdf';

/**
 * The build plan handed from Astro to scripts/generate-pdfs.mjs.
 *
 * The renderer is a plain Node script: it cannot import `astro:content`,
 * so without this it would have to re-derive the topic list by parsing
 * MDX frontmatter itself — a second, silently divergent copy of the
 * routing rules in src/lib/pdf.ts. Instead Astro, which already knows
 * every route it just built, writes down what to render and where to
 * put it, and the script only executes.
 *
 * It is scaffolding, not a public endpoint: generate-pdfs.mjs deletes
 * dist/pdf-manifest.json once it has read it, and astro.config.mjs
 * keeps it out of the sitemap in the meantime.
 */
export const GET: APIRoute = async () => {
  const topics = await getAllTopics();

  const manifest = {
    complete: {
      print: COMPLETE_PRINT_URL,
      pdf: COMPLETE_PDF_URL,
      title: 'सम्पूर्ण हिंदी व्याकरण',
    },
    topics: topics.map((topic) => ({
      slug: topic.id,
      category: topic.data.category,
      categoryTitle: categoryTitle(topic.data.category),
      title: topic.data.title,
      print: printUrl(topic),
      pdf: pdfUrl(topic),
    })),
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
};
