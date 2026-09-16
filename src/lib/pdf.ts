import type { Topic } from './content';

/**
 * PDF plumbing — the single place that knows where a topic's printable
 * page lives and where its rendered PDF lands.
 *
 * Three consumers have to agree on these strings: the landing page and
 * the topic pages (which link to the PDFs), the print routes (which are
 * what gets rendered), and scripts/generate-pdfs.mjs (which does the
 * rendering). They agree by all going through here — the build script
 * reads the paths out of the manifest endpoint rather than rebuilding
 * them, so a rename here can never leave a dead download link behind.
 */

/**
 * The keyword landing page.
 *
 * The host name already carries the keyword, so this reads end to end
 * as hindivyakaran.net/pdf — the query "hindi vyakaran pdf" matched by
 * the domain and one short segment, with nothing repeated. The <title>
 * and H1 still carry the phrase verbatim, which is where an exact match
 * does the most work anyway.
 *
 * It shares the /pdf/ directory with the rendered files below, and that
 * is fine: the page builds to dist/pdf/index.html and sits alongside
 * hindi-vyakaran.pdf and the per-khand subdirectories. A directory can
 * hold both an index and its files.
 */
export const PDF_LANDING_URL = '/pdf/';

/** Bare, print-only render of a topic — what Chrome is pointed at. */
export const printUrl = (topic: Topic) => `/print/${topic.data.category}/${topic.id}/`;

/** Print-only render of the whole grammar, all khand in reading order. */
export const COMPLETE_PRINT_URL = '/print/sampurna/';

/**
 * Per-topic PDFs mirror the topic URL under /pdf/, so a reader who can
 * see /varn-vichar/sandhi/ can guess the download without hunting.
 */
export const pdfUrl = (topic: Topic) => `/pdf/${topic.data.category}/${topic.id}.pdf`;

/**
 * The complete book. Named for the search term rather than the site,
 * because this filename survives being saved, mailed and re-uploaded —
 * it is the one piece of metadata that travels with the file.
 */
export const COMPLETE_PDF_URL = '/pdf/hindi-vyakaran.pdf';

/** Filename offered by the download attribute, not the stored path. */
export const pdfFilename = (topic: Topic) => `${topic.id}-hindi-vyakaran.pdf`;

export const COMPLETE_PDF_FILENAME = 'hindi-vyakaran-sampurna.pdf';
