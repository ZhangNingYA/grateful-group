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
};

function normalizePhrase(phrase) {
  return typeof phrase === 'string' ? { term: phrase } : phrase;
}

function getTermKind(term) {
  return term.trim().split(/\s+/).length > 1 ? '短语' : '单词';
}

function explainPhrase(term) {
  if (PHRASE_NOTES[term]) return PHRASE_NOTES[term];
  const words = term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const hints = words.map((word) => WORD_HINTS[word]).filter(Boolean);
  return hints.length > 0 ? `词义线索：${[...new Set(hints)].join(' / ')}` : '结合本句译文理解';
}

function sectionId(section, index) {
  const key = section.navLabel || section.title || `section-${index + 1}`;
  return key
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || `section-${index + 1}`;
}

function splitSentence(en) {
  return en
    .replace(/[“”"]/g, '')
    .split(/(?<=,|;|:|—)\s+|\s+(?=and\b|but\b|because\b|if\b|which\b|who\b|where\b|when\b|while\b|that\b)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 18)
    .slice(0, 5);
}

function grammarTags(item) {
  const text = `${item.en || ''} ${item.structure || ''}`.toLowerCase();
  const tags = [];

  if (/\b(who|which|where)\b/.test(text)) tags.push('定语从句：先找到被修饰名词，再把从句后置翻译。');
  if (/\bit is\b.*\bthat\b|\bthat\b/.test(text)) tags.push('名词性从句 / that 结构：that 后通常承载真正说明内容。');
  if (/\b(if|because|since|when|while|given|compared to|regardless of)\b/.test(text)) tags.push('状语信息：时间、原因、条件或让步先标出来，再回到主句。');
  if (/\b(and|but|or|as well as|rather than)\b/.test(text)) tags.push('并列 / 转折：注意并列对象是否同级，but 后往往是作者重点。');
  if (/\b(to [a-z]+|ing\b|by |with |for )/.test(text)) tags.push('非谓语或介词短语：多半补充目的、方式、范围或伴随状态。');

  return tags.slice(0, 3);
}

function structureDetails(item) {
  const chunks = splitSentence(item.en || '');
  const tags = grammarTags(item);
  return {
    chunks,
    tags,
  };
}

export function PageStyles() {
  return (
    <style>{`
      :root {
        --cet6-ink: #24211d;
        --cet6-muted: #6b6258;
        --cet6-faint: #aaa095;
        --cet6-paper: #fffdf8;
        --cet6-cream: #f7f0e4;
        --cet6-wash: #fbf7ef;
        --cet6-line: #e8ddcb;
        --cet6-line-soft: #f0e8da;
        --cet6-clay: #9f6047;
        --cet6-clay-soft: #f2dfd3;
        --cet6-sage: #63765a;
        --cet6-sage-soft: #e8eddf;
        --cet6-honey: #bd8b31;
      }

      .cet6-review {
        font-family: "Georgia", "Songti SC", "STSong", "PingFang SC", "Microsoft YaHei", serif;
        color: var(--cet6-ink);
        position: relative;
        max-width: 760px;
        margin-inline: auto;
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
        font-size: clamp(1.9rem, 3.4vw, 2.55rem);
        line-height: 1.2;
        letter-spacing: 0;
        font-weight: 650;
      }

      .cet6-hero p {
        margin: 0;
        max-width: 760px;
        color: var(--cet6-muted);
        line-height: 1.85;
        font-size: 1.05rem;
      }

      .cet6-section {
        margin: 44px 0 58px;
        scroll-margin-top: 112px;
      }

      .cet6-section-head {
        margin-bottom: 18px;
        padding: 0 0 18px;
        border-bottom: 1px solid var(--cet6-line);
      }

      .cet6-section-title {
        margin: 10px 0 8px;
        font-size: clamp(1.32rem, 2.6vw, 1.78rem);
        line-height: 1.3;
        letter-spacing: 0;
        font-weight: 650;
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
        padding: 32px 0 34px;
        border-bottom: 1px solid var(--cet6-line-soft);
        transition: opacity 0.2s ease;
      }

      .cet6-card:first-child {
        padding-top: 8px;
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

      /* 英文：阅读主角，最大字号、舒展行距 */
      .cet6-en {
        margin: 0;
        font-size: 1.28rem;
        line-height: 1.92;
        letter-spacing: 0.002em;
        color: var(--cet6-ink);
      }

      /* 中文：紧贴英文，克制的次级呈现，不再是高亮盒子 */
      .cet6-zh {
        margin: 12px 0 0;
        padding-left: 16px;
        border-left: 2px solid #ded1bf;
        color: var(--cet6-muted);
        font-size: 1.03rem;
        line-height: 1.9;
        font-family: "Songti SC", "STSong", "PingFang SC", serif;
      }

      /* 解析触发按钮 */
      .cet6-detail-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 18px;
        padding: 0;
        border: none;
        background: none;
        color: var(--cet6-faint);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.76rem;
        font-weight: 650;
        cursor: pointer;
        transition: color 0.16s ease;
      }

      .cet6-detail-toggle:hover {
        color: var(--cet6-clay);
      }

      .cet6-detail-toggle .cet6-caret {
        transition: transform 0.2s ease;
        font-size: 0.7rem;
      }

      .cet6-detail-toggle.is-open .cet6-caret {
        transform: rotate(90deg);
      }

      /* 折叠区：结构 + 短语，展开才出现 */
      .cet6-detail {
        margin-top: 16px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 18px;
        padding: 18px 0 0;
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

      .cet6-note-title {
        display: block;
        margin-bottom: 8px;
        color: var(--cet6-clay);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cet6-note p {
        margin: 0;
        color: var(--cet6-muted);
        font-size: 0.88rem;
        line-height: 1.74;
      }

      .cet6-structure-stack {
        display: grid;
        gap: 10px;
      }

      .cet6-structure-block {
        padding-top: 9px;
        border-top: 1px dashed var(--cet6-line);
      }

      .cet6-structure-label {
        display: block;
        margin-bottom: 6px;
        color: var(--cet6-sage);
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      .cet6-structure-block ol,
      .cet6-structure-block ul {
        margin: 0;
        padding-left: 18px;
        color: var(--cet6-muted);
      }

      .cet6-structure-block li {
        margin: 4px 0;
        font-size: 0.84rem;
        line-height: 1.62;
      }

      .cet6-phrases {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* 短语：统一中性纸调，去掉蓝色，英文中文同行排版 */
      .cet6-phrase {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding-bottom: 8px;
        border-bottom: 1px dashed var(--cet6-line);
      }

      .cet6-phrase:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .cet6-term-kind {
        flex-shrink: 0;
        width: 24px;
        color: var(--cet6-faint);
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: 0.6rem;
        font-weight: 700;
        line-height: 1.5;
      }

      .cet6-phrase-en {
        font-family: "Inter", "PingFang SC", sans-serif;
        font-size: 0.84rem;
        font-weight: 650;
        color: var(--cet6-ink);
        line-height: 1.4;
      }

      .cet6-phrase.cet6-word .cet6-phrase-en {
        color: var(--cet6-sage);
      }

      .cet6-phrase-zh {
        margin-left: auto;
        text-align: right;
        color: var(--cet6-muted);
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: 0.78rem;
        line-height: 1.4;
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
        position: relative;
        top: auto;
        z-index: 40;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px 10px;
        margin: 26px 0 40px;
        padding: 0 0 20px;
        border-top: none;
        border-bottom: 1px solid var(--cet6-line-soft);
        background: transparent;
        box-shadow: none;
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
        display: none;
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
          border: 1px solid var(--cet6-line);
          border-radius: 14px;
        }

        .cet6-tool-spacer {
          display: none;
        }

        .cet6-hero {
          padding: 20px 18px;
          border-radius: 14px;
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
  const details = structureDetails(item);
  return (
    <div className="cet6-note">
      <span className="cet6-note-title">结构分析</span>
      <div className="cet6-structure-stack">
        <p>{item.structure}</p>
        {details.chunks.length > 1 && (
          <div className="cet6-structure-block">
            <span className="cet6-structure-label">断句顺序</span>
            <ol>
              {details.chunks.map((chunk) => (
                <li key={chunk}>{chunk}</li>
              ))}
            </ol>
          </div>
        )}
        {details.tags.length > 0 && (
          <div className="cet6-structure-block">
            <span className="cet6-structure-label">语法抓手</span>
            <ul>
              {details.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function SentenceCard({ item, index, itemKey, hideZh, mastered, onToggleMaster }) {
  // 全局“遮译文”开启时，单卡默认遮住，点击可临时揭开
  const [revealed, setRevealed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const showZh = !hideZh || revealed;
  const difficultyLevel = Math.max(1, Math.min(5, Number(item.difficulty) || 1));

  return (
    <article className={`cet6-card${mastered ? ' is-mastered' : ''}`}>
      <div className="cet6-card-mark">
        <span className="cet6-label">{item.label || String(index + 1).padStart(2, '0')}</span>
        {item.part && <span className="cet6-part">{item.part}</span>}
        <span className="cet6-mark-sep" aria-hidden="true" />
        <span className="cet6-difficulty" aria-label={`难度 ${difficultyLevel}/5`}>
          {Array.from({ length: 5 }).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`cet6-dot${dotIndex < difficultyLevel ? ` is-on lvl-${difficultyLevel}` : ''}`}
            />
          ))}
        </span>
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
        <button
          type="button"
          className={`cet6-detail-toggle${detailOpen ? ' is-open' : ''}`}
          aria-expanded={detailOpen}
          onClick={() => setDetailOpen((v) => !v)}
        >
          <span className="cet6-caret">›</span>
          {detailOpen ? '收起结构与词汇' : '展开结构与词汇'}
        </button>
        {detailOpen && (
          <div className="cet6-detail">
            <StructureNote item={item} />
            <div className="cet6-note">
              <span className="cet6-note-title">重点单词 / 短语</span>
              <div className="cet6-phrases">
                {(item.phrases || []).map((phrase) => {
                  const normalized = normalizePhrase(phrase);
                  const kind = normalized.kind || getTermKind(normalized.term);
                  return (
                    <span className={`cet6-phrase ${kind === '单词' ? 'cet6-word' : 'cet6-phrase-term'}`} key={normalized.term}>
                      <span className="cet6-term-kind">{kind}</span>
                      <span className="cet6-phrase-en">{normalized.term}</span>
                      <span className="cet6-phrase-zh">{normalized.zh || explainPhrase(normalized.term)}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function SentenceReview({ data, intro, sections, storageKey }) {
  const reviewIntro = data?.intro ?? intro;
  const reviewSections = data?.sections ?? sections ?? [];
  const reviewStorageKey = data?.storageKey ?? storageKey ?? 'learning-reading-review';
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
            <div className="cet6-progress-track">
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

      {decorated.map((s, sectionIndex) => {
        const visible = s.items.filter(matchesFilters);
        return (
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
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
