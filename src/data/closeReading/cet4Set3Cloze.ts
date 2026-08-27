import type { CloseReading } from '../../types/closeReading';
import { createCloseReading as cr } from './createCloseReading';

export const cet4Set3ClozeCloseReadings = {
  C01: cr(
    '一项新研究表明，尝试少吃薯条或巧克力的垃圾食品爱好者，可能会出现类似戒断毒品时的症状。',
    [['cut back on', '减少；削减'], ['be similar to', '与……相似'], ['drug withdrawal', '药物戒断；戒毒反应']],
    '主语 + 谓语 + 宾语 + 报告分句（SVO）',
    '主干是 Junk-food lovers may experience symptoms。who 定语从句限定“哪些爱好者”，similar to... 后置说明症状的性质；句末 a new study suggests 交代判断来源。',
    [['subject', 'Junk-food lovers who try to cut back on fries or chocolate'], ['predicate', 'may experience'], ['object', 'symptoms'], ['complement', 'similar to drug withdrawal'], ['subject', 'a new study'], ['predicate', 'suggests']],
  ),
  C02: cr(
    '研究发现，尝试减少高度加工食品摄入的人，会出现一些与戒烟或戒毒者相同的生理和心理症状，例如情绪波动、焦虑、头痛和睡眠不佳。',
    [['cut down on', '减少……'], ['highly processed food', '高度加工食品'], ['mood swing', '情绪波动']],
    '主语 + 谓语 + 宾语从句 + 比较结构（SVO）',
    'Researchers found 是主句；that 引导宾语从句。从句主语是 people，attempting... 是现在分词短语修饰 people；the same...as... 把他们的症状与戒烟、戒毒者的症状进行比较。',
    [['subject', 'Researchers'], ['predicate', 'found'], ['object', 'that people attempting to cut down on eating highly processed foods experience some of the same physical and psychological symptoms'], ['adverbial', 'such as mood swings, anxiety, headaches and poor sleep'], ['complement', 'as those quitting smoking cigarettes or using drugs'], ['adverbial', 'according to the study']],
  ),
  C03: cr(
    '该研究的第一作者埃丽卡·舒尔特说，这项新研究首次证明，人们减少高度加工食品时，可能出现类似戒断反应的症状。',
    [['offer evidence', '提供证据；证明'], ['withdrawal-like', '类似戒断反应的'], ['lead study author', '研究第一作者；主要作者']],
    '主语 + 谓语 + 宾语从句 + 报告分句（SVO）',
    'The new study offers the first evidence 是主干；that 从句具体说明证据内容，其中 when 从句交代症状出现的时间。句末采用 said + 人名的倒装报告结构。',
    [['subject', 'The new study'], ['predicate', 'offers'], ['object', 'the first evidence that these withdrawal-like symptoms can occur'], ['adverbial', 'when people cut down on highly processed foods'], ['predicate', 'said'], ['subject', 'lead study author Erica Schulte']],
  ),
  C04: cr(
    '根据参与者自述的症状，在尝试减少垃圾食品摄入后的第二天至第五天，戒断症状明显更强烈；这一时间段与药物戒断期相吻合。',
    [['self-reported', '自我报告的；自述的'], ['significantly more intense', '明显更强烈'], ['live through', '经历；熬过'], ['parallel', '与……相似；与……同步']],
    '状语 + 主系表 + 非限制性定语从句（SVC）',
    'withdrawal symptoms were more intense 是主干；Based on... 说明判断依据，between...days 限定时间。which 引导非限制性定语从句，指代前面的第二至第五天这一时段。',
    [['adverbial', 'Based on the participants’ self-reported symptoms'], ['subject', 'withdrawal symptoms'], ['predicate', 'were'], ['complement', 'significantly more intense'], ['adverbial', 'between the second and fifth days after attempting to reduce junk-food consumption'], ['subject', 'which'], ['predicate', 'parallels'], ['object', 'the time span people live through during drug withdrawal']],
  ),
  C05: cr(
    '舒尔特说，有些人大量食用某种食品后可能会对其上瘾，这一观点颇具争议。',
    [['be addictive', '使人上瘾的'], ['heavy use', '大量使用；此处指大量食用'], ['controversial subject', '有争议的话题']],
    '主语 + 系动词 + 表语 + 报告分句（SVC）',
    '主语中心是 The idea，that 从句说明这一观点的具体内容；is 连接表语 a controversial subject。Schulte said 是补充消息来源的报告分句。',
    [['subject', 'The idea that food may be addictive after “heavy” use by some individuals'], ['predicate', 'is'], ['complement', 'a controversial subject'], ['subject', 'Schulte'], ['predicate', 'said']],
  ),
  C06: cr(
    '她指出，尽管先前针对动物和人类的研究发现，物质使用障碍与对高度加工食品的成瘾式摄入在生物和行为方面存在相似之处，但还没有研究考察减少垃圾食品是否会引发人的戒断症状。',
    [['substance-use disorder', '物质使用障碍'], ['addictive-like consumption', '成瘾式摄入'], ['trigger withdrawal symptoms', '引发戒断症状']],
    '让步状语从句 + 主谓宾 + whether 宾语从句',
    'Although 引导让步从句，先交代已有研究；主句主干是 no studies have looked at...。whether 引导的从句作介词 at 的宾语，表示尚待研究的问题。',
    [['adverbial', 'Although prior studies in animals and humans have shown some biological and behavioral similarities between substance-use disorders and addictive-like consumption of highly processed foods'], ['subject', 'no studies'], ['predicate', 'have looked at'], ['object', 'whether reducing junk food can trigger withdrawal symptoms in people'], ['subject', 'she'], ['predicate', 'noted']],
  ),
  C07: cr(
    '舒尔特指出，让人们提前意识到减少垃圾食品时可能出现烦躁或头痛，有助于他们预先准备好应对策略。',
    [['raise awareness', '提高认识；使人意识到'], ['coping strategy', '应对策略'], ['in advance', '提前；预先']],
    '动名词短语作主语 + 谓语 + 宾语补足语（SVOC）',
    'Raising awareness... 是整个主语，其中 that 从句说明需要了解的内容，when 从句交代症状出现的情境。help 后接 individuals 和不带 to 的 prepare，构成 help somebody do something。',
    [['subject', 'Raising awareness that people may experience irritability (烦躁) or headaches when cutting down on junk food'], ['predicate', 'can help'], ['object', 'individuals'], ['complement', 'prepare coping strategies'], ['adverbial', 'in advance'], ['subject', 'Schulte'], ['predicate', 'noted']],
  ),
  C08: cr(
    '她说，这些发现还可能揭示人们改变饮食习惯时面对的障碍，而这些障碍可能导致人们中途退出治疗。',
    [['shed light on', '阐明；使……更容易理解'], ['play a role in', '在……中起作用'], ['drop out of', '退出；中途放弃']],
    '主语 + 谓语 + 宾语 + 同位说明（SVO）',
    'The findings may shed light on the barriers 是主干；people face... 是省略关系词的定语从句。破折号后重复 barriers 并用 that 从句进一步解释这些障碍的后果。',
    [['subject', 'The findings'], ['predicate', 'may also shed light on'], ['object', 'the barriers people face when changing eating habits'], ['subject', 'barriers that'], ['predicate', 'may play a role in'], ['object', 'people dropping out of treatments'], ['subject', 'she'], ['predicate', 'said']],
  ),
} satisfies Record<string, CloseReading>;
