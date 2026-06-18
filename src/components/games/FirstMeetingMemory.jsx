import MemoryStoryPage from './MemoryStoryPage.jsx';

const stats = [
  { label: '写进首页的起点', value: '2025.10.18' },
  { label: '这一页的主题', value: '第一次相遇' },
  { label: '它留下来的意义', value: '整条时间线的第一页' },
  { label: '后来的感觉', value: '想起就会变温柔' },
];

const highlights = [
  { label: '日期', value: '2025 年 10 月 18 日' },
  { label: '位置', value: '属于你们的开始' },
  { label: '关键词', value: '相遇 / 靠近 / 记住' },
  { label: '在整个栏目里的角色', value: '首页计时器的起点' },
];

const timeline = {
  eyebrow: 'Timeline Opening',
  title: '这一天不吵闹，却决定了后来很多故事怎么发生。',
  lead: '第一次相遇本身就值得单独留下，因为之后的很多幸福，都是从这一页开始往后写的。',
  items: [
    {
      moment: '起点',
      title: '时间开始有了一个可以反复确认的日子',
      detail:
        '原本只是普通流动着的日历，到了这一天忽然变得很具体。后来每次往回看，都会先看到它，然后才看到之后慢慢长出来的全部故事。',
    },
    {
      moment: '靠近',
      title: '第一次相遇，没有夸张，但很真',
      detail:
        '真正珍贵的从来不是戏剧化的开场，而是那种很安静、很确定的靠近感。像是终于和想见的人，在同一个时空里站稳了脚。',
    },
    {
      moment: '之后',
      title: '后来所有纪念，都能顺着这一天找到出处',
      detail:
        '一起聊天、一起想念、一起见面、一起开心，这些后来发生的事会把 10 月 18 日衬得越来越重要。它不是配角，而是最前面的那一页。',
    },
  ],
};

const fragments = {
  eyebrow: 'Soft Fragments',
  title: '有些日子不会大声提醒你，但会长期发亮。',
  lead: '第一次相遇留下来的，不只是一个日期，还有一种很难被替代的开始感。',
  items: [
    {
      title: '被首页记住',
      detail: '你们在 `/games/` 首页看到的计时器，就是从这一天开始往后算的，所以它天然就该拥有自己的一页。',
    },
    {
      title: '被后来的故事证明',
      detail: '如果后面没有继续发生那么多靠近，这一天也许只是普通相遇。但正因为后来一直在延长，它才显得越来越珍贵。',
    },
    {
      title: '被反复想起',
      detail: '真正重要的开始，总会在不同时间重新发亮。哪怕只是在某个普通晚上回头看，也会觉得它仍然很轻，很暖，很对。',
    },
  ],
};

const closing = {
  mark: 'first meeting / first page / first light',
  title: '所以这一天不只是一个日期，它是后来整条时间线真正翻开的第一页。',
  text: '以后继续往下写新的纪念时，这一页都会安静地待在最前面，提醒后来的所有温柔是从哪里开始的。',
};

export default function FirstMeetingMemory() {
  return (
    <MemoryStoryPage
      headerLabel="diary · opening page"
      meta={['2025.10.18', '第一次相遇', 'Memory Archive']}
      title="第一次相遇，是后来所有纪念真正开始的地方。"
      lead="这一天被写在 `/games/` 首页最上面的计时器里，也应该被单独认真留下。从第一次相遇开始，后来那些开心、想念、靠近和幸福，才真正有了出处。"
      quote="有些开始不会很喧闹，但会让之后所有普通的日子都慢慢变得不同。"
      stats={stats}
      badge={{ eyebrow: 'Since', value: '10.18', label: 'first meeting' }}
      highlights={highlights}
      timeline={timeline}
      fragments={fragments}
      closing={closing}
    />
  );
}
