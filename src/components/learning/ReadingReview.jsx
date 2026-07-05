import { useState, useEffect, useMemo, useCallback } from 'react';

const PHRASE_NOTES = {
  'it is generally accepted that': '人们普遍认为',
  'an assortment of': '各种各样的',
  'ever too late': '是否真的太晚',
  'early mortality': '早亡；过早死亡',
  'exercise consistently': '持续稳定地锻炼',
  'throughout their lives': '贯穿一生',
  'a drop of': '下降幅度为',
  'compared to': '与……相比',
  'in middle age': '在中年时期',
  'incidence of chronic diseases': '慢性病发病率',
  'why bother doing': '为什么还费心做某事',
  'concede that': '承认……',
  'interpret findings to mean': '把研究发现理解为',
  'mental and physical': '心理和身体方面的',
  'cognitive functioning': '认知功能',
  'the latter': '后者',
  'given': '鉴于；考虑到',
  'make a habit of': '养成……习惯',
  'be more likely to': '更有可能',
  'regardless of': '不管；无论',
  'does indicate that': '确实表明',
  'like most chefs': '像大多数厨师一样',
  'be afraid of': '害怕；畏惧',
  'as well as': '以及；还',
  'repetitive work': '重复性工作',
  'absolute consistency': '绝对一致性',
  'hear sb. do': '听到某人做某事',
  'in fact': '事实上',
  'cloud-connected': '云端连接的',
  'mechanical arm': '机械臂',
  'thermal scanners': '热成像扫描仪',
  'flip burgers': '翻煎汉堡',
  'clean up afterwards': '事后清理',
  'be described as': '被描述为',
  'happen to': '碰巧',
  'road-test': '实地测试',
  'be deployed': '被部署',
  'not alone': '并非唯一',
  'self-guiding robot': '自主导航机器人',
  'pure science fiction': '纯粹的科幻',
  'a reality': '现实',
  'plausible investment': '合理可行的投资',
  'on a subscription basis': '以订阅模式',
  'immediate return': '即时回报',
  'fully automated': '全自动化的',
  'minimal human oversight': '最低限度人工监督',
  'order at screens': '在屏幕上下单',
  'pay electronically': '电子支付',
  'knit together': '整合起来',
  'buy into': '接受；认同',
  'be keen to': '热衷于',
  'slash labour costs': '大幅削减劳动力成本',
  'seem inevitable': '似乎不可避免',
  'credit A with B': '把 B 归功于 A',
  'self-ordering screens': '自助点餐屏',
  'order values': '订单金额',
  'be seen as key to': '被视为……的关键',
  'push upsells': '推送加购项',
  'factor in': '把……考虑进去',
  'compromise on choice': '在选择上妥协',
  'be presented with': '被呈现；面对',
  'one-size-fits-all menu': '一刀切菜单',
  'people like you': '像你这样的人',
  'pop-up': '临时店；快闪店',
  'full-service restaurant': '全服务餐厅',
  'for the first time': '第一次',
  'new versions of restaurants': '新的餐厅形态',
  'automation-ready': '适合自动化',
  'be likely to': '可能会',
  'a very long time before': '还要很久才会',
  'AI and robotics': '人工智能与机器人学',
  'apart from': '除了……之外',
  'creativity gap': '创造力差距',
  'subtle understanding': '细腻理解',
  'delicate cooking': '精细烹饪',
  'limited functionality': '功能有限',
  'load with plates': '装上盘子',
  'lift off': '取下',
  'robot-powered': '机器人驱动的',
  'topping pizzas': '给披萨加配料',
  'offer an idea of': '让人看到……的雏形',
  'modelled on': '以……为模型；模仿',
  'be programmed to': '被编程为',
  'raw ingredients': '生食材',
  'domestic use': '家庭使用',
  'commercial version': '商业版本',
  'open up the possibility of': '开启……的可能性',
  'for now': '目前',
  'less glamorous': '不那么炫目',
  'rather than': '而不是',
  'shout out orders': '喊出订单',
  'when to start cooking': '何时开始烹饪',
  'come together': '同步完成；一起出餐',
  'suffer a shortage': '遭遇短缺',
  'skilled chefs': '熟练厨师',
  'a deficit of': '……的缺口',
  'idiot-proof': '不易出错的；傻瓜式的',
  'bridge that gap': '填补缺口',
  'in terms of': '就……而言',
  'customer experience': '顾客体验',
  'be seen as': '被视为',
  'early adopters': '早期采用者',
  'may well': '很可能',
  'hit the headlines': '登上头条',
  'miss the mark': '没有切中要害',
  'problems that do not exist': '并不存在的问题',
  'payments being automatic': '自动支付',
  'human art of hospitality': '人性化待客艺术',
  'a threat to jobs': '对就业的威胁',
  'be concerned that': '担心……',
  'without safeguards': '没有保障措施',
  'bypass workers': '绕过劳动者',
  'low-paying jobs': '低薪岗位',
  'benefit a wealthy few': '让少数富人受益',
  'industrial revolutions': '工业革命',
  'redeploy staff': '重新配置员工',
  'if not': '即使不……',
  'front-of-house': '前厅的；面向顾客的',
  'retrain staff': '再培训员工',
  'reduce overheads': '降低管理费用',
  'at lower rates': '以更低薪资',
  'jobs will go': '岗位会消失',
  'bricks-built restaurants': '传统实体餐厅',
  'not least because': '尤其因为',
  'robot and drone delivery': '机器人和无人机配送',
  'food deliveries': '送餐',
  'ground robots': '地面机器人',
  '24 hours a day': '一天 24 小时',
  'machine learning': '机器学习',
  'anticipated order volumes': '预期订单量',
  'minute-by-minute': '逐分钟的',
  'deliver instantly': '即时配送',
  'ahead of': '在……之前',
  'put an exact date on': '给……定下确切日期',
  'on your doorstep': '在你家门口',
  'comfort blanket': '安慰毯；情感依靠',
  'a shoulder to cry on': '可依靠哭诉的肩膀',
  'confide in': '向……倾诉',
  'more often than not': '往往；多半',
  'eagerness to': '急于……',
  'along the way': '一路上；过程中',
  'never-ending turmoil': '无休止的动荡',
  'in the pursuit of': '在追求……的过程中',
  'shrug off': '轻描淡写地对待；摆脱',
  'loved ones': '亲近的人；所爱的人',
  'instead of': '而不是',
  'view as a race': '把……看成竞赛',
  'on their own path': '在各自道路上',
  'relearn to value': '重新学会珍视',
  'radical individualism': '激进个人主义',
  'elevate over': '把……置于……之上',
  'universal healthcare': '全民医疗',
  'fall victim to': '成为……的受害者',
  'based on the assumption that': '基于……的假设',
  'a consequence of': '……的结果',
  'on the road to success': '在通往成功的路上',
  'in the long run': '从长远看',
  'be embedded in': '嵌入……之中',
  'motivational speakers': '励志演讲者',
  'be complacent to': '对……安然接受',
  'better utilized on': '更好地用于',
  'invest time in': '把时间投入……',
  'blind sb. from': '使某人无法看清',
  'whirlwind of change': '变化旋涡',
  'be expected to': '被期待做……',
  'become normalized': '被正常化',
  'our anchors': '我们的锚；稳定支撑',
  'contrary to': '与……相反',
  'self-proclaimed': '自封的',
  'with the help of others': '在他人帮助下',
  'put effort into': '努力投入……',
  'foster healthy relationships': '培养健康关系',
  'far more important than': '远比……重要',
  'acceptance speech': '获奖演说',
  'Nobel Peace Prize': '诺贝尔和平奖',
  'unarmed truth': '赤手空拳的真理',
  'unconditional love': '无条件的爱',
  'have the final word': '拥有最终发言权',
  'struggle to': '艰难地做……',
  'separate truth from fantasy': '区分真相与幻想',
  'fact from fiction': '事实与虚构',
  'at a crossroads': '处在十字路口',
  'battle for equity': '争取公平的斗争',
  'at the heart of': '处于……核心',
  'appalling consequences': '骇人的后果',
  'equity issues': '公平问题',
  'adequately addressed': '得到充分解决',
  'a flood of issues': '大量问题',
  'fail to confront': '未能面对',
  'miss out on': '错失',
  'bridge differences': '弥合分歧',
  'honor legacy': '尊重遗产',
  'get back on the path': '重新回到道路上',
  'for that matter': '就此而言；同样',
  'in the first place': '最初；首先',
  'have a responsibility to': '有责任做……',
  'make connections between': '建立……之间的联系',
  'address inequity': '处理不平等',
  'adherence to principles': '坚持原则',
  'commitment to': '对……的承诺',
  'truthful dialogue': '真实对话',
  'yet to travel': '仍需走过',
  'truthful analysis': '真实分析',
  'retention strategies': '留任策略',
  'deeply rooted divisions': '根深蒂固的分裂',
  'more divided than ever before': '比以往更加分裂',
  'increased polarization': '极化加剧',
  'look away from one another': '彼此回避',
  'head-on': '正面地',
  'post-racial society': '后种族社会',
  'cannot afford to': '承担不起……的后果',
  'keep heads buried in the sand': '把头埋进沙子；逃避现实',
  'when it comes to': '当谈到……',
  'get honest about': '坦诚面对',
  'social diseases': '社会疾病',
  'haunt us': '持续困扰我们',
  'deserve better': '理应得到更好的未来',
  'commit to working together': '承诺共同努力',
  'disrupt the status quo': '打破现状',
  'in the words of': '用……的话说',
  'at peace with itself': '与自身和平相处',
  'live with its conscience': '凭良心生活',
};

const WORD_HINTS = {
  exercise: '锻炼',
  regular: '规律的',
  maintain: '保持',
  habit: '习惯',
  increase: '增加',
  levels: '水平',
  health: '健康',
  benefits: '益处',
  chronic: '慢性的',
  diseases: '疾病',
  active: '活跃的',
  risk: '风险',
  weight: '体重',
  obesity: '肥胖',
  epidemic: '流行问题',
  patterns: '模式',
  adolescents: '青少年',
  technology: '技术',
  robot: '机器人',
  robots: '机器人',
  delivery: '配送',
  deliveries: '配送',
  restaurant: '餐厅',
  restaurants: '餐厅',
  chefs: '厨师',
  staff: '员工',
  customers: '顾客',
  diners: '食客',
  orders: '订单',
  payment: '支付',
  costs: '成本',
  profits: '利润',
  automation: '自动化',
  automated: '自动化的',
  personal: '个人的',
  choice: '选择',
  data: '数据',
  history: '历史',
  recommend: '推荐',
  screen: '屏幕',
  screens: '屏幕',
  cooking: '烹饪',
  ingredients: '食材',
  difficult: '困难的',
  challenging: '有挑战的',
  domestic: '家庭的',
  commercial: '商业的',
  customer: '顾客',
  experience: '体验',
  online: '在线',
  booking: '预订',
  failures: '失败',
  jobs: '岗位',
  workers: '劳动者',
  future: '未来',
  friends: '朋友',
  friendships: '友谊',
  success: '成功',
  achievement: '成就',
  relationships: '关系',
  individual: '个人',
  society: '社会',
  freedom: '自由',
  collective: '集体',
  work: '工作',
  study: '学习',
  college: '大学',
  support: '支持',
  love: '爱',
  truth: '真理',
  equity: '公平',
  inequity: '不平等',
  bias: '偏见',
  racial: '种族的',
  nation: '国家',
  divided: '分裂的',
  dialogue: '对话',
  current: '当前的',
  events: '事件',
  educators: '教育者',
  inclusive: '包容的',
  absolute: '绝对的',
  acceptance: '接受；接纳',
  adequately: '充分地',
  adherence: '坚持；遵守',
  adopters: '采用者',
  afterwards: '之后；事后',
  anticipated: '预期的',
  appalling: '骇人的',
  assert: '断言；认为',
  assignments: '任务；作业',
  automatic: '自动的',
  bother: '费心；麻烦',
  bypass: '绕过',
  complacent: '自满的；安于现状的',
  complain: '抱怨',
  compromise: '妥协',
  concede: '承认；让步',
  confide: '倾诉；吐露',
  consistency: '一致性；稳定性',
  consistently: '持续稳定地',
  contrary: '相反的',
  creativity: '创造力',
  deficit: '缺口；赤字',
  delicate: '精细的；微妙的',
  deployed: '部署；投入使用',
  deserve: '应得；值得',
  disregard: '忽视；不顾',
  disrupt: '打破；扰乱',
  divisions: '分裂；分歧',
  doorstep: '家门口',
  embedded: '嵌入的',
  exercising: '锻炼',
  fiction: '虚构',
  foster: '培养；促进',
  glamorous: '有魅力的；光鲜的',
  headlines: '头条新闻',
  hospitality: '待客；服务',
  ideal: '理想的',
  incidence: '发生率；发病率',
  inevitable: '不可避免的',
  latter: '后者',
  legacy: '遗产；传承',
  limited: '有限的',
  mortality: '死亡率',
  normalized: '正常化的',
  overheads: '经常性开支',
  plausible: '看似合理的；可行的',
  polarization: '两极分化',
  principles: '原则',
  pursuit: '追求',
  repetitive: '重复性的',
  retention: '留任；保留',
  safeguards: '保障措施',
  scanners: '扫描仪',
  shifts: '轮班；班次',
  shortage: '短缺',
  status: '状态；地位',
  subtle: '微妙的；细腻的',
  turmoil: '动荡',
  unconditional: '无条件的',
  universal: '普遍的；全民的',
  wealthy: '富有的',
  whirlwind: '旋涡；快速变化',
  imagine: '想象',
  massive: '巨大的',
  portion: '一份',
  fried: '油炸的',
  dessert: '甜点',
  powerful: '强烈的',
  urge: '冲动',
  adults: '成年人',
  researchers: '研究人员',
  shown: '表明；显示',
  linked: '相关联的',
  phenomenon: '现象',
  characterized: '以……为特征',
  sedentary: '久坐不动的',
  biologically: '生物学上',
  ancient: '古代的',
  calories: '卡路里；热量',
  intake: '摄入量',
  mechanism: '机制',
  preventing: '防止',
  accumulation: '累积',
  naturally: '自然地',
  significant: '显著的；相当多的',
  halfway: '中途；一半',
  session: '一次活动；一段时间',
  sugar: '糖',
  psychologist: '心理学家',
  renowned: '著名的',
  university: '大学',
  coffee: '咖啡',
  punishing: '惩罚性的',
  experiments: '实验',
  estranged: '疏远的',
  therapists: '治疗师',
  tendency: '倾向',
  perfection: '完美',
  trait: '特质',
  anxiety: '焦虑',
  suicide: '自杀',
  measured: '测量；衡量',
  prescribed: '规定的',
  expectations: '期望',
  unrealistic: '不现实的',
  criticized: '被批评的',
  spouse: '配偶',
  chores: '家务',
  contingent: '取决于……的',
  assumes: '认为；假设',
  standardized: '标准化的',
  alerts: '提醒',
  rival: '竞争对手',
  eroded: '被侵蚀的',
  marketplace: '市场',
  ambitious: '有抱负的',
  aggressively: '积极地；强力地',
  setback: '挫折',
  archive: '档案',
  defeat: '失败',
  attorney: '律师',
  partner: '合伙人',
  accomplishments: '成就',
  audience: '观众',
  manifests: '表现出来',
  handicap: '妨碍；制造障碍',
  perseverance: '毅力',
  talent: '天赋',
  award: '奖项',
  intelligence: '智力',
  qualifications: '资质',
  logs: '记录',
  values: '价值观',
  yoga: '瑜伽',
  therapy: '治疗',
  transformation: '转变',
  pathological: '病态的',
  protect: '保护',
  obsessively: '过度地；执着地',
  harm: '伤害',
  doctor: '医生',
  unconstrained: '不受限制的',
  access: '接触机会；访问',
  advertisers: '广告商',
  marketers: '营销人员',
  identity: '身份认同',
  validation: '认可；验证',
  citizens: '公民',
  contribute: '贡献',
  gradually: '逐渐地',
  assault: '攻势；攻击',
  purchases: '购买',
  psychologists: '心理学家',
  emerging: '正在出现的',
  consumerism: '消费主义',
  depression: '抑郁',
  manipulation: '操纵',
  emotions: '情绪',
  desires: '欲望',
  possessions: '财产；拥有物',
  viral: '病毒式传播的',
  advertising: '广告',
  marketing: '营销',
  consumers: '消费者',
  adulthood: '成年',
  objections: '反对意见',
  breach: '违反；侵犯',
  corporations: '公司',
  brainwash: '洗脑',
  decisions: '决定',
  pervasive: '无处不在的',
  targeting: '针对',
  surveillance: '监控',
  inherent: '内在的',
  dehumanizing: '去人性化的',
  relentless: '持续不断的',
  pressure: '压力',
  firms: '公司',
  productivity: '生产力',
  revenue: '收入',
  techniques: '技术；方法',
  performance: '表现',
  assess: '评估',
  interacting: '互动',
  analytics: '数据分析',
  exhaust: '废气；残留数据',
  messaging: '通讯',
  equipped: '配备的',
  devices: '设备',
  microphones: '麦克风',
  volume: '音量',
  intrusive: '侵入性的',
  bullying: '欺凌',
  harassment: '骚扰',
  unexpected: '意外的',
  outperform: '表现优于',
  undetected: '未被发现的',
  implanted: '植入的',
  typing: '打字',
  biometrics: '生物识别',
  schemes: '方案',
  voluntary: '自愿的',
  convenience: '便利',
  substantial: '相当多的；大量的',
  inserted: '插入的；植入的',
  detrimental: '有害的',
  autonomy: '自主权',
  initiatives: '举措',
  communicated: '被传达的',
  revolts: '反抗',
  effectively: '有效地',
  anonymised: '匿名化的',
  sceptical: '怀疑的',
  liberties: '自由权利',
  empowering: '赋能的',
  oppression: '压迫',
  counterproductive: '适得其反的',
};

function normalizePhrase(phrase) {
  return typeof phrase === 'string' ? { term: phrase } : phrase;
}

function explainPhrase(term, phraseNotes) {
  if (phraseNotes?.[term]) return phraseNotes[term];
  if (PHRASE_NOTES[term]) return PHRASE_NOTES[term];
  const words = term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const hints = words.map((word) => WORD_HINTS[word]).filter(Boolean);
  return hints.length > 0 ? [...new Set(hints)].join(' / ') : '重点表达';
}

function phraseMeaning(term, phraseNotes) {
  if (phraseNotes?.[term]) return phraseNotes[term];
  if (PHRASE_NOTES[term]) return PHRASE_NOTES[term];
  const normalized = term.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return WORD_HINTS[normalized];
}

function displayPhrases(item) {
  return (item.phrases || [])
    .map(normalizePhrase)
    .filter((phrase) => phrase?.term)
    .slice(0, 12);
}

function normalizeReviewItem(item) {
  if (!item?.original_sentence) return item;

  const analysisPoints = item.sentence_structure?.analysis_points || [];
  return {
    label: item.sentence_id,
    part: item.source_section,
    en: item.original_sentence,
    zh: item.translation,
    analysis: analysisPoints.map((point) => ({
      label: point.function || point.part || '结构分析',
      text: point.explanation_cn,
    })),
    structure: item.sentence_structure?.simplified_structure_cn || '',
    phrases: (item.key_vocabulary || []).map((phrase) => ({
      term: phrase.word_or_phrase,
      zh: phrase.meaning_cn,
    })),
    difficulty: item.difficulty_analysis?.difficulty_level || 1,
  };
}

function sectionId(section, index) {
  const key = section.navLabel || section.title || `section-${index + 1}`;
  return key
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || `section-${index + 1}`;
}

function structureLines(item) {
  const lines = Array.isArray(item.analysis) && item.analysis.length > 0
    ? item.analysis
    : [{ label: '结构分析', text: item.structure || '' }];

  const unique = [];
  const seen = new Set();
  lines.forEach((line) => {
    const key = `${line.label}:${line.text}`;
    if (line.text && !seen.has(key)) {
      seen.add(key);
      unique.push(line);
    }
  });
  return unique;
}

export function PageStyles() {
  return (
    <style>{`
      :root {
        --cet6-ink: #171310;
        --cet6-muted: #5d574e;
        --cet6-faint: #a8a092;
        --cet6-paper: #ffffff;
        --cet6-cream: #f7f4ee;
        --cet6-wash: #f8f6f1;
        --cet6-line: #eae3d8;
        --cet6-line-soft: #f1ece2;
        --cet6-clay: #9c5f46;
        --cet6-clay-soft: #f1e3d9;
        --cet6-sage: #5f7257;
        --cet6-sage-soft: #e9eddf;
        --cet6-honey: #b08328;
      }

      /* 这个阅读页保持白底长读，只加非常淡的流动纸纹 */
      body:has(.cet6-review) {
        background: #ffffff;
        position: relative;
        overflow-x: hidden;
      }

      body:has(.cet6-review)::before,
      body:has(.cet6-review)::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }

      body:has(.cet6-review)::before {
        opacity: 0.55;
        background-image:
          linear-gradient(115deg, rgba(156, 95, 70, 0.045) 0 1px, transparent 1px 18px),
          linear-gradient(115deg, rgba(95, 114, 87, 0.035) 0 1px, transparent 1px 26px);
        background-size: 180px 180px, 260px 260px;
        animation: cet6-paper-drift 28s linear infinite;
      }

      body:has(.cet6-review)::after {
        opacity: 0.42;
        background:
          radial-gradient(circle at 18% 22%, rgba(241, 227, 217, 0.52), transparent 26%),
          radial-gradient(circle at 82% 36%, rgba(233, 237, 223, 0.48), transparent 28%),
          radial-gradient(circle at 50% 88%, rgba(176, 131, 40, 0.09), transparent 30%);
        filter: blur(18px);
        animation: cet6-light-drift 36s ease-in-out infinite alternate;
      }

      @keyframes cet6-paper-drift {
        from { background-position: 0 0, 0 0; }
        to { background-position: 180px 180px, -260px 260px; }
      }

      @keyframes cet6-light-drift {
        from { transform: translate3d(-1.5%, -1%, 0) scale(1); }
        to { transform: translate3d(1.5%, 1%, 0) scale(1.035); }
      }

      .cet6-review {
        font-family: "Source Serif 4", "Charter", "Georgia", "Noto Serif SC", "Songti SC", "STSong", serif;
        color: var(--cet6-ink);
        position: relative;
        z-index: 1;
        max-width: 720px;
        margin-inline: auto;
        --cet6-rhythm: 1.8;
      }

      .cet6-review * {
        box-sizing: border-box;
      }

      .cet6-hero {
        margin: 0 0 38px;
        padding: 0;
        border-bottom: none;
      }

      .cet6-hero-kicker,
      .cet6-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--cet6-clay);
      }

      .cet6-hero-kicker::before,
      .cet6-kicker::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: currentColor;
        box-shadow: 0 0 0 4px rgba(189, 109, 75, 0.13);
      }

      .cet6-hero h2 {
        margin: 14px 0 12px;
        font-family: "Source Serif 4", "Charter", "Georgia", "Noto Serif SC", serif;
        font-size: clamp(1.9rem, 3.4vw, 2.5rem);
        line-height: 1.22;
        letter-spacing: -0.005em;
        font-weight: 600;
      }

      .cet6-hero p {
        margin: 0;
        max-width: 760px;
        color: var(--cet6-muted);
        line-height: 1.85;
        font-size: 1.05rem;
      }

      .cet6-section {
        margin: 56px 0 72px;
        scroll-margin-top: 112px;
      }

      .cet6-section-head {
        margin-bottom: 18px;
        padding: 0 0 18px;
        border-bottom: 1px solid var(--cet6-line);
      }

      .cet6-section-title {
        margin: 10px 0 8px;
        font-family: "Source Serif 4", "Charter", "Georgia", "Noto Serif SC", serif;
        font-size: clamp(1.3rem, 2.6vw, 1.72rem);
        line-height: 1.3;
        letter-spacing: -0.005em;
        font-weight: 600;
      }

      .cet6-section-desc {
        margin: 0;
        color: var(--cet6-muted);
        line-height: 1.75;
      }

      /* ---------- 句子列表：沉浸式单栏文档流 ---------- */
      .cet6-list {
        display: flex;
        flex-direction: column;
      }

      .cet6-card {
        padding: 40px 0 42px;
        border-bottom: 1px solid var(--cet6-line-soft);
        transition: opacity 0.35s ease;
      }

      .cet6-card:first-child {
        padding-top: 12px;
      }

      .cet6-card:last-child {
        border-bottom: none;
      }

      /* 卡顶元信息行：编号 · 题型 · 难度点 · 掌握按钮 */
      .cet6-card-mark {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 14px;
      }

      .cet6-label {
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--cet6-faint);
      }

      .cet6-part {
        color: var(--cet6-faint);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.7rem;
        letter-spacing: 0.02em;
      }

      .cet6-mark-sep {
        width: 3px;
        height: 3px;
        border-radius: 999px;
        background: var(--cet6-faint);
        opacity: 0.5;
      }

      /* 英文：阅读主角，Source Serif 屏幕衬线，舒展行距，长读不累 */
      .cet6-en {
        margin: 0;
        font-family: "Source Serif 4", "Charter", "Georgia", "Songti SC", serif;
        font-size: 1.84rem;
        line-height: 1.64;
        letter-spacing: 0;
        color: var(--cet6-ink);
        font-weight: 650;
        text-wrap: pretty;
      }

      /* 中文：紧贴英文，克制的次级呈现，柔和不抢戏 */
      .cet6-zh {
        margin: 16px 0 0;
        padding-left: 18px;
        border-left: 2px solid var(--cet6-line);
        color: var(--cet6-muted);
        font-size: 1.2rem;
        line-height: 1.9;
        font-family: "Noto Serif SC", "Songti SC", "STSong", "PingFang SC", serif;
        text-wrap: pretty;
      }

      /* 解析区：结构 + 短语，常驻显示 */
      .cet6-detail {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 20px 0 0;
        border-top: 1px dashed var(--cet6-line);
        background: transparent;
        border-radius: 0;
        animation: cet6-reveal 0.24s ease both;
      }

      @keyframes cet6-reveal {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .cet6-note {
        min-width: 0;
      }

      .cet6-note + .cet6-note {
        padding-top: 16px;
        border-top: 1px solid var(--cet6-line-soft);
      }

      .cet6-note-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: var(--cet6-clay);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cet6-note-title::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.65;
      }

      .cet6-note p {
        margin: 0;
        color: var(--cet6-muted);
        font-size: 0.88rem;
        line-height: 1.74;
      }

      .cet6-structure-lines {
        display: grid;
        gap: 8px;
      }

      .cet6-structure-line {
        position: relative;
        margin: 0;
        padding: 5px 8px 5px 10px;
        border-radius: 8px;
        color: var(--cet6-ink);
        font-size: 0.94rem;
        line-height: 1.78;
        transition: transform 0.22s cubic-bezier(.2,.8,.2,1), color 0.2s ease, background 0.2s ease;
      }

      .cet6-structure-line:hover {
        background: rgba(241, 227, 217, 0.42);
        color: var(--cet6-ink);
        transform: translateX(6px);
      }

      .cet6-structure-label {
        color: var(--cet6-sage);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0;
        margin-right: 4px;
      }

      .cet6-phrases {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 28px;
        row-gap: 0;
      }

      .cet6-phrase {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
        align-items: baseline;
        gap: 12px;
        min-width: 0;
        padding: 9px 8px 10px 12px;
        border-bottom: 1px solid var(--cet6-line-soft);
        border-radius: 8px;
        transition: transform 0.22s cubic-bezier(.2,.8,.2,1), border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
      }

      .cet6-phrase::before {
        content: "";
        position: absolute;
        left: 0;
        top: 10px;
        bottom: 10px;
        width: 2px;
        border-radius: 999px;
        background: var(--cet6-clay);
        opacity: 0;
        transform: scaleY(0.4);
        transition: opacity 0.18s ease, transform 0.22s cubic-bezier(.2,.8,.2,1);
      }

      .cet6-phrase:hover {
        background: rgba(248, 246, 241, 0.92);
        box-shadow: 0 10px 24px rgba(74, 55, 40, 0.07);
        transform: translateY(-3px);
        border-bottom-color: rgba(156, 95, 70, 0.32);
      }

      .cet6-phrase:hover::before {
        opacity: 1;
        transform: scaleY(1);
      }

      .cet6-phrase-en {
        min-width: 0;
        font-family: "Source Serif 4", Georgia, serif;
        font-size: 0.93rem;
        font-weight: 600;
        color: var(--cet6-ink);
        line-height: 1.35;
        overflow-wrap: anywhere;
        transition: color 0.18s ease;
      }

      .cet6-phrase:hover .cet6-phrase-en {
        color: var(--cet6-clay);
      }

      .cet6-phrase-zh {
        min-width: 0;
        margin-left: 0;
        text-align: right;
        color: var(--cet6-muted);
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: 0.78rem;
        line-height: 1.5;
        overflow-wrap: anywhere;
        transition: color 0.18s ease;
      }

      .cet6-phrase:hover .cet6-phrase-zh {
        color: var(--cet6-ink);
      }

      /* 难度：5 个小圆点，融入顶部元信息行 */
      .cet6-difficulty {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .cet6-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--cet6-line);
      }

      .cet6-dot.is-on {
        background: var(--cet6-sage);
      }

      .cet6-dot.is-on.lvl-4 {
        background: var(--cet6-honey);
      }

      .cet6-dot.is-on.lvl-5 {
        background: var(--cet6-clay);
      }

      /* ---------- 进度条 ---------- */
      .cet6-progress {
        margin: 24px 0 0;
        max-width: 440px;
      }

      .cet6-progress-track {
        position: relative;
        height: 5px;
        border-radius: 999px;
        background: #f0e6d7;
        overflow: hidden;
      }

      .cet6-progress-fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--cet6-sage), var(--cet6-honey));
        transition: width 0.4s cubic-bezier(.25,.8,.25,1);
      }

      .cet6-progress-text {
        display: block;
        margin-top: 9px;
        color: var(--cet6-muted);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.82rem;
      }

      /* ---------- 工具栏（粘性） ---------- */
      .cet6-toolbar {
        position: sticky;
        top: 12px;
        z-index: 40;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px 10px;
        margin: 26px 0 40px;
        padding: 12px 16px;
        border: 1px solid var(--cet6-line);
        border-radius: 14px;
        background: rgba(255, 253, 248, 0.86);
        backdrop-filter: blur(10px) saturate(120%);
        -webkit-backdrop-filter: blur(10px) saturate(120%);
        box-shadow: 0 6px 20px rgba(74, 55, 40, 0.06);
      }

      .cet6-tool-group {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }

      .cet6-tool-label {
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--cet6-faint);
        margin-right: 2px;
      }

      .cet6-tool-spacer {
        flex: 1;
      }

      .cet6-chip-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--cet6-muted);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.76rem;
        font-weight: 650;
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .cet6-chip-btn:hover {
        border-color: var(--cet6-line);
        color: var(--cet6-ink);
      }

      .cet6-chip-btn.is-active {
        background: var(--cet6-wash);
        border-color: var(--cet6-line);
        color: var(--cet6-ink);
      }

      .cet6-chip-count {
        font-size: 0.68rem;
        opacity: 0.7;
      }

      .cet6-chip-btn.is-active .cet6-chip-count {
        opacity: 0.85;
      }

      .cet6-toggle {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 4px 9px;
        border-radius: 999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--cet6-muted);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.76rem;
        font-weight: 650;
        cursor: pointer;
        transition: all 0.16s ease;
      }

      .cet6-toggle.is-on {
        background: var(--cet6-wash);
        border-color: rgba(113, 132, 95, 0.4);
        color: var(--cet6-sage);
      }

      .cet6-toggle-dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.4;
        transition: opacity 0.16s ease;
      }

      .cet6-toggle.is-on .cet6-toggle-dot {
        opacity: 1;
      }

      /* ---------- 题型导航 ---------- */
      .cet6-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        width: 100%;
        padding-bottom: 12px;
        margin-bottom: 2px;
        border-bottom: 1px dashed var(--cet6-line-soft);
      }

      .cet6-nav a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--cet6-line);
        background: var(--cet6-paper);
        color: var(--cet6-muted);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.78rem;
        font-weight: 650;
        text-decoration: none;
        transition: all 0.16s ease;
      }

      .cet6-nav a:hover {
        border-color: #d8c7ad;
        color: var(--cet6-ink);
      }

      .cet6-nav a.is-current {
        background: var(--cet6-clay-soft);
        border-color: rgba(189, 109, 75, 0.4);
        color: var(--cet6-clay);
      }

      .cet6-nav-count {
        font-size: 0.68rem;
        opacity: 0.7;
      }

      /* ---------- 卡片状态：掌握 / 自测遮罩 ---------- */
      .cet6-card.is-mastered {
        opacity: 0.58;
      }

      .cet6-card.is-mastered .cet6-en {
        text-decoration: line-through;
        text-decoration-color: rgba(113, 132, 95, 0.5);
      }

      .cet6-card-actions {
        margin-left: auto;
        display: flex;
        gap: 7px;
      }

      .cet6-mini-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 5px 8px;
        border-radius: 999px;
        border: 1px solid var(--cet6-line);
        background: transparent;
        color: var(--cet6-muted);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.7rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.16s ease;
        white-space: nowrap;
      }

      .cet6-mini-btn:hover {
        border-color: #d8c7ad;
        color: var(--cet6-ink);
      }

      .cet6-mini-btn.is-on {
        background: var(--cet6-sage-soft);
        border-color: rgba(113, 132, 95, 0.4);
        color: var(--cet6-sage);
      }

      .cet6-zh-wrap {
        position: relative;
      }

      .cet6-zh-mask {
        margin: 12px 0 0;
        padding: 11px 14px;
        border-left: 2px dashed var(--cet6-faint);
        background: transparent;
        color: var(--cet6-faint);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.16s ease;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .cet6-zh-mask:hover {
        color: var(--cet6-clay);
        border-left-color: var(--cet6-clay);
        background: var(--cet6-clay-soft);
      }

      .cet6-empty {
        margin: 30px 0;
        padding: 28px;
        text-align: center;
        border: 1px dashed var(--cet6-line);
        border-radius: 16px;
        color: var(--cet6-muted);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.9rem;
      }

      @media (max-width: 760px) {
        .cet6-toolbar {
          top: 8px;
          padding: 10px 12px;
          margin-inline: -2px;
        }

        .cet6-tool-spacer {
          display: none;
        }

        .cet6-hero {
          padding: 20px 18px;
          border-radius: 14px;
          background: var(--cet6-wash);
          border: 1px solid var(--cet6-line-soft);
        }

        .cet6-card {
          padding: 24px 0 26px;
        }

        .cet6-card-mark {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .cet6-detail {
          grid-template-columns: 1fr;
        }

        .cet6-phrases {
          grid-template-columns: 1fr;
        }

        .cet6-phrase {
          grid-template-columns: 1fr;
          gap: 3px;
          padding-inline: 10px;
        }

        .cet6-phrase-zh {
          text-align: left;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        body:has(.cet6-review)::before,
        body:has(.cet6-review)::after {
          animation: none !important;
        }

        .cet6-structure-line,
        .cet6-phrase,
        .cet6-phrase::before,
        .cet6-phrase-en,
        .cet6-phrase-zh {
          transition: none !important;
          transform: none !important;
        }
      }
    `}</style>
  );
}

const DIFFICULTY_FILTERS = [
  { value: 'all', label: '全部' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

function makeItemKey(sectionIndex, item, index) {
  return `${sectionIndex}:${item.label || index}`;
}

function useStoredSet(storageKey) {
  const [set, setSet] = useState(() => new Set());

  // 挂载后再读 localStorage，避免 SSR / 注水不一致
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setSet(new Set(JSON.parse(raw)));
    } catch {
      /* localStorage 不可用时静默降级 */
    }
  }, [storageKey]);

  const toggle = useCallback(
    (key) => {
      setSet((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          /* 忽略写入失败 */
        }
        return next;
      });
    },
    [storageKey],
  );

  return [set, toggle];
}

function StructureNote({ item }) {
  const lines = structureLines(item);
  return (
    <div className="cet6-note">
      <span className="cet6-note-title">结构分析</span>
      <div className="cet6-structure-lines">
        {lines.map((line) => (
          <p className="cet6-structure-line" key={`${line.label}:${line.text}`}>
            <span className="cet6-structure-label">{line.label}：</span>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function DifficultyDots({ level }) {
  const difficultyLevel = Math.max(1, Math.min(5, Number(level) || 1));
  return (
    <span className="cet6-difficulty" aria-label={`难度 ${difficultyLevel}/5`}>
      {Array.from({ length: 5 }).map((_, dotIndex) => (
        <span
          key={dotIndex}
          className={`cet6-dot${dotIndex < difficultyLevel ? ` is-on lvl-${difficultyLevel}` : ''}`}
        />
      ))}
    </span>
  );
}

// 结构分析 + 重点词汇，列表模式与专注模式共用
function SentenceDetail({ item, className, phraseNotes }) {
  const phrases = displayPhrases(item);
  return (
    <div className={`cet6-detail${className ? ` ${className}` : ''}`}>
      <StructureNote item={item} />
      {phrases.length > 0 && (
        <div className="cet6-note">
          <span className="cet6-note-title">重点单词 / 短语</span>
          <div className="cet6-phrases">
            {phrases.map((phrase) => {
              const normalized = normalizePhrase(phrase);
              const meaning = normalized.zh || phraseMeaning(normalized.term, phraseNotes) || explainPhrase(normalized.term, phraseNotes);
              return (
                <span className="cet6-phrase" key={normalized.term}>
                  <span className="cet6-phrase-en">{normalized.term}</span>
                  <span className="cet6-phrase-zh">{meaning}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SentenceCard({ item, index, itemKey, hideZh, mastered, onToggleMaster, phraseNotes }) {
  // 全局“遮译文”开启时，单卡默认遮住，点击可临时揭开
  const [revealed, setRevealed] = useState(false);
  const showZh = !hideZh || revealed;

  return (
    <article className={`cet6-card${mastered ? ' is-mastered' : ''}`}>
      <div className="cet6-card-mark">
        <span className="cet6-label">{item.label || String(index + 1).padStart(2, '0')}</span>
        {item.part && <span className="cet6-part">{item.part}</span>}
        <span className="cet6-mark-sep" aria-hidden="true" />
        <DifficultyDots level={item.difficulty} />
        <div className="cet6-card-actions">
          <button
            type="button"
            className={`cet6-mini-btn${mastered ? ' is-on' : ''}`}
            aria-pressed={mastered}
            onClick={() => onToggleMaster(itemKey)}
          >
            {mastered ? '✓ 已掌握' : '标记掌握'}
          </button>
        </div>
      </div>

      <div>
        <p className="cet6-en">{item.en}</p>
        {showZh ? (
          <p className="cet6-zh">{item.zh}</p>
        ) : (
          <div
            className="cet6-zh-mask"
            role="button"
            tabIndex={0}
            onClick={() => setRevealed(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setRevealed(true);
              }
            }}
          >
            <span aria-hidden="true">译</span>
            <span>先自己翻译，点开对照译文</span>
          </div>
        )}
        <SentenceDetail item={item} phraseNotes={phraseNotes} />
      </div>
    </article>
  );
}

export function SentenceReview({ data, intro, sections, storageKey }) {
  const reviewIntro = data?.intro ?? intro;
  const rawReviewSections = data?.sections ?? sections ?? [];
  const reviewSections = rawReviewSections.map((section) => ({
    ...section,
    items: (section.items || []).map(normalizeReviewItem),
  }));
  const reviewStorageKey = data?.storageKey ?? storageKey ?? 'learning-reading-review';
  const reviewPhraseNotes = data?.phraseNotes ?? {};
  const [difficulty, setDifficulty] = useState('all');
  const [hideZh, setHideZh] = useState(false);
  const [hideMastered, setHideMastered] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [mastered, toggleMaster] = useStoredSet(`${reviewStorageKey}:mastered`);

  // 给每个 section / item 预计算稳定 id 与 key
  const decorated = useMemo(
    () =>
      reviewSections.map((section, sectionIndex) => ({
        section,
        id: sectionId(section, sectionIndex),
        items: section.items.map((item, index) => ({
          item,
          index,
          key: makeItemKey(sectionIndex, item, index),
        })),
      })),
    [reviewSections],
  );

  const totalCount = useMemo(
    () => decorated.reduce((sum, s) => sum + s.items.length, 0),
    [decorated],
  );

  const difficultyCounts = useMemo(() => {
    const counts = { all: totalCount, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    decorated.forEach((s) =>
      s.items.forEach(({ item }) => {
        if (counts[item.difficulty] != null) counts[item.difficulty] += 1;
      }),
    );
    return counts;
  }, [decorated, totalCount]);

  const masteredCount = mastered.size;

  const matchesFilters = useCallback(
    ({ item, key }) => {
      if (difficulty !== 'all' && String(item.difficulty) !== difficulty) return false;
      if (hideMastered && mastered.has(key)) return false;
      return true;
    },
    [difficulty, hideMastered, mastered],
  );

  // 滚动高亮当前 section
  useEffect(() => {
    if (decorated.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-section-index'));
            if (!Number.isNaN(idx)) setCurrentSection(idx);
          }
        });
      },
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 },
    );
    decorated.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [decorated]);

  return (
    <div className="cet6-review">
      {reviewIntro && (
        <section className="cet6-hero">
          <span className="cet6-hero-kicker">{reviewIntro.kicker}</span>
          <h2>{reviewIntro.title}</h2>
          <p>{reviewIntro.description}</p>
          <div className="cet6-progress">
            <div
              className="cet6-progress-track"
              role="progressbar"
              aria-valuenow={masteredCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
              aria-label={`已掌握 ${masteredCount} / ${totalCount} 句`}
            >
              <div
                className="cet6-progress-fill"
                style={{ width: `${totalCount ? (masteredCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="cet6-progress-text">
              已掌握 {masteredCount} / {totalCount} 句
              {masteredCount > 0 && ` · ${Math.round((masteredCount / totalCount) * 100)}%`}
            </span>
          </div>
        </section>
      )}

      <div className="cet6-toolbar">
        <nav className="cet6-nav" aria-label="题型导航">
          {decorated.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={i === currentSection ? 'is-current' : undefined}>
              {s.section.navLabel || s.section.title}
              <span className="cet6-nav-count">{s.items.length}</span>
            </a>
          ))}
        </nav>

        <div className="cet6-tool-group">
          <span className="cet6-tool-label">难度</span>
          {DIFFICULTY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`cet6-chip-btn${difficulty === f.value ? ' is-active' : ''}`}
              aria-pressed={difficulty === f.value}
              onClick={() => setDifficulty(f.value)}
            >
              {f.label}
              <span className="cet6-chip-count">{difficultyCounts[f.value] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="cet6-tool-spacer" />

        <button
          type="button"
          className={`cet6-toggle${hideZh ? ' is-on' : ''}`}
          aria-pressed={hideZh}
          onClick={() => setHideZh((v) => !v)}
        >
          <span className="cet6-toggle-dot" />
          遮住译文自测
        </button>
        <button
          type="button"
          className={`cet6-toggle${hideMastered ? ' is-on' : ''}`}
          aria-pressed={hideMastered}
          onClick={() => setHideMastered((v) => !v)}
        >
          <span className="cet6-toggle-dot" />
          隐藏已掌握
        </button>
      </div>

      {(() => {
        const isFiltering = difficulty !== 'all' || hideMastered;
        const rendered = decorated
          .map((s, sectionIndex) => ({ s, sectionIndex, visible: s.items.filter(matchesFilters) }))
          // 筛选生效时跳过空分区，避免多个空状态框堆叠
          .filter(({ visible }) => !isFiltering || visible.length > 0);

        if (rendered.length === 0) {
          return (
            <div className="cet6-empty">当前筛选下没有句子。试试调整难度或关闭“隐藏已掌握”。</div>
          );
        }

        return rendered.map(({ s, sectionIndex, visible }) => (
          <section
            className="cet6-section"
            id={s.id}
            data-section-index={sectionIndex}
            key={s.section.title}
          >
            <div className="cet6-section-head">
              <span className="cet6-kicker">{s.section.kicker}</span>
              <h2 className="cet6-section-title">{s.section.title}</h2>
              {s.section.description && <p className="cet6-section-desc">{s.section.description}</p>}
            </div>

            {visible.length === 0 ? (
              <div className="cet6-empty">当前筛选下没有句子。试试调整难度或关闭“隐藏已掌握”。</div>
            ) : (
              <div className="cet6-list">
                {visible.map(({ item, index, key }) => (
                  <SentenceCard
                    key={key}
                    item={item}
                    index={index}
                    itemKey={key}
                    hideZh={hideZh}
                    mastered={mastered.has(key)}
                    onToggleMaster={toggleMaster}
                    phraseNotes={reviewPhraseNotes}
                  />
                ))}
              </div>
            )}
          </section>
        ));
      })()}
    </div>
  );
}
