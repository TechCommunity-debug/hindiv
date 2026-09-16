/**
 * Site-level facts that live outside the content collections: who runs the
 * site and the standing pages that say so. Kept here because the footer, the
 * home page and the pages themselves all have to agree — a contact address
 * that differs between the संपर्क page and the footer is the kind of thing
 * nobody notices until someone writes to the wrong one.
 */

export const SITE_NAME = 'Hindi vyakaran';
export const SITE_URL = 'https://hindivyakaran.net';

/** The one address readers are asked to write to, everywhere on the site. */
export const CONTACT_EMAIL = 'techcommunity611@gmail.com';

/**
 * The default share card. Built by scripts/generate-og.mjs and committed,
 * rather than rendered per request: it changes about as often as the site
 * name does, and a crawler fetching it must never wait on a function.
 *
 * 1200×630 is the size Facebook, LinkedIn and X all crop from without
 * letterboxing, and the one the og:image:width/height below must match.
 */
export const OG_IMAGE = '/og-image.png';

export const OG_IMAGE_ALT =
  'Hindi Vyakaran — हिंदी व्याकरण का सम्पूर्ण ऑनलाइन संदर्भ और मुफ़्त PDF';

/**
 * Site-wide keyword line. Pages with their own intent (the PDF landing
 * page, a topic) pass their own to <Seo>; this is the fallback and is
 * deliberately short — a hundred-term list is the signature of a page with
 * nothing specific to say.
 */
export const SITE_KEYWORDS =
  'hindi vyakaran, hindi grammar, हिंदी व्याकरण, hindi vyakaran pdf, hindi grammar pdf, hindi vyakaran book pdf, hindi vyakaran pdf download, hindi grammar pdf download';

/**
 * Date these standing pages were last revised. They are written together and
 * revised together, so one date covers them — a per-page date would drift
 * into a lie the moment a shared paragraph changed.
 */
export const POLICY_UPDATED = '2026-09-16';

export const POLICY_UPDATED_HI = '16 सितम्बर 2026';

export interface SitePage {
  href: string;
  /** Devanagari label — what the link reads as in the UI. */
  label: string;
  /** Latin gloss, used where the two scripts sit side by side. */
  labelEn: string;
  /**
   * Short Latin label for the header nav. "Terms & conditions" beside five
   * other items overflows the sticky header row well before the desktop
   * breakpoint, and a one-word nav label is the convention anyway.
   */
  navEn: string;
  /** One line of what the page actually contains. */
  summary: string;
}

/**
 * The four standing pages, in the order a reader would meet them: what this
 * is, how to reach us, what we do with your data, and on what terms.
 */
export const sitePages: SitePage[] = [
  {
    href: '/about/',
    label: 'हमारे बारे में',
    labelEn: 'About us',
    navEn: 'About',
    summary: 'यह संदर्भ कौन बनाता है, किस उद्देश्य से, और सामग्री कैसे तैयार होती है।',
  },
  {
    href: '/contact/',
    label: 'संपर्क',
    labelEn: 'Contact us',
    navEn: 'Contact',
    summary: 'त्रुटि की सूचना, सुझाव या प्रश्न — ईमेल द्वारा हम तक पहुँचें।',
  },
  {
    href: '/privacy/',
    label: 'गोपनीयता नीति',
    labelEn: 'Privacy policy',
    navEn: 'Privacy',
    summary: 'यह साइट कौन-सी जानकारी एकत्र करती है और कौन-सी नहीं।',
  },
  {
    href: '/terms/',
    label: 'नियम व शर्तें',
    labelEn: 'Terms & conditions',
    navEn: 'Terms',
    summary: 'सामग्री के उपयोग की शर्तें, अधिकार और सीमाएँ।',
  },
];
