import { getCollection, type CollectionEntry } from 'astro:content';
import { categories, categoryById, type CategoryId } from './taxonomy';

export type Topic = CollectionEntry<'topics'>;
export type Term = CollectionEntry<'terms'>;

/**
 * A खंड has no page of its own — the home page lists all seven with their
 * topics, so a खंड "link" is an anchor into that list rather than a route.
 */
export const categoryUrl = (id: CategoryId | string) => `/#${id}`;

/**
 * Topic URLs sit at the site root: /varn-vichar/sandhi/, not
 * /vyakaran/varn-vichar/sandhi/. The domain is already hindivyakaran.net,
 * so a /vyakaran/ segment only repeated what the host name says.
 */
export const topicUrl = (topic: Topic) => `/${topic.data.category}/${topic.id}/`;

/** All topics, ordered by khand first and then by the author's `order`. */
export async function getAllTopics(): Promise<Topic[]> {
  const topics = await getCollection('topics');
  const rank = new Map(categories.map((c, i) => [c.id, i]));
  return topics.sort((a, b) => {
    const byKhand = (rank.get(a.data.category) ?? 99) - (rank.get(b.data.category) ?? 99);
    return byKhand !== 0 ? byKhand : a.data.order - b.data.order;
  });
}

/**
 * Previous/next across the whole work, not just within a khand — so a
 * reader who keeps clicking "आगे" walks the entire grammar in the order
 * it is meant to be learned, rather than dead-ending at a khand boundary.
 */
export async function getNeighbours(topic: Topic) {
  const all = await getAllTopics();
  const i = all.findIndex((t) => t.id === topic.id);
  return {
    prev: i > 0 ? all[i - 1] : undefined,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : undefined,
  };
}

export async function getRelated(topic: Topic): Promise<Topic[]> {
  const all = await getAllTopics();
  const bySlug = new Map(all.map((t) => [t.id, t]));
  return topic.data.related
    .map((slug) => bySlug.get(slug))
    .filter((t): t is Topic => Boolean(t));
}

export const categoryTitle = (id: string) => categoryById.get(id as CategoryId)?.title ?? id;

/** Terms belonging to a khand, for the glossary's grouped view. */
export async function getTermsByCategory(): Promise<Map<CategoryId, Term[]>> {
  const terms = await getCollection('terms');
  const grouped = new Map<CategoryId, Term[]>();
  for (const category of categories) grouped.set(category.id, []);
  for (const term of terms) {
    grouped.get(term.data.category)?.push(term);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.data.term.localeCompare(b.data.term, 'hi'));
  }
  return grouped;
}
