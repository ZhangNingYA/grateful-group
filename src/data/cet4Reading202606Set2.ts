import type { CloseReading } from '../types/closeReading';
import { cet4Set2ClozeCloseReadings } from './closeReading/cet4Set2Cloze';
import { cet4Set2MatchingCloseReadings } from './closeReading/cet4Set2Matching';
import { cet4Set2PassageOneCloseReadings } from './closeReading/cet4Set2PassageOne';
import { cet4Set2PassageTwoCloseReadings } from './closeReading/cet4Set2PassageTwo';

export const cet4CloseReadings202606Set2 = {
  ...cet4Set2ClozeCloseReadings,
  ...cet4Set2MatchingCloseReadings,
  ...cet4Set2PassageOneCloseReadings,
  ...cet4Set2PassageTwoCloseReadings,
} satisfies Record<string, CloseReading>;

export const cet4Reading202606Set2 = {
  cloze: {
    title: 'Why some people who taste more bitterness drink more coffee',
    sentences: [
      'It may sound surprising, but people who are supersensitive to coffee’s bitter taste actually drink more of it, a new study finds.',
      'This sensitivity isn’t simply a matter of taste, either, but rather is influenced by a person’s genetic makeup, the researchers said in the study.',
      '“You’d expect that people who are particularly sensitive to the bitter taste of caffeine would drink less coffee,” said study senior researcher Marilyn Cornelis.',
      '“The opposite results of our study suggest coffee consumers acquire a taste for or an ability to detect the bitterness of caffeine due to the learned positive reinforcement brought out by caffeine.”',
      'Put another way, people who have a heightened ability to taste the bitterness of coffee learn to associate “good things with it,” Cornelis said.',
      'This finding is surprising, given that bitterness often serves as a warning mechanism to convince people to spit out harmful substances, scientists said.',
      'Researchers conducted the study to understand how genetics influences people’s consumption of tea, coffee and alcohol which tend to taste bitter, said lead study researcher Jue Sheng Ong.',
      '“While all bitter flavors may seem the same, we perceive the bitterness of Brussels sprouts (抱子甘蓝), quinine (奎宁) and caffeine separately,” Ong told Live Science.',
      '“The degree to which we find these flavors bitter is, in part, determined by your genes.”',
      'People with the genes to taste the bitterness of green vegetables are more likely to prefer tea to coffee.',
      'In addition, people who were more sensitive to quinine’s bitter flavors and those found in green vegetables tended to avoid coffee.',
    ],
  },
  matching: {
    title: 'Exercise and Dementia',
    paragraphs: [
      {
        label: 'A',
        sentences: [
          'If this doesn’t encourage you to squeeze in a workout today, nothing will: a new study from Sweden shows that women who were highly fit in mid-life were nearly 90% less likely to get dementia (失智) decades later.',
        ],
      },
      {
        label: 'B',
        sentences: [
          'After initial exercise tests in middle age, researchers followed the women for 44 years.',
          'Both groups lived just as long, but those who could ride an exercise bike at a fast rate for 6 minutes in the initial test had a much lower risk of dementia later on than those who couldn’t complete the workout.',
        ],
      },
      {
        label: 'C',
        sentences: [
          'The study, published Wednesday in the journal Neurology, couldn’t prove that exercise prevented dementia, and the findings aren’t a surprise—it’s long been known there’s a correlation between exercise and decreased dementia risk—but the results were particularly dramatic.',
          'About 5% of the women with the highest peak workload—those who were able to bike the hardest over those 6 minutes—developed dementia, compared to 25% of those with medium fitness and 45% who weren’t fit enough to finish the test, the study found.',
          'Overall, women who were highly fit compared to those who were moderately fit decreased their risk of dementia by 88%.',
          'The few highly fit women who did develop dementia became symptomatic at age 90 on average, 11 years later than the moderately fit.',
        ],
      },
      {
        label: 'D',
        sentences: [
          '“I’m very surprised that the finding was so strong,” said Ingmar Skoog, the paper’s senior author and a psychiatry (精神病学) professor at The University of Gothenburg in Sweden.',
          '“It really shows the importance of exercise.”',
        ],
      },
      {
        label: 'E',
        sentences: [
          'Dementia, as defined in medical dictionaries, is a broad term that describes a loss of thinking ability, memory, attention, logical reasoning, and other mental abilities.',
          'These changes are severe enough to interfere with social or occupational functioning.',
          'Dementia isn’t a disease.',
          'Instead, it’s a group of symptoms caused by other conditions.',
          'It happens when the parts of your brain used for learning, memory, decision making, and language are damaged or diseased.',
          'About 5%–8% of adults over age 65 have some form of dementia.',
          'This percentage doubles every 5 years after 65.',
          'As many as half of people in their 80s have some dementia.',
        ],
      },
      {
        label: 'F',
        sentences: [
          'Dementia is not temporary confusion or forgetfulness that might result from an infection that heals without treatment.',
          'It can also come from an underlying (潜在的) illness or side effects of medications.',
          'Dementia typically gets worse over time.',
          'People with dementia have problems with thinking and remembering that affect their ability to manage their daily life.',
        ],
      },
      {
        label: 'G',
        sentences: [
          'Dementia is typically associated with declines in cognitive function.',
          'Yet researchers have found an association between dementia and declines in hearing and other basic sensory functions.',
        ],
      },
      {
        label: 'H',
        sentences: [
          'Though the study mentioned above was fairly small (only 191 women took the initial fitness test, which means it’s hard to maintain statistical significance while breaking the group down into sub-categories of more or less fit), it does give us hope that dementia can be prevented or delayed through exercise in one’s middle age.',
        ],
      },
      {
        label: 'I',
        sentences: [
          'Alzheimer’s (阿尔茨海默症) and other dementias are believed to begin 15–20 years before symptoms even appear, so it makes sense that exercising in mid-life would affect the risk, Skoog said.',
          'Exercise alone is not likely to prevent Alzheimer’s, but the study shows people are not helpless in the face of one of the most feared, costliest and common diseases of old age, he added.',
          'And the same activities that help prevent Alzheimer’s—including avoiding smoking, getting adequate exercise and sleep and eating a healthy diet—also prevent heart disease, he said, making them even more worthwhile.',
          '“You can do something yourself to decrease your odds,” Skoog said.',
        ],
      },
      {
        label: 'J',
        sentences: [
          'Maintaining a healthy lifestyle in mid-life, decades before disease sets in, makes sense, said David Knopman, a fellow of the American Academy of Neurology, who was not involved in the study.',
          '“I suspect it’s a dose,” said Knopman, also associate director of the Alzheimer’s Disease Research Center at Mayo Clinic in Rochester, Minnesota.',
          '“Starting in late life is better than not starting at all, but starting in mid-life seems to offer a larger benefit.”',
        ],
      },
      {
        label: 'K',
        sentences: [
          'Although it is not entirely clear why exercise helps put off or prevent Alzheimer’s, Knopman said it’s likely that exercise maintains good blood flow to the brain.',
          '“When the brain is healthier from a vascular (血管的) point of view, it can absorb more Alzheimer’s pathogen (病原体) before people become symptomatic,” he said.',
        ],
      },
      {
        label: 'L',
        sentences: [
          'The message isn’t that everyone needs to run marathons in middle age, Knopman said, but a healthy lifestyle pays off.',
        ],
      },
      {
        label: 'M',
        sentences: [
          'This type of study can’t say exactly what kind of exercise is best, or how much is needed—only a study that has a placebo (安慰剂) group and tracks people going forward can do that, said Keith Fargo, director of scientific programs and outreach at the non-profit Alzheimer’s Association.',
          '“The literature has not yet settled on an amount or type of exercise that is going to be key, although the bulk of literature has suggested that aerobic (有氧的) exercise is what you need to be doing,” he said.',
          'That doesn’t mean you have to compete in marathons but “more than a 10-min dog walk” would be a good idea, Fargo said.',
        ],
      },
      {
        label: 'N',
        sentences: [
          'Several lifestyle studies are getting underway soon, including one backed by the Alzheimer’s Association called the US POINTER study, which will offer at-risk adults, ages 60–79, a series of lifestyle interventions (干预) to see if they impact Alzheimer’s risk.',
          'That and other Alzheimer’s-related studies are always looking for volunteers to participate, he said.',
        ],
      },
      {
        label: 'O',
        sentences: [
          'In the next three to five years, these studies should allow researchers to provide clearer recommendations for exercise and other lifestyle modifications that might reduce Alzheimer’s risk, such as sleep, diet and social activities, Fargo said.',
          'But it’s already quite clear that exercising at any point in life is better for your brain than not exercising at all, Fargo added.',
        ],
      },
      {
        label: 'P',
        sentences: [
          '“If you don’t want to have dementia when you’re 80, the time to start getting fit is now,” he said.',
          '“It may not necessarily give you a longer life, but there’s a compelling body of work that it will give you more good years.”',
        ],
      },
    ],
  },
  passages: [
    {
      title: 'Passage One · The Impostor Phenomenon',
      sentences: [
        'People who systematically underestimate themselves and their own performance suffer from the so-called Impostor Phenomenon.',
        'They think that any success is due to external circumstances or just luck and chance.',
        'Those people live in constant fear that their “deception” will be exposed.',
        'It is common for people to question their abilities now and again.',
        'A healthy amount of reflection and self-doubt can protect a person from acting impulsively.',
        'However, there are people who are permanently plagued by a massive amount of self-doubt despite delivering a good performance.',
        'They think that all of their successes are not a product of their skill or hard work, instead, they attribute their own successes to external circumstances, for example, to luck and chance, or believe that their performance is massively overestimated by others.',
        'Failures, on the other hand, are always internalised as the result of their own shortcomings.',
        'Psychologists from Martin Luther University Halle-Wittenberg examined the topic for the first time under real-life conditions.',
        'Seventy-six participants completed a range of intelligence tests and received positive feedback on them, regardless of their actual performance.',
        'They were then asked why they think they did so well.',
        'The study showed two things:',
        'First, the self-reported degree of Impostor Phenomenon is not related to actual measured intelligence or performance.',
        'Secondly, the test supported the assumption that people with a tendency to exhibit the Impostor Phenomenon devalue their objectively measured performance and attribute positive results to external causes such as luck and chance, but not to their own abilities.',
        'These results are also completely unrelated to age and gender.',
        'A permanent underestimation of one’s own abilities is often accompanied by the fear that this supposed intellectual deception will be exposed sooner or later and that they will pay the price for this.',
        'The Impostor Phenomenon was first described in 1978 by US psychologists Pauline Clance and Suzanne Imes.',
        'They observed that there is a particularly high number of successful women who do not think they are very intelligent.',
        'The Impostor Phenomenon is not defined as a mental illness.',
        'However, people who suffer from it show a higher vulnerability to depression.',
      ],
    },
    {
      title: 'Passage Two · Music as a universal language',
      sentences: [
        'Music is a universal language.',
        'In every culture and country, you will find music.',
        'It is vitally important across the globe and has the potential to bring people together in peace and harmony.',
        'One of my favorite experiences in music is seeing musicians from different cultures come together and perform as a group.',
        'When each culture brings its own unique qualities to the group, an entirely new sound is achieved.',
        'This can create extraordinary results.',
        'People can communicate with each other using music as the common language.',
        'One common musical thread between cultures is known as the pentatonic scale.',
        'It is astonishing how many cultures share this tool in approaching music.',
        'The pentatonic scale consists of five notes; “penta-” meaning 5, and “tonic” meaning tone or note.',
        'This scale can be found in music everywhere including that of Native Americans, Africans, and Asians.',
        'It is also found in popular music, blues, jazz, and rock.',
        'Using this five-note scale, musicians from around the globe have a medium through which they can relate, communicate, perform, and ultimately understand each other.',
        'Music is tied to specific perceptual (感知的), mental, and emotional faculties, including language (all societies put words to their songs), motor control (people in all societies dance), sound analysis (all musical systems have a distinct pitch and quality), and aesthetics (美感) (their tunes and rhythms are balanced between repetitiveness and chaos).',
        'There is no known society that existed without music.',
        'Although each culture has their own specific style and approach to music, you will find that the purposes behind music are very similar across the board.',
        'Music essentially serves to express or change emotions.',
        'It can cheer you up, sadden you, anger you or excite you.',
        'Music is often ceremonial: used in religion, ceremony, and celebration.',
        'Music can simply be recreational: entertaining, joyful and fun.',
        'Any way you have used music, it is almost certain that every other culture has used music in the very same way.',
        'And that is something that bonds all of us.',
        'We all share a deep love for music and it has the power to unite us.',
      ],
    },
  ],
} as const;
