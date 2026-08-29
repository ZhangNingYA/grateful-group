import type { CloseReading } from '../../types/closeReading';
import notes from './2015DecemberSet2.json';
import analyses from './2015DecemberSet2.structures.json';
import {
  createBlogCloseReadings,
  type AnalysisOverride,
} from './createBlogCloseReadings';

const mainStructure: Partial<Record<string, CloseReading['highlights']>> = {
  C15: [
    { role: 'subject', text: 'much of Nokia’s most valuable design and programming talent' },
    { role: 'predicate', text: 'left' },
    { role: 'adverbial', text: 'as well' },
  ],
  'M-D01': [
    { role: 'subject', text: 'Matt Rubinoff' },
    { role: 'predicate', text: 'directs' },
    { role: 'object', text: 'I’m First' },
  ],
  'M-D03': [
    { role: 'subject', text: 'he' },
    { role: 'predicate', text: 'says' },
    { role: 'object', text: 'that number isn’t high enough' },
  ],
  'M-G02': [
    { role: 'subject', text: 'The reality of it' },
    { role: 'predicate', text: 'is' },
    { role: 'complement', text: 'that a lot of low-income kids could be going to elite universities on a full ride scholarship and don’t even realize it' },
  ],
  'M-N03': [
    { role: 'subject', text: 'Students' },
    { role: 'predicate', text: 'are placed' },
    { role: 'adverbial', text: 'in small groups with counselors' },
    { role: 'subject', text: 'they' },
    { role: 'predicate', text: 'have' },
    { role: 'object', text: 'access to cultural and ethnic affinity groups, tutoring centers' },
  ],
  'R1-01': [
    { role: 'subject', text: 'some of the most influential medical groups in the nation' },
    { role: 'predicate', text: 'are recommending' },
    { role: 'object', text: 'that doctors weigh the costs, not just the effectiveness of treatments' },
  ],
  'R1-02': [
    { role: 'subject', text: 'The shift' },
    { role: 'predicate', text: 'suggests' },
    { role: 'object', text: 'that doctors are starting to redefine their roles' },
  ],
  'R1-09': [
    { role: 'subject', text: 'He' },
    { role: 'predicate', text: 'said' },
    { role: 'object', text: 'doctors risked losing the trust of patients if they told patients, “I’m not going to do what I think is best for you because I think it’s bad for the healthcare budget in Massachusetts.”' },
  ],
  'R1-18': [
    { role: 'subject', text: 'Dr. Daniel Sulmasy' },
    { role: 'predicate', text: 'said' },
    { role: 'object', text: '“it represents a failure of wider society to take up the issue.”' },
  ],
  'R2-01': [
    { role: 'subject', text: 'President Barack Obama' },
    { role: 'predicate', text: 'declared' },
    { role: 'object', text: 'Economic inequality is the “defining challenge of our time,”' },
  ],
  'R2-05': [
    { role: 'subject', text: 'A number of prominent economists' },
    { role: 'predicate', text: 'have also argued' },
    { role: 'object', text: 'that it’s harder for the poor to climb the economic ladder today because the rungs in that ladder have grown farther apart' },
  ],
  'R2-08': [
    { role: 'subject', text: 'what factors, at the community level' },
    { role: 'predicate', text: 'do predict' },
    { role: 'object', text: 'if poor children will move up the economic ladder as adults' },
  ],
  'R2-09': [
    { role: 'subject', text: 'What' },
    { role: 'predicate', text: 'explains' },
    { role: 'object', text: 'why the Salt Lake City metro area is one of the 100 largest metropolitan areas most likely to lift the fortunes of the poor and the Atlanta metro area is one of the least likely' },
  ],
};

const trunkOverrides = Object.fromEntries(
  Object.entries(mainStructure).map(([key, trunk]) => {
    const parts = trunk?.map(({ role, text }) => [role, text] as const);
    return [key, { highlights: parts, trunk: parts }];
  }),
) as Readonly<Record<string, AnalysisOverride>>;
const structureOverrides: Readonly<Record<string, AnalysisOverride>> = {
  ...trunkOverrides,
  'M-A02': {
    highlights: [
      ['adverbial', 'Like many first-generation students'],
      ['subject', 'he'],
      ['predicate', 'enrolled'],
      ['complement', 'in a medium-sized state university many of his high school peers were also attending'],
      ['predicate', 'received'],
      ['object', 'a Pell Grant'],
      ['predicate', 'took out'],
      ['object', 'some small federal loans'],
      ['adverbial', 'to cover other costs'],
    ],
  },
  C11: {
    highlights: [
      ['adverbial', 'Most notably'],
      ['subject', 'Jorma Ollila, who had led Nokia’s transition from an industrial company to a technology giant'],
      ['predicate', 'was'],
      ['complement', 'too fascinated by the company’s previous success to recognize the change that was needed to sustain its competitiveness'],
    ],
  },
  'R2-09': {
    ...trunkOverrides['R2-09'],
    highlights: [
      ['subject', 'What'],
      ['predicate', 'explains'],
      ['adverbial', 'for instance'],
      ['object', 'why the Salt Lake City metro area is one of the 100 largest metropolitan areas most likely to lift the fortunes of the poor and the Atlanta metro area is one of the least likely', '宾语从句（整体）'],
    ],
  },
  'M-L05': {
    highlights: [
      ['adverbial', 'Now'],
      ['subject', 'she'],
      ['predicate', 'attributes'],
      ['object', 'much of her understanding of college'],
      ['complement', 'to that'],
      ['complement', '“But once I got to campus, it was a completely different ball game that no one really prepared me for.”', '冒号后的直接引语（整体）'],
    ],
  },
  'M-L02': {
    highlights: [
      ['adverbial', 'Like other students new to the intimidating higher-education world'],
      ['subject', 'she'],
      ['adverbial', 'often'],
      ['predicate', 'struggled'],
      ['adverbial', 'on her path to college'],
      ['object', '“There wasn’t really a college-bound culture at my high school,”', '直接引语（整体）'],
      ['subject', 'she'],
      ['predicate', 'said'],
    ],
  },
  'M-H01': {
    highlights: [
      ['object', '“Many students are coming from a situation where no one around them has the experience of successfully completing higher education, so they are coming in questioning themselves and their college worthiness,”', '直接引语（整体）'],
      ['subject', 'Jarrat'],
      ['predicate', 'continued'],
    ],
  },
  'M-N02': {
    highlights: [
      ['object', '“There is a lot of support at Yale, to an extent, after a while, there is too much support,”', '直接引语（整体）'],
      ['subject', 'he'],
      ['predicate', 'said'],
      ['adverbial', 'half-joking about the countless resources available at the school'],
    ],
  },
  'R2-13': {
    highlights: [
      ['adverbial', 'Based on my analyses of the data'],
      ['adverbial', 'of the factors that Chetty has highlighted'],
      ['subject', 'the following three'],
      ['predicate', 'seem'],
      ['complement', 'to be most predictive of upward mobility in a given community'],
    ],
  },
  'R2-14': {
    highlights: [['complement', '1. Per-capita income growth', '列表项（名词短语）']],
    pattern: '列表项（名词短语）',
    explanation: '这是上一句所列相关因素的第一项，不是独立完整句，因此按名词短语整体理解。',
  },
  'R2-15': {
    highlights: [['complement', '2. Prevalence of single mothers (where correlation is strong, but negative)', '列表项（名词短语）']],
    pattern: '列表项（名词短语）',
    explanation: '这是上一句所列相关因素的第二项；括号补充说明相关方向，整项不再拆成主谓宾。',
  },
  'R2-16': {
    highlights: [['complement', '3. Per-capita local government spending', '列表项（名词短语）']],
    pattern: '列表项（名词短语）',
    explanation: '这是上一句所列相关因素的第三项，不是独立完整句，因此按名词短语整体理解。',
  },
};

export const cet6CloseReadings201512Set2 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReading['analysis'] & {}>>,
  structureOverrides,
);
