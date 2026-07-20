export type CancanScene = {
  editorialVersion: string;
  number: string;
  slug: string;
  title: string;
  copy: string;
  motif: string;
  cardImage: string;
  cardImageAlt: string;
  detailImage: string;
  detailImageAlt: string;
  sourceLabel: string;
  lead: string;
  participants: ReadonlyArray<string>;
  paragraphs: ReadonlyArray<string>;
  isDraft: boolean;
};

export const cancanScenes: ReadonlyArray<CancanScene> = [
  {
    editorialVersion: "zh-Hans-scenes-v1",
    number: "01",
    slug: "dorm-after-lights",
    title: "宿舍熄灯之后",
    copy: "一场偷偷进行的告别，把笑声、酒气与没说完的真心留在盛夏夜里。",
    motif: "啤酒罐 · 夜灯 · 少年心事",
    cardImage: "/scene-detail-01-dorm-after-lights-v3.webp",
    cardImageAlt: "熄灯后，女生们围坐在宿舍地板共传一罐啤酒并分享心事",
    detailImage: "/scene-detail-01-dorm-after-lights-v3.webp",
    detailImageAlt:
      "毕业前最后一晚，何念恩、庄栀与女同学在熄灯后的宿舍围坐谈心",
    sourceLabel: "第一章节选 · 完稿内容",
    lead: "那是毕业前的最后一个晚上。过了今晚，她们就要离开这所学校了。",
    participants: ["何念恩", "庄栀", "六零四寝室女同学"],
    paragraphs: [
      "她们照常洗漱，照样在睡前那宝贵的半小时里聊聊天、吃点小零食，然后照常听她们早就听腻的熄灯铃声，照常熄灯、宿管照样来查寝，一切似乎都和平常没有什么两样，照常的不可思议。",
      "宿舍楼里早早陷入一片黑暗，所有人都沉沉睡去⋯⋯才怪。",
      "「快快快。」",
      "何念恩小心翼翼地转开门把，蹑手蹑脚地走出寝室，左看右看确认整条走廊都没有人了，顿时激动不已，招呼后面几个人。",
      "趁着宿管去其他寝室查寝的间隙，何念恩和班上其他女生猫着腰，偷偷窜到六零四寝室去。",
      "屋里只亮着一盏夜灯，微弱的昏黄灯光照在彼此脸上，她们围坐在一起，窗帘拉得严严实实，空气里混合着沐浴露的香气和散不掉的花露水味。",
    ],
    isDraft: false,
  },
  {
    editorialVersion: "zh-Hans-scenes-v1",
    number: "02",
    slug: "farewell-song",
    title: "隔楼唱起《送别》",
    copy: "有人站在楼上，有人在楼下。歌声越过栏杆，也越过再也回不去的年纪。",
    motif: "夜色 · 合唱 · 毕业",
    cardImage: "/scene-detail-02-farewell-song-v2.webp",
    cardImageAlt: "毕业夜，学生们隔着宿舍中庭在相对的阳台合唱送别",
    detailImage: "/scene-detail-02-farewell-song-v2.webp",
    detailImageAlt:
      "何念恩与庄栀站在女生宿舍阳台，隔着中庭与对面男生宿舍的许承恩一同唱起送别",
    sourceLabel: "后续创作场景节选 · 草稿内容",
    lead: "她就是突然想喊他的名字。不为什么，就因为她知道他一定会应。",
    participants: ["何念恩", "许承恩", "庄栀", "毕业班同学"],
    paragraphs: [
      "四栋宿舍楼围出一块方方正正的空地，平时用来晾晒被子、置放行李。男生楼和女生楼各两栋，彼此面对面。",
      "何念恩站在阳台上，隔着一个中庭的距离看着他。晚风吹起她的头发，视线范围内都是飞舞的发丝。",
      "然后越来越多的窗户，一扇接一扇地推开来。几乎每一个人都加入了这场来得有些莫名的合唱，声音从四面八方涌过来，像潮水一样。",
      "她看见隔壁宿舍、和自己一墙之隔的庄栀。庄栀探出头来，朝何念恩笑了。",
      "一旁有人举起了小夜灯，一点一点，像萤火虫一样，从各个阳台亮起来，汇成一片摇摇晃晃的星河。",
      "周围声音此起彼落，有的完全不在调子上，甚至还有人破了音。但何念恩觉得，这是她听过最好听的送别。",
    ],
    isDraft: true,
  },
  {
    editorialVersion: "zh-Hans-scenes-v1",
    number: "03",
    slug: "time-capsule-reunion",
    title: "十年后，打开时间胶囊",
    copy: "当年写给未来的信终于重见阳光，他们才明白：青春没有消失，只是换了一种方式留在身上。",
    motif: "旧信 · 茉莉 · 重逢",
    cardImage: "/scene-detail-03-time-capsule-reunion-v2.webp",
    cardImageAlt: "十年重聚的蒙太奇：四位故友在校园读旧信、翻看合照并再次相遇",
    detailImage: "/scene-detail-03-time-capsule-reunion-v2.webp",
    detailImageAlt:
      "十年重聚的蒙太奇：何念恩与许承恩在树下读信，庄栀拿着旧照片，江遇在不远处等候",
    sourceLabel: "后续创作场景节选 · 草稿内容",
    lead: "原来离初中毕业，已经过去十年了。",
    participants: ["何念恩", "许承恩", "庄栀", "江遇"],
    paragraphs: [
      "何念恩到的时候，时间胶囊已经都被挖出来了，班长正在对著名字分给来的每个人。",
      "打开来的时候，何念恩笑了。青涩的字迹，是写得很匆忙的一封信。这么多年过去，她早已忘记自己写了什么；当她缓缓摊开信纸，读完不长的几行字，居然隐隐有些鼻酸。",
      "她把信高高举起。阳光穿透纸张的那一刹那，那些隐藏在涂抹痕迹下的心事，全都暴露无遗。",
      "这个穿越时间的胶囊，完好地保留了少年的心意。",
      "她目送许承恩和同学越走越远，江遇则说可以去旁边逛逛，在附近等她和朋友们叙旧结束。",
      "后来庄栀拿出一张泛黄卷边的旧照片。那上面是他们班十二个女生的合照，一个不少。",
    ],
    isDraft: true,
  },
];

if (
  cancanScenes.length !== 3 ||
  cancanScenes.some((scene) =>
    !scene.editorialVersion ||
    !scene.slug ||
    !scene.title.trim() ||
    !scene.copy.trim() ||
    !scene.lead.trim() ||
    scene.paragraphs.length === 0 ||
    scene.paragraphs.some((paragraph) => !paragraph.trim())
  )
) {
  throw new Error("zh-Hans scene content is incomplete; release is blocked");
}

export function getCancanScene(slug: string) {
  return cancanScenes.find((scene) => scene.slug === slug);
}
