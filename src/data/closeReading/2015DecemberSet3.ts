import type { CloseReading } from '../../types/closeReading';
import notes from './2015DecemberSet3.json';
import analyses from './2015DecemberSet3.structures.json';
import {
  createBlogCloseReadings,
  type AnalysisOverride,
} from './createBlogCloseReadings';

const mainStructure: Partial<Record<string, CloseReading['highlights']>> = {
  C04: [
    { role: 'subject', text: 'Whether or not we can catch up on sleep—on the weekend, say—' },
    { role: 'predicate', text: 'is' },
    { role: 'complement', text: 'a hotly debated topic among sleep researchers' },
  ],
  C05: [
    { role: 'subject', text: 'The latest evidence' },
    { role: 'predicate', text: 'suggests' },
    { role: 'object', text: 'that while it isn’t ideal, it might help' },
  ],
  C07: [
    { role: 'subject', text: 'That' },
    { role: 'predicate', text: 'suggests' },
    { role: 'object', text: 'that catch-up sleep may undo some but not all of the damage that sleep deprivation causes' },
  ],
  'M-H04': [
    { role: 'subject', text: 'It' },
    { role: 'predicate', text: 'is' },
    { role: 'complement', text: 'actually about what their peers think of them, what their social norms are, what is seen as desirable in society' },
  ],
  'M-I01': [
    { role: 'subject', text: 'The passive attitude we have to climate change as individuals' },
    { role: 'predicate', text: 'can be altered' },
    { role: 'adverbial', text: 'by counting us in—and measuring us against—our peer group' },
  ],
  'M-I03': [
    { role: 'subject', text: 'just perceiving norms' },
    { role: 'predicate', text: 'is' },
    { role: 'complement', text: 'enough to cause people to adjust their behavior in the direction of the crowd' },
  ],
  'M-M01': [
    { role: 'subject', text: 'Tapping into how we already see ourselves' },
    { role: 'predicate', text: 'is' },
    { role: 'complement', text: 'crucial' },
  ],
  'M-M03': [
    { role: 'subject', text: 'chances' },
    { role: 'predicate', text: 'are' },
    { role: 'complement', text: 'they will be politically motivated and be used to collective action' },
  ],
  'M-N03': [
    { role: 'subject', text: 'The union backing it' },
    { role: 'predicate', text: 'makes' },
    { role: 'object', text: 'members' },
    { role: 'complement', text: 'think there must be something in it' },
  ],
  'M-O01': [
    { role: 'subject', text: 'Nick Perks' },
    { role: 'predicate', text: 'believes' },
    { role: 'object', text: 'this sort of activity is where the future of environmental action lies' },
  ],
  'M-P03': [
    { role: 'subject', text: 'new studies' },
    { role: 'predicate', text: 'are' },
    { role: 'complement', text: 'in development' },
    { role: 'subject', text: 'social scientists' },
    { role: 'predicate', text: 'are regularly spotted' },
    { role: 'adverbial', text: 'in British government offices' },
  ],
  'R1-19': [
    { role: 'subject', text: 'Informal learning environments' },
    { role: 'predicate', text: 'tolerate' },
    { role: 'object', text: 'failure' },
    { role: 'adverbial', text: 'better than schools' },
  ],
  'R2-01': [
    { role: 'subject', text: 'There' },
    { role: 'predicate', text: '’s' },
    { role: 'complement', text: 'an old saying in the space world' },
  ],
  'R2-02': [
    { role: 'subject', text: 'George Whitesides' },
    { role: 'predicate', text: 'was placing' },
    { role: 'object', text: 'his company' },
    { role: 'adverbial', text: 'in the latter category' },
  ],
  'R2-08': [
    { role: 'subject', text: 'Virgin Galactic' },
    { role: 'predicate', text: 'had' },
    { role: 'predicate', text: 'seemed' },
    { role: 'complement', text: 'closest to starting regular flights' },
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
  C10: {
    highlights: [
      ['object', '“A sleeping pill will target one area of the brain, but there’s never going to be a perfect sleeping pill, because you couldn’t really replicate the different chemicals moving in and out of different parts of the brain to go through the different stages of sleep,”', '直接引语（整体）'],
      ['subject', 'Dr. Nancy Collop, director of the Emory University Sleep Center'],
      ['predicate', 'says'],
    ],
  },
  C04: {
    ...trunkOverrides.C04,
    highlights: [
      ['subject', 'Whether or not we can catch up on sleep—on the weekend, say—', '主语从句（整体）'],
      ['predicate', 'is'],
      ['complement', 'a hotly debated topic among sleep researchers'],
    ],
  },
  C08: {
    highlights: [
      ['adverbial', 'Still'],
      ['subject', 'Liu'],
      ['predicate', 'isn’t'],
      ['complement', 'ready to endorse the habit of sleeping less and making up for it later'],
    ],
  },
  'M-F01': {
    highlights: [['complement', 'Not any longer', '省略式回答（整体）']],
    pattern: '省略式回答',
    explanation: '这是承接上文的省略回答，相当于“现在不再如此”，不是需要硬拆主谓宾的完整句。',
  },
  'M-G01': {
    highlights: [
      ['subject', 'Few political libraries'],
      ['predicate', 'are'],
      ['complement', 'without a copy of Nudge: Improving Decisions About Health, Wealth and Happiness, by Richard Thaler and Cass Sunstein'],
    ],
  },
  'M-M03': {
    highlights: [
      ['predicate', 'Take'],
      ['object', 'your average trade union member'],
      ['subject', 'chances'],
      ['predicate', 'are'],
      ['complement', 'they will be politically motivated and be used to collective action—much like Erica Gregory', '表语从句（整体）'],
    ],
    pattern: '祈使句 + 主语 + 系动词 + 表语从句',
    explanation: '前半句 Take... 是祈使句；后半句的主干是 chances + are，省略 that 的表语从句整体说明很可能出现的情况。',
  },
  'M-P04': {
    highlights: [
      ['adverbial', 'With the help of psychologists'],
      ['subject', 'there'],
      ['predicate', 'is'],
      ['complement', 'fresh hope that we might go green after all'],
    ],
  },
  'R2-01': {
    ...trunkOverrides['R2-01'],
    highlights: [
      ['subject', 'There'],
      ['predicate', '’s'],
      ['complement', 'an old saying in the space world: amateurs talk about technology, professionals talk about insurance'],
    ],
  },
  'R1-09': {
    highlights: [
      ['subject', 'Fifth graders'],
      ['predicate', 'tended'],
      ['complement', 'to focus on features of individual eagles (“How big are they?” and “What do they eat?”)'],
    ],
  },
};

export const cet6CloseReadings201512Set3 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReading['analysis'] & {}>>,
  structureOverrides,
);
