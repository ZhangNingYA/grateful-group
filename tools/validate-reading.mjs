import { build } from 'esbuild';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const dataDirectory = path.join(projectRoot, 'src/data');
const filePattern = /^cet4Reading\d{6}Set\d+\.ts$/;

const pad = (value) => String(value + 1).padStart(2, '0');
const normalizeQuotes = (value) => value
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"');
const normalizeSentence = (value) => normalizeQuotes(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const failures = [];
const fail = (paper, message) => failures.push(`${paper}: ${message}`);

const importTypeScript = async (entryPoint) => {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    write: false,
    logLevel: 'silent',
  });
  const source = result.outputFiles[0]?.text;
  if (!source) throw new Error(`No output generated for ${entryPoint}`);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};

const validateCloseReading = (paper, key, sentence, closeReading) => {
  if (!closeReading) {
    fail(paper, `${key} 缺少精读数据`);
    return;
  }
  if (!closeReading.translation?.trim()) fail(paper, `${key} 的翻译为空`);
  if (!closeReading.structure?.pattern?.trim()) fail(paper, `${key} 的句型为空`);
  if (!closeReading.structure?.explanation?.trim()) fail(paper, `${key} 的结构说明为空`);
  if (!Array.isArray(closeReading.vocabulary)) fail(paper, `${key} 的重点词汇不是数组`);
  if (!Array.isArray(closeReading.highlights) || closeReading.highlights.length === 0) {
    fail(paper, `${key} 没有句子结构高亮`);
    return;
  }

  const normalizedSentence = normalizeQuotes(sentence);
  for (const highlight of [...closeReading.highlights, ...(closeReading.trunk ?? [])]) {
    if (!highlight.text?.trim()) {
      fail(paper, `${key} 存在空的高亮文本`);
    } else if (!normalizedSentence.includes(normalizeQuotes(highlight.text))) {
      fail(paper, `${key} 的高亮不在原句中：${highlight.text}`);
    }
  }
};

const hasWholeWordRange = (sentence, part) => {
  const normalizedSentence = normalizeQuotes(sentence).toLowerCase();
  const normalizedPart = normalizeQuotes(part).toLowerCase();
  let from = 0;
  while (from <= normalizedSentence.length) {
    const start = normalizedSentence.indexOf(normalizedPart, from);
    if (start < 0) return false;
    const before = normalizedSentence[start - 1] ?? '';
    const after = normalizedSentence[start + normalizedPart.length] ?? '';
    const cutsStart = /[a-z]/.test(before) && /^[a-z]/.test(normalizedPart);
    const cutsEnd = /[a-z]$/.test(normalizedPart) && /[a-z]/.test(after);
    if (!cutsStart && !cutsEnd) return true;
    from = start + 1;
  }
  return false;
};

const validateSemanticAnalysis = (paper, key, sentence, closeReading) => {
  const analysis = closeReading?.analysis;
  if (!analysis) {
    fail(paper, `${key} 缺少主句语义分析`);
    return;
  }
  if (!analysis.pattern?.trim()) fail(paper, `${key} 的语义句型为空`);
  if (!analysis.explanation?.trim()) fail(paper, `${key} 的语义说明为空`);
  if (!Array.isArray(analysis.highlights) || analysis.highlights.length === 0) {
    fail(paper, `${key} 没有语义结构成分`);
    return;
  }

  const allowedRoles = new Set(['subject', 'predicate', 'object', 'complement', 'adverbial']);
  for (const item of [...analysis.highlights, ...(analysis.trunk ?? [])]) {
    if (!allowedRoles.has(item.role)) fail(paper, `${key} 有未知成分类型 ${item.role}`);
    if (!item.text?.trim()) fail(paper, `${key} 有空的语义结构成分`);
    else if (!hasWholeWordRange(sentence, item.text)) {
      fail(paper, `${key} 的语义成分截断单词或不在原句中：${item.text}`);
    }
    for (const [open, close] of [['(', ')'], ['“', '”']]) {
      const openCount = item.text.split(open).length - 1;
      const closeCount = item.text.split(close).length - 1;
      if (openCount !== closeCount) {
        fail(paper, `${key} 的语义成分括号或引号不完整：${item.text}`);
      }
    }
  }

  const isIntentionalFragment = /列表项|省略式回答/.test(analysis.pattern);
  const isImperative = /^(?:Consider|Imagine|Take|Let|Suppose)\b/.test(sentence);
  if (!isIntentionalFragment && !analysis.highlights.some((item) => item.role === 'predicate')) {
    fail(paper, `${key} 的完整句没有谓语`);
  }
  if (!isIntentionalFragment && !isImperative && !analysis.highlights.some((item) => item.role === 'subject')) {
    fail(paper, `${key} 的完整句没有主语`);
  }

  const clauseItems = analysis.highlights.filter((item) => item.label?.includes('从句'));
  for (const item of clauseItems) {
    if (item.text.split(/\s+/).length < 2) fail(paper, `${key} 的从句标签没有覆盖完整从句：${item.text}`);
  }

  if (/主干可先读作/.test(analysis.explanation)) {
    fail(paper, `${key} 仍在语义分析中重复“先抓主干”的旧说明`);
  }
  if (/\bca\s*\+\s*n[’']t\b/i.test(analysis.explanation)) {
    fail(paper, `${key} 把缩写谓语错误拆开`);
  }
};

const readingSentenceMap = (reading) => {
  const sections = reading.sections;
  const result = {};
  sections.cloze.sentences.forEach((sentence, index) => {
    result[`C${pad(index)}`] = sentence;
  });
  sections.matching.paragraphs.forEach((paragraph) => {
    paragraph.sentences.forEach((sentence, index) => {
      result[`M-${paragraph.label}${pad(index)}`] = sentence;
    });
  });
  ['passageOne', 'passageTwo'].forEach((name, passageIndex) => {
    sections[name].sentences.forEach((sentence, index) => {
      result[`R${passageIndex + 1}-${pad(index)}`] = sentence;
    });
  });
  return result;
};

const mdxSentenceMap = async (file) => {
  const source = await readFile(file, 'utf8');
  return Object.fromEntries(Array.from(
    source.matchAll(/<SentenceNote\s+number="([^"]+)"\s+sentence=\{("(?:\\.|[^"\\])*")\}/g),
    (match) => [match[1], JSON.parse(match[2])],
  ));
};

const files = (await readdir(dataDirectory)).filter((file) => filePattern.test(file)).sort();
if (files.length === 0) {
  console.error('未找到 CET-4 Reading 数据文件。');
  process.exit(1);
}

for (const file of files) {
  const module = await importTypeScript(path.join(dataDirectory, file));
  const readingExport = Object.keys(module).find((name) => /^cet4Reading\d{6}Set\d+$/.test(name));
  const closeReadingExport = Object.keys(module).find((name) => /^cet4CloseReadings\d{6}Set\d+$/.test(name));
  const paper = readingExport ?? file;
  const reading = readingExport ? module[readingExport] : undefined;
  const closeReadings = closeReadingExport ? module[closeReadingExport] : undefined;

  if (!reading || !closeReadings) {
    fail(paper, '缺少 Reading 或 CloseReadings 导出');
    continue;
  }

  const sentences = [];
  reading.cloze?.sentences?.forEach((sentence, index) => sentences.push([`C${pad(index)}`, sentence]));
  reading.matching?.paragraphs?.forEach((paragraph) => {
    paragraph.sentences.forEach((sentence, index) => {
      sentences.push([`M-${paragraph.label}${pad(index)}`, sentence]);
    });
  });
  reading.passages?.forEach((passage, passageIndex) => {
    passage.sentences.forEach((sentence, index) => {
      sentences.push([`R${passageIndex + 1}-${pad(index)}`, sentence]);
    });
  });

  const expectedKeys = new Set(sentences.map(([key]) => key));
  for (const key of Object.keys(closeReadings)) {
    if (!expectedKeys.has(key)) fail(paper, `存在未使用的精读编号 ${key}`);
  }
  sentences.forEach(([key, sentence]) => {
    validateCloseReading(paper, key, sentence, closeReadings[key]);
  });

  const seenSentences = new Map();
  for (const [key, sentence] of sentences) {
    const normalized = normalizeSentence(sentence);
    const previous = seenSentences.get(normalized);
    if (previous) fail(paper, `${previous} 与 ${key} 的句子重复`);
    else seenSentences.set(normalized, key);
  }

  const questionNumbers = new Set();
  let questionCount = 0;
  reading.passages.forEach((passage, passageIndex) => {
    const passageText = normalizeQuotes(passage.sentences.join(' ')).toLowerCase();
    for (const question of passage.questions ?? []) {
      questionCount += 1;
      const questionKey = `Q${question.number}`;
      if (questionNumbers.has(question.number)) fail(paper, `${questionKey} 编号重复`);
      questionNumbers.add(question.number);
      validateCloseReading(paper, questionKey, question.prompt, question.closeReading);
      const optionKeys = question.options.map((option) => option.key);
      if (optionKeys.length !== 4 || new Set(optionKeys).size !== 4) {
        fail(paper, `${questionKey} 必须有四个不重复选项`);
      }
      if (!optionKeys.includes(question.answer)) fail(paper, `${questionKey} 的答案不在选项中`);
      if (!question.evidence?.trim()) fail(paper, `${questionKey} 缺少原文依据`);
      if (question.evidence && !passageText.includes(normalizeQuotes(question.evidence).toLowerCase())) {
        fail(paper, `${questionKey} 的原文依据不在 Passage ${passageIndex + 1} 中`);
      }
      if (!question.analysis?.trim()) fail(paper, `${questionKey} 缺少解题分析`);
      question.options.forEach((option) => {
        if (!option.text?.trim() || !option.explanation?.trim()) {
          fail(paper, `${questionKey} 的 ${option.key} 选项缺少文本或解析`);
        }
      });
    }
  });

  console.log(
    `✓ ${paper}: ${sentences.length} 句，${Object.keys(closeReadings).length} 份精读，${questionCount} 道题`,
  );
}

const blogSpecifications = [
  ...['2015-06', '2015-12'].flatMap((date) => [1, 2, 3].map((set) => ({
    paper: `${date} CET6 Set ${set}`,
    module: path.join(
      projectRoot,
      `src/data/closeReading/2015${date === '2015-06' ? 'June' : 'December'}Set${set}.ts`,
    ),
    exportName: `cet6CloseReadings${date.replace('-', '')}Set${set}`,
    reading: path.join(projectRoot, `src/data/reading/${date}-cet6-reading-${set}.json`),
    semantic: date === '2015-12',
  }))),
  ...[1, 2, 3].map((set) => ({
    paper: `2025-06 CET6 Set ${set}`,
    module: path.join(projectRoot, `src/data/closeReading/2025JuneSet${set}.ts`),
    exportName: `cet6CloseReadings202506Set${set}`,
    mdx: path.join(projectRoot, `src/content/reading/2025-06-cet6-${set}.mdx`),
    semantic: true,
  })),
];

let blogSentenceCount = 0;
let semanticSentenceCount = 0;
for (const specification of blogSpecifications) {
  const module = await importTypeScript(specification.module);
  const closeReadings = module[specification.exportName];
  const sentences = specification.reading
    ? readingSentenceMap(JSON.parse(await readFile(specification.reading, 'utf8')))
    : await mdxSentenceMap(specification.mdx);
  const sentenceEntries = Object.entries(sentences);
  const expectedKeys = new Set(Object.keys(sentences));

  if (!closeReadings) {
    fail(specification.paper, `缺少 ${specification.exportName} 导出`);
    continue;
  }
  for (const key of Object.keys(closeReadings)) {
    if (!expectedKeys.has(key)) fail(specification.paper, `存在未使用的精读编号 ${key}`);
  }
  for (const [key, sentence] of sentenceEntries) {
    const closeReading = closeReadings[key];
    validateCloseReading(specification.paper, key, sentence, closeReading);
    if (specification.semantic) {
      validateSemanticAnalysis(specification.paper, key, sentence, closeReading);
      semanticSentenceCount += 1;
    }
  }

  blogSentenceCount += sentenceEntries.length;
  console.log(
    `✓ ${specification.paper}: ${sentenceEntries.length} 句，${Object.keys(closeReadings).length} 份精读${specification.semantic ? '，含主句语义分析' : ''}`,
  );
}

if (failures.length > 0) {
  console.error(`\nReading 数据校验失败（${failures.length} 项）：`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`\n全部 ${files.length} 套 Games Reading 数据校验通过。`);
console.log(`全部 ${blogSpecifications.length} 套 Blog Reading（${blogSentenceCount} 句）校验通过，其中 ${semanticSentenceCount} 句完成独立主句语义分析。`);
