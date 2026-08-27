import type { CloseReading } from '../../types/closeReading';
import { createCloseReading as cr } from './createCloseReading';

export const cet4Set1QuestionCloseReadings = {
  46: cr(
    '杂货店购物时常见的两难选择是什么？',
    [['classic dilemma', '典型的两难选择'], ['grocery store', '杂货店；食品杂货店'], ['dilemma', '进退两难的处境']],
    '疑问词作表语 + 系动词 + 主语（倒装 SVC）',
    'What 询问两难选择的具体内容，在句中作表语。特殊疑问句把系动词 is 移到主语 the classic grocery store dilemma 前；还原为陈述语序是 The classic grocery store dilemma is what。',
    [['complement', 'What'], ['predicate', 'is'], ['subject', 'the classic grocery store dilemma']],
  ),
  47: cr(
    '关于有机食品，我们从科学研究中了解到什么？',
    [['learn about', '了解；得知有关……的情况'], ['organic food', '有机食品'], ['from science', '从科学研究中；依据科学']],
    '疑问词作宾语 + 助动词 + 主语 + 谓语（SVO）',
    'What 是 learn about 的内容，在句中作宾语并被提前。do 是构成疑问句的助动词，真正表达动作的是 learn；about organic food 限定了解的主题，from science 说明信息来源。',
    [['object', 'What'], ['predicate', 'do'], ['subject', 'we'], ['predicate', 'learn'], ['complement', 'about organic food'], ['adverbial', 'from science']],
  ),
  48: cr(
    '就食品安全而言，文章如何评价有机产品和非有机产品？',
    [['organic and non-organic products', '有机产品和非有机产品'], ['as far as ... is concerned', '就……而言'], ['food safety', '食品安全']],
    '疑问词作宾语 + 助动词 + 主语 + 谓语 + 状语（SVO）',
    'What 是 say 的内容，提前到句首构成特殊疑问句；does 是助动词，the passage 是主语，say 是实义谓语。about... 交代评价对象，as far as...is concerned 把问题范围限定在食品安全方面。',
    [['object', 'What'], ['predicate', 'does'], ['subject', 'the passage'], ['predicate', 'say'], ['complement', 'about organic and non-organic products'], ['adverbial', 'as far as food safety is concerned']],
  ),
  49: cr(
    '关于有机农业，作者说了什么？',
    [['author', '作者'], ['organic farming', '有机农业；有机耕作'], ['say about', '谈到；评价']],
    '疑问词作宾语 + 助动词 + 主语 + 谓语（SVO）',
    'What 作 say 的宾语并被提前；does 帮助构成一般现在时疑问句，the author 是主语，say 是实义谓语。about organic farming 限定作者谈论的主题。',
    [['object', 'What'], ['predicate', 'does'], ['subject', 'the author'], ['predicate', 'say'], ['complement', 'about organic farming']],
  ),
  50: cr(
    '有机农业的支持者对其产量和效率提出了什么看法？',
    [['advocate of', '……的支持者；倡导者'], ['yield', '产量；收益'], ['efficiency', '效率'], ['argue about', '就……提出观点；主张']],
    '疑问词作宾语 + 助动词 + 主语 + 谓语（SVO）',
    'What 询问 advocates 所主张的具体内容，作 argue 的宾语并提前。do 是助动词，advocates of organic farming 是主语；about its yields and efficiency 指明观点所针对的两个方面。',
    [['object', 'What'], ['predicate', 'do'], ['subject', 'advocates of organic farming'], ['predicate', 'argue'], ['complement', 'about its yields and efficiency']],
  ),
  51: cr(
    '一项近期研究对自私行为得出了什么发现？',
    [['finding', '研究发现；调查结果'], ['recent study', '近期研究'], ['being selfish', '表现得自私；自私行为']],
    '疑问词作表语 + 系动词 + 主语（倒装 SVC）',
    'What 询问研究发现的具体内容，在句中作表语；is 被移到主语前构成特殊疑问句。of one recent study 修饰 finding，about being selfish 进一步限定该研究发现的主题。',
    [['complement', 'What'], ['predicate', 'is'], ['subject', 'the finding of one recent study about being selfish']],
  ),
  52: cr(
    '研究人员通过研究同卵双胞胎和异卵双胞胎发现了什么？',
    [['identical twin', '同卵双胞胎'], ['non-identical twin', '异卵双胞胎'], ['by doing', '通过做……；表示方式']],
    '疑问词作宾语 + 助动词 + 主语 + 过去分词（现在完成时）',
    'What 作 found 的宾语并提前。have 与过去分词 found 构成现在完成时，表示研究已经得出、且与当前讨论相关的结果；by studying... 是方式状语，说明得出结果所采用的方法。',
    [['object', 'What'], ['predicate', 'have'], ['subject', 'researchers'], ['predicate', 'found'], ['adverbial', 'by studying identical and non-identical twins']],
  ),
  53: cr(
    '作者及其同事在近期研究中识别出了什么？',
    [['colleague', '同事；同僚'], ['identify', '识别；确认'], ['recent research', '近期研究']],
    '疑问词作宾语 + 助动词 + 主语 + 谓语（SVO）',
    'What 是 identify 的宾语并提前。did 表明问题询问过去发生的研究，author and colleagues 是并列主语；使用 did 后，实义动词保持原形 identify，in... 说明研究情境。',
    [['object', 'What'], ['predicate', 'did'], ['subject', 'the author and colleagues'], ['predicate', 'identify'], ['adverbial', 'in their recent research']],
  ),
  54: cr(
    '关于合作行为，我们从进化科学家的观点中了解到什么？',
    [['evolutionary scientist', '进化科学家'], ['cooperative behavior', '合作行为'], ['learn from', '从……中得知；向……学习']],
    '疑问词作宾语 + 助动词 + 主语 + 谓语（SVO）',
    'What 作 learn 的宾语并提前；do 是构成疑问句的助动词，we 是主语，learn 是实义谓语。from evolutionary scientists 说明观点来源，about cooperative behavior 限定讨论主题。',
    [['object', 'What'], ['predicate', 'do'], ['subject', 'we'], ['predicate', 'learn'], ['adverbial', 'from evolutionary scientists'], ['complement', 'about cooperative behavior']],
  ),
  55: cr(
    '从最后一段可以推断出什么？',
    [['infer from', '从……推断'], ['last paragraph', '最后一段'], ['infer', '推断；推论']],
    '疑问词作宾语 + 情态动词 + 主语 + 谓语（SVO）',
    'What 作 infer 的宾语并被提前。can 是情态动词，表示题目要求判断能够合理推出的结论；we 是主语，infer 是谓语，from the last paragraph 指明推断依据。',
    [['object', 'What'], ['predicate', 'can'], ['subject', 'we'], ['predicate', 'infer'], ['adverbial', 'from the last paragraph']],
  ),
} satisfies Record<number, CloseReading>;
