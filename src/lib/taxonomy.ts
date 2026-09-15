/**
 * The site's spine.
 *
 * The competitor presents ~70 topics as one flat alphabetical-ish list,
 * which is why nothing on it is findable. Here the same ground is
 * organised the way a printed व्याकरण actually is: sound → word → sentence
 * → vocabulary → poetics → composition. Every topic belongs to exactly
 * one खंड, and that khand is what breadcrumbs, sidebars and URLs follow.
 */

export type CategoryId =
  | 'bhasha-vyakaran'
  | 'varn-vichar'
  | 'shabd-vichar'
  | 'vakya-vichar'
  | 'shabd-bhandar'
  | 'kavya-alankar'
  | 'rachna';

export interface Category {
  id: CategoryId;
  title: string;
  titleEn: string;
  /** One line, in plain Hindi, explaining what this khand covers. */
  summary: string;
  /** Roman numeral shown as the section marker — no icons, no emoji. */
  marker: string;
}

export const categories: Category[] = [
  {
    id: 'bhasha-vyakaran',
    title: 'भाषा और व्याकरण',
    titleEn: 'Language & Grammar',
    summary: 'भाषा क्या है, व्याकरण क्यों आवश्यक है, और हिंदी भाषा का स्वरूप।',
    marker: 'I',
  },
  {
    id: 'varn-vichar',
    title: 'वर्ण विचार',
    titleEn: 'Phonology',
    summary: 'ध्वनि और वर्ण का अध्ययन — वर्णमाला, स्वर, व्यंजन, संधि और उच्चारण।',
    marker: 'II',
  },
  {
    id: 'shabd-vichar',
    title: 'शब्द विचार',
    titleEn: 'Morphology',
    summary: 'शब्दों के भेद और रूप — संज्ञा, सर्वनाम, क्रिया, विशेषण, कारक, काल, समास।',
    marker: 'III',
  },
  {
    id: 'vakya-vichar',
    title: 'वाक्य विचार',
    titleEn: 'Syntax',
    summary: 'वाक्य की रचना, भेद, पदबंध, उपवाक्य, वाक्य-शुद्धि और विराम चिह्न।',
    marker: 'IV',
  },
  {
    id: 'shabd-bhandar',
    title: 'शब्द भंडार',
    titleEn: 'Vocabulary',
    summary: 'पर्यायवाची, विलोम, अनेकार्थी शब्द, मुहावरे और लोकोक्तियाँ।',
    marker: 'V',
  },
  {
    id: 'kavya-alankar',
    title: 'काव्य और अलंकार',
    titleEn: 'Poetics',
    summary: 'काव्य का सौंदर्य — रस, छंद, अलंकार और शब्द शक्ति।',
    marker: 'VI',
  },
  {
    id: 'rachna',
    title: 'रचना',
    titleEn: 'Composition',
    summary: 'लिखने की कला — निबंध, पत्र, संवाद, अनुच्छेद और संक्षेपण।',
    marker: 'VII',
  },
];

export const categoryById = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: string): Category | undefined {
  return categoryById.get(id as CategoryId);
}

/**
 * Topics that are planned but not yet written. They are listed in the
 * khand pages so the shape of the whole work is visible from day one,
 * but they produce no route and no search entry — an empty page that
 * ranks is worse than no page at all.
 *
 * Currently empty: every topic the seven khand plan for is written. The
 * mechanism stays because the next expansion will use it again.
 */
export interface PlannedTopic {
  title: string;
  category: CategoryId;
}

export const plannedTopics: PlannedTopic[] = [];

/**
 * Depth of treatment, not audience. These describe how far a page goes
 * into its subject — they are not grade levels and not exam tiers.
 */
export const levels = {
  aadhar: { label: 'आधार', hint: 'आरंभिक अवधारणा' },
  madhyam: { label: 'मध्यम', hint: 'विस्तृत विवेचन' },
  unnat: { label: 'उन्नत', hint: 'गहन अध्ययन' },
} as const;

export type Level = keyof typeof levels;
