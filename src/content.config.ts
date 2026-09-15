import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const categoryIds = [
  'bhasha-vyakaran',
  'varn-vichar',
  'shabd-vichar',
  'vakya-vichar',
  'shabd-bhandar',
  'kavya-alankar',
  'rachna',
] as const;

/**
 * A grammar topic — the atom of the site.
 *
 * `summary` and `definition` are separate on purpose. `summary` is the
 * one-line gloss used in cards, search results and meta descriptions;
 * `definition` is the formal परिभाषा rendered at the top of the page.
 * Conflating them is what makes reference sites read like blogs.
 */
const topics = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    category: z.enum(categoryIds),
    /** Position within the khand. Lower sorts first. */
    order: z.number(),
    summary: z.string(),
    definition: z.string(),
    level: z.enum(['aadhar', 'madhyam', 'unnat']),
    /**
     * Search terms a reader might actually type — including Devanagari
     * synonyms, sub-type names, and common romanised spellings.
     */
    keywords: z.array(z.string()).default([]),
    /** Slugs of topics worth reading next. Renders as सम्बंधित विषय. */
    related: z.array(z.string()).default([]),
    updated: z.coerce.date(),
  }),
});

/**
 * शब्दकोश — a flat glossary of grammar terms.
 *
 * Kept separate from topics so a reader who only wants to know what
 * "अनुस्वार" means gets a one-line answer instead of a 2,000-word page.
 * The competitor has no equivalent; every lookup there costs a full
 * page load and a scan.
 */
const terms = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/terms' }),
  schema: z.object({
    term: z.string(),
    termEn: z.string(),
    meaning: z.string(),
    example: z.string().optional(),
    /** Topic slug this term is explained in full on, if any. */
    seeAlso: z.string().optional(),
    category: z.enum(categoryIds),
  }),
});

export const collections = { topics, terms };
