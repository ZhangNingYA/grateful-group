import type { CloseReading } from '../../types/closeReading';
import notes from './2015DecemberSet1.json';
import analyses from './2015DecemberSet1.structures.json';
import {
  createBlogCloseReadings,
  type AnalysisOverride,
} from './createBlogCloseReadings';

const mainStructure: Partial<Record<string, CloseReading['highlights']>> = {
  'M-B05': [
    { role: 'subject', text: 'Momentum' },
    { role: 'predicate', text: 'is said' },
    { role: 'complement', text: 'to be “conserved,”' },
  ],
  'M-B06': [
    { role: 'subject', text: 'a heavy object' },
    { role: 'predicate', text: 'has' },
    { role: 'object', text: 'a lot of momentum' },
  ],
  'M-C02': [
    { role: 'subject', text: 'we' },
    { role: 'predicate', text: 'don’t speak' },
    { role: 'complement', text: 'only of objects or people as having momentum' },
    { role: 'subject', text: 'we' },
    { role: 'predicate', text: 'speak' },
    { role: 'complement', text: 'of entire systems having momentum' },
  ],
  'M-I05': [
    { role: 'subject', text: 'our prospective new energy workers' },
    { role: 'predicate', text: 'have to be trained' },
    { role: 'subject', text: 'they' },
    { role: 'predicate', text: 'have to be trained' },
    { role: 'adverbial', text: 'in the right sequence' },
  ],
  'M-L01': [
    { role: 'subject', text: 'understanding energy system inertia and momentum' },
    { role: 'predicate', text: 'can help' },
    { role: 'object', text: 'you' },
    { role: 'complement', text: 'decide whether their plans are feasible' },
  ],
  'R1-04': [
    { role: 'subject', text: 'Jesse Jackson' },
    { role: 'predicate', text: 'declared' },
    { role: 'object', text: 'that “African American” was the term to embrace' },
  ],
  'R1-08': [
    { role: 'subject', text: 'researchers' },
    { role: 'predicate', text: 'hadn’t identified' },
    { role: 'object', text: 'what that gap in perception was derived from' },
  ],
  'R1-09': [
    { role: 'subject', text: 'A recent study' },
    { role: 'predicate', text: 'found' },
    { role: 'object', text: 'that “Black” people are viewed more negatively than “African Americans” because of a perceived difference in socioeconomic status' },
  ],
  'R1-13': [
    { role: 'subject', text: 'A job application' },
    { role: 'predicate', text: 'might mention' },
    { role: 'object', text: 'affiliations with groups such as the “Wisconsin Association of African-American Lawyers” or the “National Black Employees Association,”' },
  ],
  'R1-19': [
    { role: 'subject', text: 'Nearly three-quarters of the first group' },
    { role: 'predicate', text: 'guessed' },
    { role: 'object', text: 'that Mr. Williams worked at a managerial level' },
  ],
  'R1-20': [
    { role: 'subject', text: 'Hall’s findings' },
    { role: 'predicate', text: 'suggest' },
    { role: 'object', text: 'there’s an argument to be made for electing to use “African American,”' },
  ],
  'R2-15': [
    { role: 'subject', text: 'the global economy' },
    { role: 'predicate', text: 'Nor is' },
    { role: 'complement', text: 'forgiving of an American workforce with increasingly weak literacy, math and science abilities' },
  ],
  'R2-18': [
    { role: 'subject', text: 'the party' },
    { role: 'predicate', text: 'may soon be' },
    { role: 'complement', text: 'over' },
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
  C06: {
    highlights: [
      ['subject', 'The agency'],
      ['predicate', 'is now investigating'],
      ['object', 'the toxic effects of some of the chemicals'],
      ['adverbial', 'in the latest report'],
    ],
  },
  'M-C01': {
    highlights: [
      ['subject', 'there'],
      ['predicate', 'are'],
      ['complement', 'other kinds of momentum'],
      ['adverbial', 'as well'],
    ],
  },
  'M-A03': {
    highlights: [
      ['adverbial', 'Unfortunately for them (and often the taxpayers)'],
      ['subject', 'our energy systems'],
      ['predicate', 'are'],
      ['complement', 'a bit like an aircraft carrier: they are unbelievably expensive, they are built to last for a very long time, they have a huge amount of inertia (meaning it takes a lot of energy to set them moving), and they have a lot of momentum once they are set in motion'],
    ],
  },
  'M-B07': {
    highlights: [
      ['adverbial', 'If you want to change his course', '条件状语从句（整体）'],
      ['subject', 'you'],
      ['predicate', 'have'],
      ['object', 'only a few choices'],
      ['complement', 'you can stop him, transferring (possibly painfully) some of his kinetic energy to your own body, or you can approach alongside and slowly apply pressure to gradually alter his course', '冒号后的选择说明（整体）'],
    ],
  },
  'M-D06': {
    highlights: [
      ['subject', 'There'],
      ['predicate', 'are'],
      ['complement', 'standard-shaped bulbs, flame-shaped bulbs, colored globe-shaped bulbs, and more'],
    ],
  },
  'M-F01': {
    highlights: [
      ['subject', 'there'],
      ['predicate', 'is'],
      ['complement', 'more to the story'],
      ['adverbial', 'because not only are the devices that house incandescent bulbs shaped to their underlying characteristics, but rooms and entire buildings have been designed in accordance with how incandescent lighting reflects off walls and windows', '原因状语从句（整体）'],
    ],
  },
  'M-G01': {
    highlights: [
      ['adverbial', 'As lighting expert Howard Brandston points out'],
      ['adverbial', 'Generally'],
      ['subject', 'there'],
      ['predicate', 'are'],
      ['complement', 'no bad light sources, only bad applications'],
    ],
  },
  'R1-08': {
    ...trunkOverrides['R1-08'],
    highlights: [
      ['adverbial', 'if it was known that “Black” people were viewed differently from “African Americans,”', '条件状语从句（整体）'],
      ['subject', 'researchers'],
      ['adverbial', 'until now'],
      ['predicate', 'hadn’t identified'],
      ['object', 'what that gap in perception was derived from', '宾语从句（整体）'],
    ],
  },
  'R1-02': {
    highlights: [
      ['adverbial', 'Twenty years later'],
      ['subject', 'it'],
      ['predicate', 'was purposefully dropped'],
      ['adverbial', 'to make way for “Negro.”'],
    ],
  },
  'R1-21': {
    highlights: [
      ['adverbial', 'Perhaps'],
      ['subject', 'a new phrase'],
      ['predicate', 'is needed'],
      ['complement', 'one that can bring everyone one big step closer to realizing Du Bois’s original, idealistic hope: “It’s not the name—it’s the Thing that counts.”', '同位说明（整体）'],
    ],
  },
  'R2-14': {
    highlights: [
      ['adverbial', 'As recent graduates can testify', '状语从句（整体）'],
      ['subject', 'the job market'],
      ['predicate', 'isn’t'],
      ['complement', 'kind to candidates who can’t demonstrate genuine competence, along with a well-cultivated willingness to work hard'],
    ],
  },
  'R2-11': {
    highlights: [
      ['adverbial', 'By sanctioning this watered-down version of college'],
      ['subject', 'universities'],
      ['predicate', 'are'],
      ['complement', '“catering to the social and educational needs of wealthy students at the expense of others” who won’t enjoy the financial backing or social connections of richer students once they graduate', '引述的谓语内容（整体）'],
    ],
  },
  'R2-09': {
    highlights: [
      ['subject', 'Laura Hamilton, the author of a study on parents who pay for college'],
      ['predicate', 'will argue'],
      ['adverbial', 'in a forthcoming book'],
      ['object', 'that college administrations are overly concerned with the social and athletic activities of their students', '宾语从句（整体）'],
    ],
  },
  'R2-06': {
    highlights: [
      ['adverbial', 'Although going to college is supposed to be a full-time job', '让步状语从句（整体）'],
      ['subject', 'students'],
      ['predicate', 'spent'],
      ['adverbial', 'on average'],
      ['object', 'only 12 to 14 hours a week studying'],
      ['subject', 'many'],
      ['predicate', 'were skating'],
      ['adverbial', 'through their semesters without doing a significant amount of reading and writing'],
    ],
  },
  'R2-15': {
    ...trunkOverrides['R2-15'],
    highlights: [
      ['subject', 'the global economy'],
      ['predicate', 'Nor is'],
      ['complement', 'forgiving of an American workforce with increasingly weak literacy, math and science abilities'],
    ],
  },
};

export const cet6CloseReadings201512Set1 = createBlogCloseReadings(
  notes as Readonly<Record<string, CloseReading>>,
  analyses as Readonly<Record<string, CloseReading['analysis'] & {}>>,
  structureOverrides,
);
