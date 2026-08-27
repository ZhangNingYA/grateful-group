import type { CloseReading } from '../types/closeReading';
import { cet4Set1MatchingCloseReadings } from './closeReading/cet4Set1Matching';
import { cet4Set1PassageOneCloseReadings } from './closeReading/cet4Set1PassageOne';
import { cet4Set1PassageTwoCloseReadings } from './closeReading/cet4Set1PassageTwo';
import { cet4Set1QuestionCloseReadings } from './closeReading/cet4Set1Questions';

export const cet4CloseReadings202606Set1 = {
  C01: {
    translation: '关于工业革命最大的争议之一，是它如何影响了工人阶级。',
    vocabulary: [
      { term: 'controversy over', explanation: '关于……的争议' },
      { term: 'the Industrial Revolution', explanation: '工业革命' },
      { term: 'the working class', explanation: '工人阶级' },
    ],
    structure: {
      pattern: '主语 + 系动词 + 表语（SVC）',
      explanation: '主语是较长的名词短语；is 连接主语与表语。how 引导的从句整体作表语，说明这项争议的具体内容。',
    },
    highlights: [
      { role: 'subject', text: 'One of the biggest controversies over the Industrial Revolution' },
      { role: 'predicate', text: 'is' },
      { role: 'complement', text: 'how it affected the working class' },
    ],
  },
  C02: {
    translation: '最早的争论围绕着生活水平究竟是提高了还是下降了。',
    vocabulary: [
      { term: 'debate over', explanation: '围绕……的争论' },
      { term: 'standards of living', explanation: '生活水平' },
      { term: 'rise or fall', explanation: '上升还是下降' },
    ],
    structure: {
      pattern: '主语 + 系动词 + 表语（SVC）',
      explanation: 'were 是系动词，over 开头的介词短语作表语；其中 whether...or... 引导宾语从句，说明争论的两个可能结果。',
    },
    highlights: [
      { role: 'subject', text: 'The oldest debates' },
      { role: 'predicate', text: 'were' },
      { role: 'complement', text: 'over whether the standards of living rose or fell' },
    ],
  },
  C03: {
    translation: '那些认为生活水平下降的人声称，资本家从工人阶级身上榨取了他们所能获得的每一分剩余价值。',
    vocabulary: [
      { term: 'squeeze ... from ...', explanation: '从……榨取……' },
      { term: 'every ounce of', explanation: '每一分；所有可能的' },
      { term: 'surplus', explanation: '剩余；这里指剩余价值' },
    ],
    structure: {
      pattern: '主语 + 谓语 + 宾语（SVO）',
      explanation: 'Those 是主语中心词，that believed they fell 是定语从句；claimed 是谓语，后面的 that 从句整体作宾语。从句中的 they 指生活水平。',
    },
    highlights: [
      { role: 'subject', text: 'Those that believed they fell' },
      { role: 'predicate', text: 'claimed' },
      { role: 'object', text: 'that the capitalists squeezed every ounce of surplus they could from the working class' },
    ],
  },
  C04: {
    translation: '那些认为生活水平提高的人则声称，当时的环境对消费者有利，每年都有越来越多的商品可供工人阶级使用。',
    vocabulary: [
      { term: 'consumer-friendly', explanation: '对消费者友好的；有利于消费者的' },
      { term: 'available to', explanation: '可供……使用或获得' },
      { term: 'more and more', explanation: '越来越多的' },
    ],
    structure: {
      pattern: '主语 + 谓语 + 宾语（SVO）',
      explanation: '主语中包含 that 引导的定语从句；claimed 后的 that 从句整体作宾语。with 复合结构补充说明消费环境的具体表现。',
    },
    highlights: [
      { role: 'subject', text: 'Those that believed the standards of living rose' },
      { role: 'predicate', text: 'claimed' },
      { role: 'object', text: 'that the environment was consumer-friendly, with more and more goods available to the working class every year' },
    ],
  },
  C05: {
    translation: '今天的历史学家一致认为，总体而言，生活水平提高了。',
    vocabulary: [
      { term: 'overall', explanation: '总体而言；总的来说' },
      { term: 'agree that', explanation: '一致认为……' },
      { term: 'increase', explanation: '提高；增长' },
    ],
    structure: {
      pattern: '主语 + 谓语 + 宾语（SVO）',
      explanation: 'historians 是主语，agree 是谓语，that 引导的从句整体作宾语；overall 是从句中的评注性状语。',
    },
    highlights: [
      { role: 'subject', text: 'Today’s historians' },
      { role: 'predicate', text: 'agree' },
      { role: 'object', text: 'that overall, the standards of living increased' },
    ],
  },
  C06: {
    translation: '然而，他们对于这种改善发生在何时并没有达成一致。',
    vocabulary: [
      { term: 'agree on', explanation: '就……达成一致' },
      { term: 'however', explanation: '然而；不过' },
      { term: 'improvement', explanation: '改善；提高' },
    ],
    structure: {
      pattern: '主语 + 谓语 + 介词补足语（SV）',
      explanation: 'They 是主语，do not agree 是谓语；however 是插入状语。on 后接 when 引导的宾语从句，共同补足 agree 的内容。',
    },
    highlights: [
      { role: 'subject', text: 'They' },
      { role: 'predicate', text: 'do not agree' },
      { role: 'adverbial', text: 'however' },
      { role: 'complement', text: 'on when this improvement occurred' },
    ],
  },
  C07: {
    translation: '为了化解这一争议，历史学家试图准确界定“生活水平”的含义。',
    vocabulary: [
      { term: 'in an effort to', explanation: '为了；试图' },
      { term: 'attempt to do', explanation: '试图做某事' },
      { term: 'define exactly', explanation: '准确界定' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 宾语（SVO）',
      explanation: '句首不定式短语作目的状语；historians 是主语，have attempted 是谓语，to define... 是不定式宾语，其中 what 引导的从句作 define 的宾语。',
    },
    highlights: [
      { role: 'adverbial', text: 'In an effort to solve this controversy' },
      { role: 'subject', text: 'historians' },
      { role: 'predicate', text: 'have attempted' },
      { role: 'object', text: 'to define exactly what “standard of living” means' },
    ],
  },
  C08: {
    translation: '他们似乎都认同生活水平应当意味着幸福，但幸福是无法衡量的。',
    vocabulary: [
      { term: 'seem to do', explanation: '似乎做某事' },
      { term: 'mean happiness', explanation: '意味着幸福' },
      { term: 'impossible to measure', explanation: '无法衡量' },
    ],
    structure: {
      pattern: '主语 + 系动词 + 表语，but + 主语 + 系动词 + 表语（SVC + SVC）',
      explanation: 'but 连接两个并列分句。第一分句中 seem 后接不定式作表语补足成分，agree 后还有 that 宾语从句；第二分句是典型的 SVC 结构。',
    },
    highlights: [
      { role: 'subject', text: 'They' },
      { role: 'adverbial', text: 'all' },
      { role: 'predicate', text: 'seem' },
      { role: 'complement', text: 'to agree that it should mean happiness' },
      { role: 'subject', text: 'happiness' },
      { role: 'predicate', text: 'is' },
      { role: 'complement', text: 'impossible to measure' },
    ],
  },
  C09: {
    translation: '相反，历史学家通常用“实际收入”来衡量生活水平。',
    vocabulary: [
      { term: 'instead', explanation: '相反；作为替代' },
      { term: 'real income', explanation: '实际收入' },
      { term: 'use A as B', explanation: '把 A 用作 B' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 宾语 + 补语（SVOC）',
      explanation: 'Instead 和 typically 都作状语；historians、use 和 real income 分别是主语、谓语和宾语；as 短语说明实际收入被用作什么。',
    },
    highlights: [
      { role: 'adverbial', text: 'Instead' },
      { role: 'subject', text: 'historians' },
      { role: 'adverbial', text: 'typically' },
      { role: 'predicate', text: 'use' },
      { role: 'object', text: '“real income”' },
      { role: 'complement', text: 'as the measure for the standards of living' },
    ],
  },
  C10: {
    translation: '实际收入是赚取的货币，再根据生活成本进行调整。',
    vocabulary: [
      { term: 'earned', explanation: '赚得的；过去分词作后置修饰' },
      { term: 'adjust according to', explanation: '根据……进行调整' },
      { term: 'cost of living', explanation: '生活成本' },
    ],
    structure: {
      pattern: '主语 + 系动词 + 表语（SVC）',
      explanation: 'Real income 是主语，is 是系动词，其后整个名词短语作表语；earned 和 adjusted 是并列的过去分词，修饰 money。',
    },
    highlights: [
      { role: 'subject', text: 'Real income' },
      { role: 'predicate', text: 'is' },
      { role: 'complement', text: 'money earned and then adjusted according to the cost of living' },
    ],
  },
  C11: {
    translation: '然而，这种衡量方式并没有把失业、污染、健康、预期寿命或空闲时间考虑在内。',
    vocabulary: [
      { term: 'take ... into account', explanation: '把……考虑在内' },
      { term: 'life expectancy', explanation: '预期寿命' },
      { term: 'free time', explanation: '空闲时间' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 宾语（SVO）',
      explanation: 'However 作转折状语，it 指前文用实际收入衡量生活水平的方法。take into account 是完整谓语，后面的并列名词共同作宾语。',
    },
    highlights: [
      { role: 'adverbial', text: 'However' },
      { role: 'subject', text: 'it' },
      { role: 'predicate', text: 'does not take into account' },
      { role: 'object', text: 'unemployment, pollution, health, life expectancy, or free time' },
    ],
  },
  C12: {
    translation: '在对平均收入进行了充分的争论和分析之后，历史学家同意保留分歧，不再强求工业革命期间的经济增长究竟是快还是慢这一问题得出统一结论。',
    vocabulary: [
      { term: 'exhausting debate', explanation: '充分而令人疲惫的争论' },
      { term: 'agree to disagree', explanation: '同意保留分歧；求同存异' },
      { term: 'economic growth', explanation: '经济增长' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 宾语（SVO）',
      explanation: 'After 介词短语作时间状语；historians 是主语，have agreed 是谓语，to disagree... 是不定式宾语，其中 whether 引导的从句作 on 的宾语。',
    },
    highlights: [
      { role: 'adverbial', text: 'After exhausting debate and analysis of the average income' },
      { role: 'subject', text: 'historians' },
      { role: 'predicate', text: 'have agreed' },
      { role: 'object', text: 'to disagree on whether there was rapid or slow economic growth during the Industrial Revolution' },
    ],
  },
  C13: {
    translation: '相反，他们决定解释工业革命是如何受到其他事件影响的。',
    vocabulary: [
      { term: 'decide to do', explanation: '决定做某事' },
      { term: 'interpret', explanation: '解释；阐释' },
      { term: 'be affected by', explanation: '受到……影响' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 宾语（SVO）',
      explanation: 'Instead 作句首状语；they、have decided 分别是主语和谓语；不定式 to interpret... 作宾语，how 从句又作 interpret 的宾语。',
    },
    highlights: [
      { role: 'adverbial', text: 'Instead' },
      { role: 'subject', text: 'they' },
      { role: 'predicate', text: 'have decided' },
      { role: 'object', text: 'to interpret how the Industrial Revolution was affected by other events' },
    ],
  },
  C14: {
    translation: '他们已经确定，工业革命总体上产生了积极影响，但这种影响很可能被战争、高税收和人口快速增长等负面事件抵消了。',
    vocabulary: [
      { term: 'determine that', explanation: '确定；认定……' },
      { term: 'an overall positive effect', explanation: '总体上的积极影响' },
      { term: 'be neutralized by', explanation: '被……抵消' },
    ],
    structure: {
      pattern: '主语 + 谓语 + 宾语（SVO）',
      explanation: 'They 是主语，have determined 是谓语，that 引导的复合句整体作宾语。宾语从句内部由 but 连接主动与被动两个分句。',
    },
    highlights: [
      { role: 'subject', text: 'They' },
      { role: 'predicate', text: 'have determined' },
      { role: 'object', text: 'that the Industrial Revolution had an overall positive effect, but it quite possibly was neutralized by negative events such as wars, high taxes, and rapid population growth' },
    ],
  },
  'M-A01': {
    translation: '我很庆幸自己的时差反应如此严重。',
    vocabulary: [
      { term: 'be glad', explanation: '感到高兴；庆幸' },
      { term: 'jetlag', explanation: '时差反应' },
      { term: 'such + 形容词 + 名词', explanation: '如此……的……' },
    ],
    structure: {
      pattern: '主语 + 系动词 + 表语（SVC）',
      explanation: 'I 是主语，was 是系动词；glad 及其后省略了 that 的从句共同构成表语，说明作者庆幸的原因。',
    },
    highlights: [
      { role: 'subject', text: 'I' },
      { role: 'predicate', text: 'was' },
      { role: 'complement', text: 'glad I had such terrible jetlag' },
    ],
  },
  'M-A02': {
    translation: '凌晨三点半，我毫无睡意，和九岁的女儿待在旅馆的阳台上，连续几个小时凝望着自己见过的最不可思议的夜空；随后黎明慢慢抹去了地平线上的星星，多颗流星也渐渐消失。',
    vocabulary: [
      { term: 'wide awake', explanation: '完全清醒；毫无睡意' },
      { term: 'stare at', explanation: '凝视；盯着看' },
      { term: 'rub out', explanation: '擦掉；使逐渐消失' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 补足语 + 状语（SV）',
      explanation: '句首形容词及介词短语描述时间和伴随状态；I stared 是主干。at 短语补足凝视对象，before 引导时间状语从句，从句内由 and 连接两个动作。',
    },
    highlights: [
      { role: 'adverbial', text: 'Wide awake at 3:30 am with our nine-year-old daughter on our lodge balcony' },
      { role: 'subject', text: 'I' },
      { role: 'predicate', text: 'stared' },
      { role: 'adverbial', text: 'for hours' },
      { role: 'complement', text: 'at the most incredible night sky I’ve ever seen' },
      { role: 'adverbial', text: 'before the dawn slowly started to rub out the stars on the horizon and the multiple shooting stars faded away' },
    ],
  },
  'M-B01': {
    translation: '我们本来要去新西兰奥克兰参加妻子的大家庭聚会，但当我们得知近海的大屏障岛刚刚被授予“暗夜保护区”称号——这种称号通常授予拥有“非凡或卓越星空品质”的偏远地区——我们便认为那里会是繁忙行程开始前放松身心的理想之地。',
    vocabulary: [
      { term: 'family reunion', explanation: '家庭聚会；家族团聚' },
      { term: 'be awarded ... status', explanation: '被授予……称号或地位' },
      { term: 'distinguished quality', explanation: '卓越的品质' },
    ],
    structure: {
      pattern: '主语 + 谓语 + 状语，but + 状语 + 主语 + 谓语 + 宾语',
      explanation: 'but 连接两个主句。第二个主句前有 when 时间状语从句，其中 found out 后接 that 宾语从句；we thought 后的省略 that 从句作宾语。破折号之间是对保护区的补充解释。',
    },
    highlights: [
      { role: 'subject', text: 'We' },
      { role: 'predicate', text: 'were going' },
      { role: 'adverbial', text: 'to my wife’s big family reunion in Auckland, New Zealand' },
      { role: 'adverbial', text: 'when we found out that Great Barrier Island, just off the coast, had been recently awarded Dark Sky Sanctuary status—a typically remote area that has an “exceptional or distinguished quality of starry nights”' },
      { role: 'subject', text: 'we' },
      { role: 'predicate', text: 'thought' },
      { role: 'object', text: 'it would be the perfect place to relax before our busy schedule' },
    ],
  },
  'M-B02': {
    translation: '它是世界上第一个获此称号的岛屿，也是全球仅有的第四个获此称号的地点。',
    vocabulary: [
      { term: 'the first ... to do', explanation: '第一个做……的……' },
      { term: 'location', explanation: '地点；地区' },
      { term: 'achieve this status', explanation: '获得这一称号或地位' },
    ],
    structure: {
      pattern: '主语 + 系动词 + 并列表语（SVC）',
      explanation: 'It 是主语，’s 是 is 的缩写；the first island 与 only the fourth location 是并列表语，to achieve this status 同时修饰这两个名词。',
    },
    highlights: [
      { role: 'subject', text: 'It' },
      { role: 'predicate', text: '’s' },
      { role: 'complement', text: 'the first island and only the fourth location in the world to achieve this status' },
    ],
  },
  'M-C01': {
    translation: '带着两个晕机的孩子飞行了二十八小时之后，当我们看到那架要载着我们飞越豪拉基湾九十公里、前往大屏障岛的小型双引擎十座飞机时，心一下子沉了下来。',
    vocabulary: [
      { term: 'travel-sick', explanation: '因旅行而晕车或晕机的' },
      { term: 'one’s heart sinks', explanation: '心一沉；感到失望或担忧' },
      { term: 'twin engine 10-seater', explanation: '双引擎十座飞机' },
    ],
    structure: {
      pattern: '状语 + 主语 + 谓语 + 状语（SV）',
      explanation: 'After 短语交代背景，our hearts sank 是主句。when 引导时间状语从句；从句中的 that 定语从句修饰 10-seater。',
    },
    highlights: [
      { role: 'adverbial', text: 'After a 28-hour flight with two travel-sick children' },
      { role: 'subject', text: 'our hearts' },
      { role: 'predicate', text: 'sank' },
      { role: 'adverbial', text: 'when we saw the tiny twin engine 10-seater that was to take us the 90 km across the Hauraki Gulf to Great Barrier Island' },
    ],
  },
  'M-C02': {
    translation: '但事实证明，我们原本不必担心。',
    vocabulary: [
      { term: 'needn’t have done', explanation: '本来不必做却做了；事后看没有必要' },
      { term: 'worry', explanation: '担心；忧虑' },
      { term: 'But', explanation: '但是；表示与前文转折' },
    ],
    structure: {
      pattern: '主语 + 谓语（SV）',
      explanation: 'But 连接上下文，不属于句子主干。we 是主语，needn’t have worried 是带情态动词的完成式谓语，表达事后发现担心是多余的。',
    },
    highlights: [
      { role: 'subject', text: 'we' },
      { role: 'predicate', text: 'needn’t have worried' },
    ],
  },
  ...cet4Set1MatchingCloseReadings,
  ...cet4Set1PassageOneCloseReadings,
  ...cet4Set1PassageTwoCloseReadings,
} satisfies Record<string, CloseReading>;

export const cet4Reading202606Set1 = {
  cloze: {
    title: 'Living standards during the Industrial Revolution',
    sentences: [
      'One of the biggest controversies over the Industrial Revolution is how it affected the working class.',
      'The oldest debates were over whether the standards of living rose or fell.',
      'Those that believed they fell claimed that the capitalists squeezed every ounce of surplus they could from the working class.',
      'Those that believed the standards of living rose claimed that the environment was consumer-friendly, with more and more goods available to the working class every year.',
      'Today’s historians agree that overall, the standards of living increased.',
      'They do not agree, however, on when this improvement occurred.',
      'In an effort to solve this controversy, historians have attempted to define exactly what “standard of living” means.',
      'They all seem to agree that it should mean happiness, but happiness is impossible to measure.',
      'Instead, historians typically use “real income” as the measure for the standards of living.',
      'Real income is money earned and then adjusted according to the cost of living.',
      'However, it does not take into account unemployment, pollution, health, life expectancy, or free time.',
      'After exhausting debate and analysis of the average income, historians have agreed to disagree on whether there was rapid or slow economic growth during the Industrial Revolution.',
      'Instead, they have decided to interpret how the Industrial Revolution was affected by other events.',
      'They have determined that the Industrial Revolution had an overall positive effect, but it quite possibly was neutralized by negative events such as wars, high taxes, and rapid population growth.',
    ],
  },
  matching: {
    title: 'The Star Quality of New Zealand’s Great Barrier Island',
    paragraphs: [
      {
        label: 'A',
        sentences: [
          'I was glad I had such terrible jetlag.',
          'Wide awake at 3:30 am with our nine-year-old daughter on our lodge balcony, I stared for hours at the most incredible night sky I’ve ever seen before the dawn slowly started to rub out the stars on the horizon and the multiple shooting stars faded away.',
        ],
      },
      {
        label: 'B',
        sentences: [
          'We were going to my wife’s big family reunion in Auckland, New Zealand, but when we found out that Great Barrier Island, just off the coast, had been recently awarded Dark Sky Sanctuary status—a typically remote area that has an “exceptional or distinguished quality of starry nights”—we thought it would be the perfect place to relax before our busy schedule.',
          'It’s the first island and only the fourth location in the world to achieve this status.',
        ],
      },
      {
        label: 'C',
        sentences: [
          'After a 28-hour flight with two travel-sick children, our hearts sank when we saw the tiny twin engine 10-seater that was to take us the 90 km across the Hauraki Gulf to Great Barrier Island.',
          'But we needn’t have worried.',
          'Whether it was the gravity force of the plane climbing or the noise of the engine, it put our three-year-old daughter instantly to sleep until we bumped down on the grass at Claris Airport.',
          'Our first empty sick bag against all the odds...',
          'Things were looking up.',
        ],
      },
      {
        label: 'D',
        sentences: [
          'Great Barrier Island has no public facilities and the 950 people living there (though only about half permanently) rely on solar and wind energy, and bottled gas for cooking.',
          'There are no streetlights.',
          'There are no cash machines or banks.',
          'The police force comprises a husband and wife, and there’s one postman.',
          'It’s not just the lack of light but the lack of noise that’s so delightful on this unique and gorgeous scene.',
          'It was first discovered by East Polynesians about 700 years ago and the Maori name for the island is Aotea.',
          'Captain Cook gave the island its European name, because it acts as a barrier between the Pacific and the Hauraki Gulf.',
        ],
      },
      {
        label: 'E',
        sentences: [
          'The climate here is subtropical like Auckland’s.',
          'The island boasts a beautiful wilderness with dense forests, glorious, unspoilt sandy beaches and plenty of bays and a few mountainous areas where there are good walking tracks among the wetlands and valleys.',
          'You can birdwatch, dive, surf and boat.',
          'The best beaches are on the eastern side of the island where the surf is better, too.',
          'The sheltered western side is where you’ll find the best diving and boating.',
          'Lots of people come here for the fantastic fishing spots around the island.',
          'Like a lot of spots in New Zealand, there are whale-watching trips and you might just catch sight of sharks.',
        ],
      },
      {
        label: 'F',
        sentences: [
          'It’s rare to find an island that really does feel undiscovered—but this is it.',
          'When one of my wife’s relations, who comes here regularly, found out that we’d been there, he whispered to us, only half-joking: “Shh—don’t tell anyone!”',
          'The locals are a relaxed and friendly bunch—a lot of them told us that it’s like what Waiheke Island (now in effect a suburb of Auckland) was in the 1970s when it was a commune of artists and people wanting to escape the city.',
        ],
      },
      {
        label: 'G',
        sentences: [
          'Our guide for some of our stay was the inestimable Hilde Hoven, a Dark Sky ambassador who runs Good Heavens with Deborah Kilgallon and Orla Cumisky.',
          'They bring their Dobsonian telescope and beanbags (it’s hard work staring up wide-eyed in wonder without neck support) and, our elder daughter was glad to hear, hot chocolate to wherever you are on the island.',
          '“It’s odd but when the light readings were done,” said Hilde, explaining how the island was awarded its special status, “they found there was more light pollution on the northern side coming from Fiji, which is about 3,000 km away, than Auckland to the south. It’s pretty dark!”',
        ],
      },
      {
        label: 'H',
        sentences: [
          'Beginning their astronomical PowerPoint demonstration using a green laser pointer, Hilde and Orla showed us the Messier 4 spherical cluster with white dwarf stars, Saturn and its rings, the Southern Cross and the Milky Way, which stretched across the sky.',
          'Our daughter was especially taken with Hilde’s narrating of the Maori myth of Maui’s fish hook to explain the shape of Scorpius.',
          'In the fable, Maui hauled the North Island of New Zealand from the bottom of the ocean with his hook.',
        ],
      },
      {
        label: 'I',
        sentences: [
          'We stayed at Mount St Paul’s Estate, a luxurious lodge run by the friendly Chris and Teara, both from Canada.',
          'Teara used to be a chef at the Langham in Auckland and so dinner, eaten around a huge circular table (made of one of the most ancient trees in the world), was every bit as mouth-watering as you’d expect.',
          'Eating pancakes on the balcony overlooking the unspoilt white sandy beach was a great way to start the day.',
        ],
      },
      {
        label: 'J',
        sentences: [
          'Another highlight was an hour-long walk to Kaitoke hot pools in the centre of the island, through wetlands and a forest, where we whiled away a good hour sitting in the pools shaded from the heat by layers of delicate umbrella-like plants.',
        ],
      },
      {
        label: 'K',
        sentences: [
          'We also loved visiting the potter Sarah Harrison, who showed us round her studio at Shoal Bay harbour, and her many pots and jugs, plates and bowls and colourful mosaics.',
          'In her work, she also uses a lot of materials found on the beach.',
          'Our elder daughter loved the gorgeous hidden pool at Medlands beach where the water is separated from the sea in a private rock pool.',
          'Other high points were the ancient pohutukawa trees and the incredible views of Okiwi Basin and Whangapoua beach from the top of Windy Canyon, just a 10-minute hike through a narrow valley up some steep wooden steps on the eastern side of the island.',
        ],
      },
      {
        label: 'L',
        sentences: [
          'Apparently the island council turned down famous musician Paul McCartney’s application to buy a property at Great Barrier Island because of the unwelcome attention he would have brought.',
          'You can see why he wanted to come here; equally, the island knows exactly what kind of star watching it prefers.',
        ],
      },
    ],
  },
  passages: [
    {
      title: 'Passage One · Is organic food worth the higher price?',
      sentences: [
        'Is organic food worth the higher price?',
        'It’s the classic grocery store dilemma.',
        'On the one hand, your family dinner table deserves only the best.',
        'On the other hand, your wallet can only stretch so far.',
        'Whether or not to buy organic is a personal decision, said Mike von Massow, professor of Food Agriculture.',
        'Science won’t give a clear-cut answer to the question of whether organic food is “better.”',
        'There are often trade-offs and answers become less definitive depending on the product under consideration.',
        'One thing is definitive: Organic and conventionally grown food are equally nutritious.',
        'From a nutrition point of view, there is no difference between organic and traditionally grown products.',
        'Organic products don’t necessarily have fewer pesticides—in fact, they may have more.',
        'There is also no big difference between organic and non-organic products from a food-safety perspective.',
        'Even organic growers use pesticides.',
        'Testing shows little if any pesticide remains on conventionally grown products.',
        'In fact, organic farmers often use larger quantities of pesticide because they can only use the natural variety of insect-killers.',
        'Chemical pesticides generally kill a much wider range of pests than any single natural pesticide.',
        'The use of animal waste in organic agriculture can also be a factor in the spread of bacteria like E. coli and salmonella.',
        'Over the past 10 years, Canada has seen more food-safety recalls for organic products, proportionally, than for conventional products.',
        'On the whole, organic agriculture may have a smaller environmental footprint.',
        'That’s mostly because the risk of groundwater contamination from organic farming is lower.',
        'Organic farmers never used neonics, the controversial pesticides that have been linked to shrinking bee populations worldwide.',
        'Traditional agriculture has been making “dramatic improvements” to reduce its impact on the environment.',
        'It isn’t a black-and-white picture, though.',
        'Organic farming is much less efficient when it comes to land use, although yields vary considerably depending on the crop.',
        'On the other hand, advocates of organic farming argue yields and efficiency could be significantly improved if the food industry devoted as much research and money to organic farming as it does conventional agriculture.',
      ],
      questions: [
        {
          number: 46,
          prompt: 'What is the classic grocery store dilemma?',
          closeReading: cet4Set1QuestionCloseReadings[46],
          answer: 'D',
          evidence: 'On the one hand, your family dinner table deserves only the best. On the other hand, your wallet can only stretch so far.',
          analysis: '题干中的 “classic grocery store dilemma” 直接对应首段的 on the one hand / on the other hand 对照：消费者想给家人最好的食物，但预算有限。D 同时保留了这两个相互冲突的方面。',
          options: [
            {
              key: 'A',
              text: 'Whether or not one should eat organic food.',
              explanation: '错误。文章讨论的是要不要“购买”价格更高的有机食品，而不是要不要“吃”有机食品；该选项也遗漏了品质诉求与预算之间的矛盾。',
            },
            {
              key: 'B',
              text: 'Whether or not one can stretch their wallet far.',
              explanation: '错误。wallet can only stretch so far 只是两难中的预算一面，选项没有体现消费者同时又想给家人最好食物的另一面。',
            },
            {
              key: 'C',
              text: 'Organic food costs more but it certainly tastes better.',
              explanation: '错误。原文提到有机食品价格更高，却没有说它味道一定更好；certainly tastes better 是无依据的绝对化表述。',
            },
            {
              key: 'D',
              text: 'One wants the best food but their budget is limited.',
              explanation: '正确。the best food 对应 “deserves only the best”，budget is limited 对应 “wallet can only stretch so far”，完整概括了首段的两难。',
            },
          ],
        },
        {
          number: 47,
          prompt: 'What do we learn about organic food from science?',
          closeReading: cet4Set1QuestionCloseReadings[47],
          answer: 'A',
          evidence: 'Science won’t give a clear-cut answer to the question of whether organic food is “better.”',
          analysis: 'clear-cut answer 表示明确无疑的答案；won’t give a clear-cut answer 即科学尚不能断定有机食品是否更好。A 用 remains uncertain 准确改写这一点。',
          options: [
            {
              key: 'A',
              text: 'Whether it is any better remains uncertain.',
              explanation: '正确。remains uncertain 与 “won’t give a clear-cut answer” 同义，且 any better 对应原文带引号的 “better”。',
            },
            {
              key: 'B',
              text: 'Whether it is healthier is under consideration.',
              explanation: '错误。原文讨论的是综合意义上的 “better”，并非只讨论是否更健康；under consideration 也不是原文所说的结论不确定。',
            },
            {
              key: 'C',
              text: 'Whether it is more nutritious than conventional food is arguable.',
              explanation: '错误。下文明确说有机食品与传统种植食品 “equally nutritious”，营养价值相同，并不存在是否更有营养的争议。',
            },
            {
              key: 'D',
              text: 'Whether it is going to replace conventional food is still unclear.',
              explanation: '错误。文章没有讨论有机食品会不会取代传统食品，replace conventional food 属于原文未提及的信息。',
            },
          ],
        },
        {
          number: 48,
          prompt: 'What does the passage say about organic and non-organic products as far as food safety is concerned?',
          closeReading: cet4Set1QuestionCloseReadings[48],
          answer: 'D',
          evidence: 'There is also no big difference between organic and non-organic products from a food-safety perspective.',
          analysis: '题干中的 as far as food safety is concerned 与原文 from a food-safety perspective 完全对应；no big difference 被 D 的 no substantial difference 同义替换。',
          options: [
            {
              key: 'A',
              text: 'Their difference is the conventions used to test them.',
              explanation: '错误。原文只说检测显示传统种植产品几乎没有农药残留，没有说两类产品采用不同的检测惯例；conventions used to test them 是无中生有。',
            },
            {
              key: 'B',
              text: 'They differ in how much pesticide remains on them.',
              explanation: '错误。文中没有给出两类产品农药残留量的稳定对比，反而明确总结二者在食品安全方面没有明显差别。',
            },
            {
              key: 'C',
              text: 'One relies on pesticides whereas the other does not.',
              explanation: '错误。原文明确说 “Even organic growers use pesticides”，有机种植者同样使用杀虫剂，因此不是一方使用而另一方不用。',
            },
            {
              key: 'D',
              text: 'There is no substantial difference between the two.',
              explanation: '正确。no substantial difference 是 no big difference 的准确同义改写，完整对应文章对食品安全的总体判断。',
            },
          ],
        },
        {
          number: 49,
          prompt: 'What does the author say about organic farming?',
          closeReading: cet4Set1QuestionCloseReadings[49],
          answer: 'C',
          evidence: 'On the whole, organic agriculture may have a smaller environmental footprint.',
          analysis: 'smaller environmental footprint 表示对环境造成的总体影响可能更小。C 将其改写为 may impact the environment less，语气中的 may 也与原文一致。',
          options: [
            {
              key: 'A',
              text: 'It may be blamed for the shrinking bee populations in the world.',
              explanation: '错误。原文说导致蜜蜂数量下降的 neonics 从未被有机农户使用，因此不能把这一问题归咎于有机农业。',
            },
            {
              key: 'B',
              text: 'It minimizes the use of controversial pesticides in its operations.',
              explanation: '错误。文章只明确指出有机农户从不使用 neonics 这一类有争议的杀虫剂，并未概括为把所有有争议杀虫剂的用量降至最低。',
            },
            {
              key: 'C',
              text: 'It may impact the environment less than conventional farming.',
              explanation: '正确。impact the environment less 对应 smaller environmental footprint；比较对象由上下文可知是 conventional farming。',
            },
            {
              key: 'D',
              text: 'It contaminates groundwater as much as conventional farming.',
              explanation: '错误。原文说有机农业造成地下水污染的风险更低，而不是与传统农业一样高。',
            },
          ],
        },
        {
          number: 50,
          prompt: 'What do advocates of organic farming argue about its yields and efficiency?',
          closeReading: cet4Set1QuestionCloseReadings[50],
          answer: 'B',
          evidence: 'Advocates of organic farming argue yields and efficiency could be significantly improved if the food industry devoted as much research and money to organic farming as it does conventional agriculture.',
          analysis: '条件句说明，只要食品行业投入与传统农业同等多的研究和资金，有机农业的产量和效率就能显著提高。B 中 more research and investment 与 research and money 对应。',
          options: [
            {
              key: 'A',
              text: 'They would increase quickly with the emergence of new technologies.',
              explanation: '错误。原文提出的条件是增加研究和资金投入，没有提到新技术的出现，也没有使用 quickly 这一速度判断。',
            },
            {
              key: 'B',
              text: 'They would improve remarkably with more research and investment.',
              explanation: '正确。improve remarkably 对应 significantly improved，more research and investment 对应投入更多 research and money。',
            },
            {
              key: 'C',
              text: 'They would be achieved along with enormous health benefits.',
              explanation: '错误。文章没有把产量和效率的提高与巨大的健康益处联系起来；前文反而说明两类食品营养价值相同。',
            },
            {
              key: 'D',
              text: 'They would considerably lower the cost to the environment.',
              explanation: '错误。题目问产量和效率如何改善，原文的条件是研究和资金投入；该选项把结果偷换成降低环境代价。',
            },
          ],
        },
      ],
    },
    {
      title: 'Passage Two · Are humans generous or selfish?',
      sentences: [
        'It is still controversial whether we are fundamentally generous or selfish and whether these tendencies are shaped by our genes or environment.',
        'Some evidence points to humans being born cooperative.',
        'At later stages in life we routinely work together to reach goals and help out in times of need.',
        'Yet instances of selfish behavior are also plenty.',
        'One recent study tested people’s willingness to set aside selfish interests to reach a greater good.',
        'It found that being selfish was more advantageous than cooperating.',
        'The benefit may be short-lived, however.',
        'Another study showed that players who cooperated did better in the long run.',
        'It seems that human nature supports both pro-social and selfish traits.',
        'Genetic studies have made some progress toward identifying their biological roots.',
        'By comparing identical twins, who share nearly 100 percent of their genes, and non-identical twins, who share about half, researchers have found overwhelming evidence for genetic effects on behaviors.',
        'In these twin studies, identical and non-identical twins are asked, for example, to split a sum of money with a peer.',
        'Such studies often also rely on careful psychological assessments and DNA analysis.',
        'Other work highlights specific genes as key players.',
        'My colleagues and I recently identified a gene linked to altruistic behavior and found that a particular variant of it was associated with more selfish behavior in preschoolers.',
        'According to evolutionary scientists, cooperative behavior may have evolved first among relatives to promote the continuation of their genetic line.',
        'As communities diversified, mutual support could have broadened to include individuals not linked by blood.',
        'Another possibility is that humans cooperate to gain some advantage, such as boosting reputation.',
        'Finally, evolutionary processes take place at the group level.',
        'Groups of highly cooperative individuals have higher chances of survival because they can work together to reach goals that are unattainable to less cooperative groups.',
        'Yet almost no behavior is entirely genetic, even among identical twins.',
        'Culture, schooling and parenting are important determinants of cooperation.',
        'Thus, the degree to which we act cooperatively or selfishly is unique to each individual and depends on a variety of genetic and environmental influences.',
      ],
      questions: [
        {
          number: 51,
          prompt: 'What is the finding of one recent study about being selfish?',
          closeReading: cet4Set1QuestionCloseReadings[51],
          answer: 'A',
          evidence: 'It found that being selfish was more advantageous than cooperating. The benefit may be short-lived, however.',
          analysis: '研究发现自私比合作更有利，但紧接着用 however 限定这种 benefit 可能很短暂。因此应同时保留“有一定好处”和“只在短期内”两层信息。',
          options: [
            {
              key: 'A',
              text: 'It may bring certain benefits in the short term.',
              explanation: '正确。certain benefits 对应 more advantageous，in the short term 对应 the benefit may be short-lived，是对两句话的合并概括。',
            },
            {
              key: 'B',
              text: 'It usually yields more disadvantages than advantages.',
              explanation: '错误。原文说研究中自私比合作更有利，并没有说其弊大于利；该选项把 advantageous 的方向完全颠倒。',
            },
            {
              key: 'C',
              text: 'It serves individual interest rather than a collective’s.',
              explanation: '错误。这是对“自私”概念的一般描述，不是该研究报告的具体发现；研究发现强调的是它短期内更有利。',
            },
            {
              key: 'D',
              text: 'It may give way to cooperating in the long run.',
              explanation: '错误。另一项研究发现合作者长期表现更好，但原文没有说自私行为会逐渐“让位于”合作，give way to 添加了不存在的变化过程。',
            },
          ],
        },
        {
          number: 52,
          prompt: 'What have researchers found by studying identical and non-identical twins?',
          closeReading: cet4Set1QuestionCloseReadings[52],
          answer: 'B',
          evidence: 'Researchers have found overwhelming evidence for genetic effects on behaviors.',
          analysis: '双胞胎研究通过比较基因共享程度不同的两组人，发现了基因影响行为的强有力证据。B 的 genetic traits determine behavior 是四个选项中对这一结论的对应表达。',
          options: [
            {
              key: 'A',
              text: 'They are overwhelmingly different in the amounts of genes.',
              explanation: '错误。overwhelming 修饰的是 evidence，而不是两类双胞胎的基因数量差异；原文说的是基因共享比例约为 100% 和一半。',
            },
            {
              key: 'B',
              text: 'One’s behavior is largely determined by their genetic traits.',
              explanation: '正确。该选项概括了 “overwhelming evidence for genetic effects on behaviors”。这里 largely 表示基因作用显著，并不等于排除后文所说的环境影响。',
            },
            {
              key: 'C',
              text: 'One’s biological roots can be identified by their genes.',
              explanation: '错误。原文是借双胞胎研究寻找亲社会与自私特征的生物根源，不是通过基因“识别一个人的生物根源”；表述对象被偷换。',
            },
            {
              key: 'D',
              text: 'They differ from each other in their behavior patterns.',
              explanation: '错误。文章没有把研究结论概括为两类双胞胎的行为模式不同，重点是比较结果证明基因会影响行为。',
            },
          ],
        },
        {
          number: 53,
          prompt: 'What did the author and colleagues identify in their recent research?',
          closeReading: cet4Set1QuestionCloseReadings[53],
          answer: 'C',
          evidence: 'My colleagues and I recently identified a gene linked to altruistic behavior and found that a particular variant of it was associated with more selfish behavior in preschoolers.',
          analysis: '题干中的 identified 可直接回原文定位。其宾语是 a gene linked to altruistic behavior；后半句关于某个变体与自私行为相关，是对这个基因的进一步发现。',
          options: [
            {
              key: 'A',
              text: 'A gene-related selfish behavior in preschool children.',
              explanation: '错误。研究人员识别出的是一个基因，不是一种“与基因有关的自私行为”；幼儿的自私行为只是与该基因的特定变体相关。',
            },
            {
              key: 'B',
              text: 'Key factors that determine one’s altruistic behavior.',
              explanation: '错误。原文只识别出一个与利他行为相关的基因，没有找出决定利他行为的多个关键因素，determine 也把相关性夸成了决定关系。',
            },
            {
              key: 'C',
              text: 'A specific gene associated with altruistic behavior.',
              explanation: '正确。a specific gene associated with altruistic behavior 准确对应 a gene linked to altruistic behavior。',
            },
            {
              key: 'D',
              text: 'Roles played by genes in shaping one’s character.',
              explanation: '错误。这是过于宽泛的概括；该项研究的明确识别对象是一个与利他行为相关的具体基因，而不是基因塑造性格的各种作用。',
            },
          ],
        },
        {
          number: 54,
          prompt: 'What do we learn from evolutionary scientists about cooperative behavior?',
          closeReading: cet4Set1QuestionCloseReadings[54],
          answer: 'A',
          evidence: 'Cooperative behavior may have evolved first among relatives to promote the continuation of their genetic line.',
          analysis: 'evolved first among relatives 表明合作行为最初可能出现在亲属之间；relatives 与 linked by blood 构成同义替换，因此 A 正确。',
          options: [
            {
              key: 'A',
              text: 'It may have initially originated in individuals linked by blood.',
              explanation: '正确。initially originated 对应 evolved first，individuals linked by blood 对应 relatives，语气 may 也与原文一致。',
            },
            {
              key: 'B',
              text: 'It may have caused the diversification of communities.',
              explanation: '错误。原文说随着群体变得多样化，互助范围可能扩大；并没有说合作行为导致了群体多样化，因果关系被倒置。',
            },
            {
              key: 'C',
              text: 'It helps to build relationships among blood-related people.',
              explanation: '错误。原文说亲属间的合作有助于延续其遗传谱系，不是说它用于建立亲属关系；亲属关系本来就已经存在。',
            },
            {
              key: 'D',
              text: 'It guarantees the achievement of goals otherwise unattainable.',
              explanation: '错误。文章只说高合作群体可以共同完成低合作群体难以实现的目标，并提高生存机会；guarantees 是原文没有的绝对化说法。',
            },
          ],
        },
        {
          number: 55,
          prompt: 'What can we infer from the last paragraph?',
          closeReading: cet4Set1QuestionCloseReadings[55],
          answer: 'D',
          evidence: 'Culture, schooling and parenting are important determinants of cooperation.',
          analysis: '末段强调合作并非完全由基因决定，文化、学校教育和家庭教养都会影响它。既然后天环境能够塑造合作程度，就可以推断合作行为能够被培养。',
          options: [
            {
              key: 'A',
              text: 'Cooperative behavior is evident among identical twins.',
              explanation: '错误。末段提到同卵双胞胎只是为了说明即使基因相同，行为也不完全由基因决定，并没有说合作行为在同卵双胞胎中尤其明显。',
            },
            {
              key: 'B',
              text: 'One is born either cooperative or non-cooperative.',
              explanation: '错误。文章明确指出行为几乎都不是完全由遗传决定，合作程度还受文化、学校和家庭教育影响，因此不是出生时就非此即彼地固定。',
            },
            {
              key: 'C',
              text: 'Genes determine one’s tendency to cooperate.',
              explanation: '错误。基因会产生影响，但末段特意否定 entirely genetic，并列出多种环境因素；determine 把多因素影响误写成基因单独决定。',
            },
            {
              key: 'D',
              text: 'Cooperative behavior may be cultivated.',
              explanation: '正确。文化、学校教育和家庭教养都是可施加的后天影响，因此可以合理推断合作行为能够通过环境和教育加以培养。',
            },
          ],
        },
      ],
    },
  ],
} as const;
