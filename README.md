# हिंदी व्याकरण — hindivyakaran.net

A Hindi grammar reference site. Hindi (Devanagari) is the site language;
English appears only in URLs, code, metadata and the occasional
parenthetical gloss.

Built with Astro 7 (static), Tailwind CSS v4, MDX content collections.

## Running it

Node **≥ 22.12** is required. If you use nvm:

```bash
nvm use 22
npm install
npm run dev      # or: npx astro dev --background
```

Background server controls: `astro dev stop`, `astro dev status`, `astro dev logs`.

```bash
npm run build    # static output to dist/, including the PDFs
npm run check    # astro check — types and template diagnostics
```

`build` runs `astro build` and then `scripts/generate-pdfs.mjs`, which
needs a Chrome or Chromium on the machine (see **PDFs** below). Use
`npm run build:no-pdf` on a box without one — the site builds, but every
download link 404s.

## How content is organised

Everything hangs off `src/lib/taxonomy.ts`, which defines **seven खंड**
(sections) in the order a grammar is actually learned: sound → word →
sentence → vocabulary → poetics → composition. Each topic belongs to
exactly one khand, and that drives its URL, breadcrumbs and sidebar
position.

```
src/content/topics/<slug>.mdx   grammar topics (45 written)
src/content/terms/<slug>.json   glossary entries (68)
src/lib/taxonomy.ts             khand definitions + planned-topic list
```

URLs are `/vyakaran/<khand>/<slug>/`, e.g. `/vyakaran/shabd-vichar/karak/`.

Topics that are planned but unwritten live in `plannedTopics` in
`taxonomy.ts`. They appear as greyed "शीघ्र आ रहे हैं" chips so the shape
of the whole work is visible, but they produce **no route and no search
entry** — a thin page that ranks is worse than no page. The list is
currently empty; every topic the seven khand plan for is written.

## Adding a topic

Create `src/content/topics/<slug>.mdx`. The schema is enforced by Zod in
`src/content.config.ts`, so a missing field fails the build rather than
shipping silently.

```mdx
---
title: कारक                      # Devanagari, used everywhere
titleEn: Case                    # dim Latin subtitle + a search key
category: shabd-vichar           # must be one of the seven khand ids
order: 6                         # position within the khand
summary: …                       # ONE line — cards, search, meta description
definition: …                    # the formal परिभाषा, rendered in a box at top
level: madhyam                   # aadhar | madhyam | unnat — depth, not audience
keywords: [कारक, विभक्ति, karak]  # extra search terms, both scripts
related: [sangya, kriya]         # slugs — renders as सम्बंधित विषय
updated: 2026-09-15
---
```

`summary` and `definition` are deliberately separate. `summary` is the
one-line gloss shown in cards and search results; `definition` is the
formal statement at the top of the page. Collapsing them is what makes
reference sites read like blogs.

### Components available in MDX

No imports needed — they are injected by the topic route.

| Component | Use |
| --- | --- |
| `<Paribhasha>` | Definition box. The page renders one automatically from frontmatter; only add another for a nested definition. |
| `<Udaharan items={[…]} />` | Example chips for word lists. |
| `<Udaharan label="वाक्य में">` | Example block for full sentences (slot form). |
| `<Dhyan>` | "ध्यान दें" — exceptions and confusable pairs. |
| `<Abhyas>` / `<Prashn q="" a="" />` | Practice questions with reveal-on-demand answers. |

**Write भेद as Markdown `###` headings, not as components.** Only real
Markdown headings reach `render()`'s `headings` array, which feeds the
table of contents and the anchor links search engines surface as jump
links. A भेद inside a component is invisible to both.

## Design

`DESIGN.md` documents Vercel's Geist system. Three departures were
necessary for a Devanagari reading surface; all three are commented at
the top of `src/styles/global.css`.

1. **Type.** Geist has no Devanagari glyphs. The Noto Devanagari
   superfamily replaces it — serif for headings, sans for reading and UI,
   self-hosted via Astro's Fonts API.
2. **Size.** Body is 17px at 1.9 line-height, not Geist's 14px.
   Devanagari carries matras above and below the shirorekha and collides
   vertically at tighter settings.
3. **Tracking.** Geist's negative letter-spacing is applied to **Latin
   only** (`.latin`). Negative tracking on Devanagari breaks the
   shirorekha join and mangles conjuncts.

Kept: hairline cards before any shadow, the grey text ladder, the 4px
spacing base, flat depth, the bimodal radius scale.

### Colour is navigation, not decoration

DESIGN.md keeps everything monochrome and spends its colour on a hero
mesh gradient. That suits a marketing page; it fails a reference work
where a reader needs to know which part of the grammar they are standing
in. So the accent family DESIGN.md names — link blue, cyan, violet,
magenta, warning amber — is kept but **reassigned from decoration to
wayfinding**: each खंड owns one colour.

| खंड | Colour | DESIGN.md source |
| --- | --- | --- |
| भाषा और व्याकरण | `#1d4ed8` blue | link |
| वर्ण विचार | `#0f766e` teal | cyan |
| शब्द विचार | `#6d28d9` violet | violet |
| वाक्य विचार | `#a21caf` plum | magenta |
| शब्द भंडार | `#8f5a06` ochre | warning |
| काव्य और अलंकार | `#be123c` rose | pink |
| रचना | `#166534` green | — |

All seven clear WCAG AA (≥4.5:1) on surface, canvas and their own soft
tint, in both themes.

**How to use it.** Put `data-khand="<id>"` on any element; that publishes
`--khand` and `--khand-soft` to its whole subtree. Descendants then use
Tailwind's CSS-variable syntax — `text-(--khand)`, `border-(--khand)`,
`bg-(--khand-soft)`. Do **not** build class names like
`` `text-khand-${id}` `` — Tailwind reads source files as plain text and
never sees a concatenated class. Nested `data-khand` overrides its
parent, which is how a related-topic card shows its own section's colour
rather than the page's.

`data-level="<level>"` works the same way for `--level` / `--level-soft`.

The one decorative element is the **spectrum rule** — a 3px seven-segment
band at the top of every page, one stop per खंड in reading order. It
stands in for DESIGN.md's mesh gradient and deliberately uses hard stops
rather than a blur: a gradient reads as tech-startup, seven discrete
bands read as seven volumes.

Ochre stays reserved for उदाहरण markers, echoing the red ink that marked
headings in manuscript Devanagari. Because it has one job, readers learn
to skim for it — don't spend it elsewhere. The home page's "हर विषय में
क्या मिलेगा" block doubles as a legend for these role colours.

Dark mode flips tokens, not roles. Raw values live on `:root` and
`[data-theme='dark']` side by side at the top of `global.css`, exposed to
Tailwind via `@theme inline` — the documented v4 pattern for colours that
reference other variables. `data-theme` is set before first paint by an
inline script in `BaseLayout.astro`.

## Search

The competitor (hindigrammar.in) has no search at all. Here it is the
primary navigation.

`/search-index.json` is generated at build time from both collections. It
carries **three precomputed key families** per entry, so the browser only
does string comparisons:

- **Devanagari key** — nuktas, anusvaras and chandrabindus stripped, so a
  reader who omits the bindu still matches.
- **Roman key** — `src/lib/translit.ts` transliterates Devanagari to how
  people actually spell Hindi in Latin letters (`sangya`, not `saṃjñā`),
  including final-schwa deletion. A large share of users type romanised
  Hindi because switching IME mid-search is friction they won't accept.
- **Consonant skeleton** — vowels removed, to absorb *medial* schwa
  deletion (`upsarg` vs `upasarg`). High recall, low precision, so it is
  ranked strictly below the other two in `src/lib/search.ts`.

The index is one file for the whole site: **120 entries, 115 KB raw /
20 KB gzipped**. That is still comfortably within budget for a single
fetch. Past roughly 300 KB raw it should be split per-khand or moved to
a prefix trie — not before.

Opens with Ctrl/Cmd-K, `/`, or any element carrying `data-search-open`.
The dialog is rendered once from the layout, never inside a responsive
wrapper — a `<dialog>` in a `display:none` parent cannot be shown.

## PDFs

"हिंदी व्याकरण PDF" is one of the highest-volume queries in this subject,
and the competitor answers it with a Drive link. Here it is part of the
build.

**`/pdf/`** is the page that chases the query. The title and H1 carry the
phrase verbatim, and the URL carries it by way of the host name —
`hindivyakaran.net/pdf` says "hindi vyakaran pdf" without repeating a
word of it. The page lists every topic grouped by khand with a download
beside each, over one prominent complete-book button.

It is linked from four places: the home page hero, a second copy of the
complete-book block above the home page footer, the site footer, and a
row on every topic page. The per-topic rows also chase the long tail
(`संधि PDF`) and link back, which makes `/pdf/` the best-linked document
on the site rather than an orphan.

Note that the page and the rendered files **share the `/pdf/`
directory** — the page builds to `dist/pdf/index.html` and sits beside
`hindi-vyakaran.pdf` and the per-khand subdirectories. That is fine; a
directory holds both an index and its files. Don't "fix" it by moving
the assets.

Each topic page carries **two** download affordances by design: a
compact tinted chip beside the h1 for the reader who never scrolls, and
the solid-fill block after the content for the reader who read to the
end. `CompletePdfCta.astro` and `DownloadIcon.astro` keep the shared
markup in one place.

Everything is generated **at build time** and served as a static file —
no function in the request path of a link that exists for readers on slow
connections:

```
src/pages/print/**        bare, noindex render of each topic + the whole book
      ↓  astro build
dist/pdf-manifest.json    what to render and where to put it
      ↓  scripts/generate-pdfs.mjs   (serves dist/, drives Chrome)
dist/pdf/**.pdf           46 files, ~21 MB, ~40s
```

The renderer uses **`playwright-core` against the system Chrome**, not
`playwright` — it keeps the dependency at 14 MB and skips a ~150 MB
browser download per CI run. Point `PDF_CHROME` at the binary if it is
somewhere unusual.

Three things are easy to break here:

- **`await document.fonts.ready` before `page.pdf()`.** Printing early
  does not produce an ugly PDF, it produces 250 pages of tofu — and the
  build still exits 0. Devanagari is shaped by the font, not the renderer.
- **Never serve the pages as `file://`.** Astro emits root-absolute asset
  paths; under `file://` they resolve to the filesystem root and the PDFs
  come out unstyled, in a fallback face.
- **Heading line-heights are opened up in `PrintLayout`** (1.75/1.85).
  Devanagari ink overflows the line boxes the heading scale gives it,
  which is invisible on screen but strands a 2px crescent of a शिरोरेखा
  at the foot of the *previous* page once Chrome starts fragmenting.
  Same file undoes `display: block` on tables — that rule exists so
  tables scroll sideways on phones, and paper does not scroll.

## Gotchas

- **`source('../')` in `global.css` is load-bearing.** Without it,
  Tailwind's auto-detection walks the whole repo including the 199-file
  Tailwind docs snapshot under `.agents/skills/`, and the stylesheet goes
  from ~26 KB to ~356 KB.
- **Astro 7 uses Sätteri**, a Rust Markdown pipeline that does not accept
  rehype plugins. Table overflow is handled in CSS (`prose-hi`) instead.
- **The Tailwind docs snapshot is gitignored.** Upstream is
  source-available but not open-source. Regenerate with
  `python3 .agents/skills/tailwind-4-docs/scripts/sync_tailwind_docs.py --accept-docs-license`.

## Not exam prep

This is a grammar reference and learning site. `level` describes how deep
a page goes, not which class or exam it targets. Keep exam and syllabus
framing out of content and UI copy.
