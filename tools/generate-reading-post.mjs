import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceSlug = process.argv[2];
const slugMatch = sourceSlug?.match(/^(\d{4})-(06|12)-cet6-reading-([1-3])$/);

if (!slugMatch) {
  throw new Error('Usage: node tools/generate-reading-post.mjs YYYY-MM-cet6-reading-N');
}

const [, year, month, setNumber] = slugMatch;
const inputFiles = [
  path.join(root, 'src', 'data', 'reading', `${sourceSlug}.json`),
  path.join(root, 'src', 'data', 'learning', `${sourceSlug}.json`),
];
const outputSlug = sourceSlug.replace('-reading-', '-');
const outputFile = path.join(root, 'src', 'content', 'reading', `${outputSlug}.mdx`);

let inputFile;
let data;
for (const candidate of inputFiles) {
  try {
    data = JSON.parse(await readFile(candidate, 'utf8'));
    inputFile = candidate;
    break;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
if (!data || !inputFile) {
  throw new Error(`No reading data found for ${sourceSlug}`);
}

const sectionTitles = {
  '2025-12-cet6-reading-2': {
    cloze: 'AI, creativity, and the future of human work',
    passageOne: 'Passage One · Solidarity and interdependence',
    passageTwo: 'Passage Two · Setting boundaries around unwanted advice',
  },
};

function mdxText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;')
    .replaceAll('$', '\\$');
}

function sentenceNote(number, sentence) {
  return `<SentenceNote number="${number}">\n  ${mdxText(sentence)}\n</SentenceNote>`;
}

function matchingNotes(items) {
  const paragraphCounts = new Map();
  let currentSection = '';
  const blocks = [];

  for (const item of items) {
    const paragraph = String(item.source_section).replace(/^Paragraph\s+/i, '');
    if (paragraph !== currentSection) {
      blocks.push(`### Paragraph ${paragraph}`);
      currentSection = paragraph;
    }
    const count = (paragraphCounts.get(paragraph) || 0) + 1;
    paragraphCounts.set(paragraph, count);
    blocks.push(sentenceNote(`M-${paragraph}${String(count).padStart(2, '0')}`, item.original_sentence));
  }

  return blocks.join('\n\n');
}

function sentenceItems(sentences, sourceSection, prefix) {
  return sentences.map((originalSentence, index) => ({
    sentence_id: `${prefix}${String(index + 1).padStart(2, '0')}`,
    source_section: sourceSection,
    original_sentence: originalSentence,
  }));
}

function normalizeCompactSections(sections) {
  const matchingItems = sections.matching.paragraphs.flatMap(({ label, sentences }) =>
    sentenceItems(sentences, `Paragraph ${label}`, `M-${label}`),
  );

  return [
    { items: sentenceItems(sections.cloze.sentences, 'Cloze', 'C') },
    { title: sections.matching.title, items: matchingItems },
    { items: sentenceItems(sections.passageOne.sentences, 'Passage One', 'R1-') },
    { items: sentenceItems(sections.passageTwo.sentences, 'Passage Two', 'R2-') },
  ];
}

const compactSections = !Array.isArray(data.sections) && data.sections;
const normalizedSections = compactSections ? normalizeCompactSections(compactSections) : data.sections;
const [cloze, matching, passageOne, passageTwo] = normalizedSections || [];
if (![cloze, matching, passageOne, passageTwo].every((section) => Array.isArray(section?.items))) {
  throw new Error(`${inputFile} does not have the expected four reading sections`);
}

const ids = normalizedSections.flatMap((section) => section.items.map((item) => item.sentence_id));
if (new Set(ids).size !== ids.length) throw new Error(`${inputFile} contains duplicate sentence IDs`);

const titles = compactSections
  ? {
      cloze: compactSections.cloze.title,
      passageOne: compactSections.passageOne.title,
      passageTwo: compactSections.passageTwo.title,
    }
  : sectionTitles[sourceSlug];
if (!titles) throw new Error(`Add section titles for ${sourceSlug} before generating the public reading post`);

const body = [
  '---',
  `title: '${year}-${month} CET6 Reading · Set ${setNumber}'`,
  "description: 'The cloze, paragraph-matching text, and two reading passages, arranged sentence by sentence.'",
  `pubDate: '${year}-${month}-01'`,
  '---',
  '',
  "import SentenceNote from '../../components/reading/SentenceNote.astro';",
  '',
  '## Word Bank Cloze',
  '',
  `### ${titles.cloze}`,
  '',
  cloze.items.map((item, index) => sentenceNote(`C${String(index + 1).padStart(2, '0')}`, item.original_sentence)).join('\n\n'),
  '',
  '## Paragraph Matching',
  '',
  `### ${matching.title.split('·').slice(1).join('·').trim()}`,
  '',
  matchingNotes(matching.items),
  '',
  '## Reading Passages',
  '',
  `### ${titles.passageOne}`,
  '',
  passageOne.items.map((item, index) => sentenceNote(`R1-${String(index + 1).padStart(2, '0')}`, item.original_sentence)).join('\n\n'),
  '',
  `### ${titles.passageTwo}`,
  '',
  passageTwo.items.map((item, index) => sentenceNote(`R2-${String(index + 1).padStart(2, '0')}`, item.original_sentence)).join('\n\n'),
  '',
].join('\n');

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, body);
console.log(`Generated ${path.relative(root, outputFile)} with ${ids.length} sentences`);
