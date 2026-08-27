import type { CloseReading } from '../../types/closeReading';
import { createCloseReading as cr } from './createCloseReading';

export const cet4Set2ClozeCloseReadings = {
  C01: cr(
    '这听起来或许令人意外，但一项新研究发现，对咖啡苦味特别敏感的人实际上喝得更多。',
    [['be supersensitive to', '对……极其敏感'], ['bitter taste', '苦味'], ['drink more of', '喝更多的……']],
    '主系表 + but + 主谓宾 + 插入的报告分句',
    'It may sound surprising 是 SVC 结构；but 后说明研究发现，who 定语从句修饰 people；句末 a new study finds 是补充信息来源的报告分句。',
    [['subject', 'It'], ['predicate', 'may sound'], ['complement', 'surprising'], ['subject', 'people who are supersensitive to coffee’s bitter taste'], ['adverbial', 'actually'], ['predicate', 'drink'], ['object', 'more of it'], ['subject', 'a new study'], ['predicate', 'finds']],
  ),
  C02: cr(
    '研究人员表示，这种敏感性也不单纯是口味问题，而是受到个人遗传构成的影响。',
    [['a matter of', '……的问题；关乎……的事情'], ['be influenced by', '受到……影响'], ['genetic makeup', '遗传构成；基因组成']],
    '主系表 + but + 被动谓语 + 报告分句',
    'This sensitivity 是两个并列谓语共同的主语；isn’t...but rather... 构成“不是……而是……”；末尾 researchers said 说明消息来源。',
    [['subject', 'This sensitivity'], ['predicate', 'isn’t'], ['complement', 'simply a matter of taste, either'], ['predicate', 'is influenced'], ['adverbial', 'by a person’s genetic makeup'], ['subject', 'the researchers'], ['predicate', 'said'], ['adverbial', 'in the study']],
  ),
  C03: cr(
    '该研究的资深研究员玛丽莲·科内利斯说：“你原本会以为，对咖啡因苦味特别敏感的人会喝更少的咖啡。”',
    [['expect that', '预料；原以为……'], ['be sensitive to', '对……敏感'], ['caffeine', '咖啡因']],
    '直接引语中的主谓宾 + 倒装报告分句',
    '引语主干是 You’d expect，that 从句作宾语；从句中 who 定语从句修饰 people。said 位于主语之前，是直接引语后常见的倒装。',
    [['subject', 'You'], ['predicate', '’d expect'], ['object', 'that people who are particularly sensitive to the bitter taste of caffeine would drink less coffee'], ['predicate', 'said'], ['subject', 'study senior researcher Marilyn Cornelis']],
  ),
  C04: cr(
    '“我们研究得出的相反结果表明，咖啡消费者会习得对咖啡苦味的偏好或辨别能力，这是由咖啡因带来的、后天形成的正向强化所致。”',
    [['opposite result', '相反的结果'], ['acquire a taste for', '逐渐喜欢上……'], ['positive reinforcement', '正向强化']],
    '主语 + 谓语 + 宾语从句（SVO）',
    'The opposite results... 是主语，suggest 是谓语；后面省略 that 的长从句作宾语。due to 短语说明这种习得产生的原因。',
    [['subject', 'The opposite results of our study'], ['predicate', 'suggest'], ['object', 'coffee consumers acquire a taste for or an ability to detect the bitterness of caffeine'], ['adverbial', 'due to the learned positive reinforcement brought out by caffeine']],
  ),
  C05: cr(
    '换句话说，对咖啡苦味有更强感知能力的人，会学着把“美好的事物与它联系起来”，科内利斯说。',
    [['put another way', '换句话说'], ['heightened ability', '增强的能力'], ['associate ... with ...', '把……与……联系起来']],
    '状语 + 主语 + 谓语 + 宾语 + 报告分句',
    'Put another way 是评注状语；people 是主语，who 定语从句限定这类人；learn 后接不定式作宾语。句末 Cornelis said 为正常语序。',
    [['adverbial', 'Put another way'], ['subject', 'people who have a heightened ability to taste the bitterness of coffee'], ['predicate', 'learn'], ['object', 'to associate “good things with it,”'], ['subject', 'Cornelis'], ['predicate', 'said']],
  ),
  C06: cr(
    '科学家表示，这一发现令人惊讶，因为苦味通常是一种警告机制，会促使人们吐出有害物质。',
    [['given that', '考虑到；鉴于'], ['warning mechanism', '警告机制'], ['spit out', '吐出']],
    '主系表 + 原因状语 + 报告分句',
    'This finding is surprising 是主干；given that 引导原因状语从句，其中不定式 to convince... 说明机制的作用。scientists said 补充观点来源。',
    [['subject', 'This finding'], ['predicate', 'is'], ['complement', 'surprising'], ['adverbial', 'given that bitterness often serves as a warning mechanism to convince people to spit out harmful substances'], ['subject', 'scientists'], ['predicate', 'said']],
  ),
  C07: cr(
    '首席研究员王珏晟表示，研究人员开展这项研究，是为了了解遗传因素如何影响人们对茶、咖啡和酒精的摄入，而这些饮品往往带有苦味。',
    [['conduct a study', '开展研究'], ['consumption of', '对……的消费；摄入'], ['tend to', '往往；倾向于']],
    '主谓宾 + 目的状语 + 倒装报告分句',
    'Researchers conducted the study 是 SVO 主干；to understand... 作目的状语，how 从句作 understand 的宾语；which 定语从句修饰三种饮品。',
    [['subject', 'Researchers'], ['predicate', 'conducted'], ['object', 'the study'], ['adverbial', 'to understand how genetics influences people’s consumption of tea, coffee and alcohol which tend to taste bitter'], ['predicate', 'said'], ['subject', 'lead study researcher Jue Sheng Ong']],
  ),
  C08: cr(
    '王珏晟告诉《生活科学》：“虽然所有苦味看起来可能都一样，但我们会分别感知抱子甘蓝、奎宁和咖啡因的苦味。”',
    [['perceive', '感知；察觉'], ['Brussels sprouts', '抱子甘蓝'], ['separately', '分别地']],
    '让步状语从句 + 主谓宾 + 报告分句',
    'While 引导让步状语从句；主句是 we perceive...，separately 修饰 perceive。引语后的 Ong told Live Science 交代说话者和媒体。',
    [['adverbial', 'While all bitter flavors may seem the same'], ['subject', 'we'], ['predicate', 'perceive'], ['object', 'the bitterness of Brussels sprouts (抱子甘蓝), quinine (奎宁) and caffeine'], ['adverbial', 'separately'], ['subject', 'Ong'], ['predicate', 'told'], ['object', 'Live Science']],
  ),
  C09: cr(
    '“我们觉得这些味道有多苦，在一定程度上是由基因决定的。”',
    [['the degree to which', '……的程度'], ['in part', '在一定程度上'], ['be determined by', '由……决定']],
    '主语 + 被动谓语 + 状语（SV）',
    '主语中心词是 The degree，to which 引导定语从句说明“程度”的具体内容；is determined 是被动谓语，by your genes 指出决定因素。',
    [['subject', 'The degree to which we find these flavors bitter'], ['predicate', 'is'], ['adverbial', 'in part'], ['predicate', 'determined'], ['adverbial', 'by your genes']],
  ),
  C10: cr(
    '具有感知绿色蔬菜苦味基因的人，比起咖啡更可能偏爱茶。',
    [['be more likely to', '更有可能……'], ['prefer A to B', '比起 B 更喜欢 A'], ['green vegetables', '绿色蔬菜']],
    '主语 + 系动词 + 表语 + 不定式补足语（SVC）',
    'People 是主语，with 短语后置修饰 people；are more likely 构成系表结构，to prefer... 说明更可能发生的行为。',
    [['subject', 'People with the genes to taste the bitterness of green vegetables'], ['predicate', 'are'], ['complement', 'more likely'], ['complement', 'to prefer tea to coffee']],
  ),
  C11: cr(
    '此外，对奎宁苦味以及绿色蔬菜中苦味更敏感的人，往往会避开咖啡。',
    [['in addition', '此外'], ['be sensitive to', '对……敏感'], ['tend to avoid', '往往会避开']],
    '状语 + 并列主语 + 谓语 + 宾语（SVO）',
    'In addition 是衔接状语；people 与 those 构成并列主语，两个修饰成分分别说明敏感对象；tended 后接不定式。',
    [['adverbial', 'In addition'], ['subject', 'people who were more sensitive to quinine’s bitter flavors and those found in green vegetables'], ['predicate', 'tended'], ['object', 'to avoid coffee']],
  ),
} satisfies Record<string, CloseReading>;
