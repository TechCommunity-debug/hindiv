import { devanagariKey, romanKey, skeletonKey } from './translit';

/**
 * A single searchable thing — a topic page, a khand, or a glossary term.
 * Field names are short because this whole index ships to the browser.
 */
export interface SearchRecord {
  /** Display title, Devanagari. */
  t: string;
  /** English gloss, shown as a dim subtitle. */
  te: string;
  /** Destination URL. */
  u: string;
  /** One-line summary shown under the title. */
  s: string;
  /** Khand name, shown as a tag. */
  c: string;
  /** What this is, so results can be grouped. */
  kind: 'topic' | 'term' | 'khand';
  /** Precomputed match keys — see buildKeys. */
  dk: string[];
  rk: string[];
  sk: string[];
  /** Lowercased raw text, for plain substring hits in summaries. */
  raw: string;
}

/**
 * Builds the three key families for a set of surface forms (title,
 * English name, keywords). Done at build time so the browser only ever
 * does string comparisons.
 */
export function buildKeys(forms: string[]) {
  const dk = new Set<string>();
  const rk = new Set<string>();
  const sk = new Set<string>();
  for (const form of forms) {
    if (!form) continue;
    dk.add(devanagariKey(form));
    rk.add(romanKey(form));
    sk.add(skeletonKey(form));
  }
  return {
    dk: [...dk].filter(Boolean),
    rk: [...rk].filter(Boolean),
    sk: [...sk].filter(Boolean),
  };
}

export interface Scored {
  record: SearchRecord;
  score: number;
}

/**
 * Scores one record against one query.
 *
 * The tiers matter: an exact Devanagari or romanised hit must always
 * outrank a consonant-skeleton hit, because the skeleton deliberately
 * over-matches (कल, काल and कील all reduce to "kl"). Without the tiering
 * a reader searching "काल" would get "कील" above it.
 */
function score(record: SearchRecord, qd: string, qr: string, qs: string, qRaw: string): number {
  let best = 0;

  const tier = (keys: string[], exact: number, prefix: number, partial: number, q: string) => {
    if (!q) return;
    for (const key of keys) {
      if (key === q) best = Math.max(best, exact);
      else if (key.startsWith(q)) best = Math.max(best, prefix);
      else if (key.includes(q)) best = Math.max(best, partial);
    }
  };

  tier(record.dk, 100, 82, 62, qd);
  tier(record.rk, 96, 74, 54, qr);
  // Skeleton only earns a hit once the query is long enough to be
  // discriminating; two consonants would match half the site.
  if (qs.length >= 3) tier(record.sk, 44, 34, 0, qs);

  // Plain substring in the summary or definition — weakest signal, but
  // it is what catches a reader searching for a phrase like "भाववाचक".
  if (best === 0 && qRaw.length >= 2 && record.raw.includes(qRaw)) best = 18;

  // Nudge full topic pages above single glossary lines on equal footing:
  // someone typing "संज्ञा" wants the chapter, not the one-line gloss.
  if (best > 0) {
    if (record.kind === 'topic') best += 4;
    else if (record.kind === 'khand') best += 2;
  }

  return best;
}

export function search(records: SearchRecord[], query: string, limit = 12): Scored[] {
  const trimmed = query.trim();
  if (trimmed.length < 1) return [];

  const qd = devanagariKey(trimmed);
  const qr = romanKey(trimmed);
  const qs = skeletonKey(trimmed);
  const qRaw = trimmed.toLowerCase();

  const out: Scored[] = [];
  for (const record of records) {
    const s = score(record, qd, qr, qs, qRaw);
    if (s > 0) out.push({ record, score: s });
  }

  out.sort((a, b) => b.score - a.score || a.record.t.localeCompare(b.record.t, 'hi'));
  return out.slice(0, limit);
}
