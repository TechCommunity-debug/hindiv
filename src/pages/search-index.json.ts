import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildKeys, type SearchRecord } from '../lib/search';
import { categories } from '../lib/taxonomy';
import { categoryTitle, categoryUrl, getAllTopics, topicUrl } from '../lib/content';

/**
 * The search index, emitted as a static JSON file at build time.
 *
 * Everything is prebuilt here — including the transliteration keys —
 * so the browser never runs the Devanagari→roman converter and search
 * stays instant on a mid-range Android phone over a 3G connection,
 * which is the realistic worst case for this audience.
 */
export const GET: APIRoute = async () => {
  const records: SearchRecord[] = [];

  for (const category of categories) {
    records.push({
      t: category.title,
      te: category.titleEn,
      u: categoryUrl(category.id),
      s: category.summary,
      c: 'खंड',
      kind: 'khand',
      ...buildKeys([category.title, category.titleEn, category.id]),
      raw: `${category.title} ${category.titleEn} ${category.summary}`.toLowerCase(),
    });
  }

  for (const topic of await getAllTopics()) {
    const { title, titleEn, summary, definition, keywords, category } = topic.data;
    records.push({
      t: title,
      te: titleEn,
      u: topicUrl(topic),
      s: summary,
      c: categoryTitle(category),
      kind: 'topic',
      ...buildKeys([title, titleEn, topic.id, ...keywords]),
      raw: `${title} ${titleEn} ${summary} ${definition} ${keywords.join(' ')}`.toLowerCase(),
    });
  }

  for (const term of await getCollection('terms')) {
    const { term: name, termEn, meaning, seeAlso, category } = term.data;
    records.push({
      t: name,
      te: termEn,
      u: seeAlso ? `/${category}/${seeAlso}/` : `/shabdkosh/#${term.id}`,
      s: meaning,
      c: categoryTitle(category),
      kind: 'term',
      ...buildKeys([name, termEn]),
      raw: `${name} ${termEn} ${meaning}`.toLowerCase(),
    });
  }

  return new Response(JSON.stringify(records), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
