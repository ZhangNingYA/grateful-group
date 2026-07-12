const fs = require('node:fs');
const path = require('node:path');

const [sourceDir, outputFile, slug, title, date] = process.argv.slice(2);

if (!sourceDir || !outputFile || !slug || !title || !date) {
  console.error('Usage: node scripts/generate-blog-reading.cjs <sourceDir> <outputFile> <slug> <title> <YYYY-MM-DD>');
  process.exit(1);
}

function difficultyLevel(reason = '') {
  if (/极难|很难|高难/.test(reason)) return 5;
  if (/较难|偏难/.test(reason)) return 4;
  if (/略难|中等|适中/.test(reason)) return 3;
  if (/较易|偏易|简单|基础/.test(reason)) return 2;
  return 1;
}

const sourceFiles = fs
  .readdirSync(sourceDir)
  .filter((name) => /^\d{3}\.json$/.test(name))
  .sort();

if (sourceFiles.length === 0) {
  throw new Error(`No numbered JSON files found in ${sourceDir}`);
}

let sentenceCount = 0;
const sections = sourceFiles.map((fileName) => {
  const navLabel = path.basename(fileName, '.json');
  const sourceItems = JSON.parse(fs.readFileSync(path.join(sourceDir, fileName), 'utf8'));
  sentenceCount += sourceItems.length;

  return {
    kicker: `Part ${navLabel}`,
    title: navLabel,
    navLabel,
    description: `阅读材料第 ${navLabel} 部分，共 ${sourceItems.length} 句。`,
    items: sourceItems.map((item, index) => {
      const sequence = item['序号'] ?? index + 1;
      const structure = item['句子结构'] ?? {};
      const difficultyReason = item['难度分析'] ?? '';
      const difficulty = difficultyLevel(difficultyReason);

      return {
        label: `${navLabel}-${String(sequence).padStart(2, '0')}`,
        part: `Part ${navLabel}`,
        en: item['原句'] ?? '',
        zh: item['翻译'] ?? '',
        analysis: [
          { label: '主干', text: structure['主干'] ?? '' },
          { label: '修饰成分', text: structure['修饰成分'] ?? '' },
          { label: '语法要点', text: structure['语法要点'] ?? '' },
        ],
        structure: structure['主干'] ?? '',
        phrases: (item['重点词汇词组'] ?? []).map((phrase) => ({
          term: phrase['表达'] ?? '',
          zh: phrase['释义'] ?? '',
          note: phrase['用法说明'] ?? '',
        })),
        difficulty,
        difficultyAnalysis: {
          difficulty_level: difficulty,
          difficulty_stars: `${'★'.repeat(difficulty)}${'☆'.repeat(5 - difficulty)}`,
          reason_cn: difficultyReason,
        },
      };
    }),
  };
});

const output = {
  storageKey: `reading-${slug}`,
  intro: {
    kicker: `Reading · ${date} · ${title.replace(/：句句精读$/, '')}`,
    title,
    description: `按原文 ${sourceFiles[0].replace('.json', '')}-${sourceFiles.at(-1).replace('.json', '')} 的顺序整理 ${sentenceCount} 个句子，包含英文原句、中文翻译、句子结构、重点词汇词组和难度标记。`,
  },
  sections,
};

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

console.log(`Generated ${outputFile} with ${sections.length} sections and ${sentenceCount} sentences.`);
