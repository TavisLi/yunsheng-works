import { cancanLierixiaChapterOne } from "./previews/cancan-lierixia-chapter-01.js";

export type CancanScene = {
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

const chapterOneParagraphs = new Map(
  cancanLierixiaChapterOne.map(({ id, text }) => [id, text]),
);

function chapterOneText(...ids: ReadonlyArray<string>) {
  return ids.map((id) => chapterOneParagraphs.get(id)).filter(Boolean) as string[];
}

export const cancanScenes: ReadonlyArray<CancanScene> = [
  {
    number: "01",
    slug: "dorm-after-lights",
    title: "宿舍熄燈之後",
    copy: "一場偷偷進行的告別，把笑聲、酒氣與沒說完的真心留在盛夏夜裡。",
    motif: "啤酒罐 · 夜燈 · 少年心事",
    cardImage: "/scene-detail-01-dorm-after-lights-v3.webp",
    cardImageAlt: "熄燈後，女生們圍坐在宿舍地板共傳一罐啤酒並分享心事",
    detailImage: "/scene-detail-01-dorm-after-lights-v3.webp",
    detailImageAlt:
      "畢業前最後一晚，何念恩、莊梔與女同學在熄燈後的宿舍圍坐談心",
    sourceLabel: "第一章節選 · 完稿內容",
    lead: chapterOneText("chapter-01-p002", "chapter-01-p003").join(""),
    participants: ["何念恩", "莊梔", "六零四寢室女同學"],
    paragraphs: chapterOneText(
      "chapter-01-p008",
      "chapter-01-p009",
      "chapter-01-p010",
      "chapter-01-p011",
      "chapter-01-p013",
      "chapter-01-p023",
    ),
    isDraft: false,
  },
  {
    number: "02",
    slug: "farewell-song",
    title: "隔樓唱起《送別》",
    copy: "有人站在樓上，有人在樓下。歌聲越過欄杆，也越過再也回不去的年紀。",
    motif: "夜色 · 合唱 · 畢業",
    cardImage: "/scene-detail-02-farewell-song-v2.webp",
    cardImageAlt: "畢業夜，學生們隔著宿舍中庭在相對的陽台合唱送別",
    detailImage: "/scene-detail-02-farewell-song-v2.webp",
    detailImageAlt:
      "何念恩與莊梔站在女生宿舍陽台，隔著中庭與對面男生宿舍的許承恩一同唱起送別",
    sourceLabel: "後續創作場景節選 · 草稿內容",
    lead: "她就是突然想喊他的名字。不為什麼，就因為她知道他一定會應。",
    participants: ["何念恩", "許承恩", "莊梔", "畢業班同學"],
    paragraphs: [
      "四棟宿舍樓圍出一塊方方正正的空地，平時用來晾曬被子、置放行李。男生樓和女生樓各兩棟，彼此面對面。",
      "何念恩站在陽台上，隔著一個中庭的距離看著他。晚風吹起她的頭髮，視線範圍內都是飛舞的髮絲。",
      "然後越來越多的窗戶，一扇接一扇地推開來。幾乎每一個人都加入了這場來得有些莫名的合唱，聲音從四面八方湧過來，像潮水一樣。",
      "她看見隔壁宿舍、和自己一牆之隔的莊梔。莊梔探出頭來，朝何念恩笑了。",
      "一旁有人舉起了小夜燈，一點一點，像螢火蟲一樣，從各個陽台亮起來，匯成一片搖搖晃晃的星河。",
      "周圍聲音此起彼落，有的完全不在調子上，甚至還有人破了音。但何念恩覺得，這是她聽過最好聽的送別。",
    ],
    isDraft: true,
  },
  {
    number: "03",
    slug: "time-capsule-reunion",
    title: "十年後，打開時間膠囊",
    copy: "當年寫給未來的信終於重見陽光，他們才明白：青春沒有消失，只是換了一種方式留在身上。",
    motif: "舊信 · 茉莉 · 重逢",
    cardImage: "/scene-detail-03-time-capsule-reunion-v2.webp",
    cardImageAlt: "十年重聚的蒙太奇：四位故友在校園讀舊信、翻看合照並再次相遇",
    detailImage: "/scene-detail-03-time-capsule-reunion-v2.webp",
    detailImageAlt:
      "十年重聚的蒙太奇：何念恩與許承恩在樹下讀信，莊梔拿著舊照片，江遇在不遠處等候",
    sourceLabel: "後續創作場景節選 · 草稿內容",
    lead: "原來離初中畢業，已經過去十年了。",
    participants: ["何念恩", "許承恩", "莊梔", "江遇"],
    paragraphs: [
      "何念恩到的時候，時間膠囊已經都被挖出來了，班長正在對著名字分給來的每個人。",
      "打開來的時候，何念恩笑了。青澀的字跡，是寫得很匆忙的一封信。這麼多年過去，她早已忘記自己寫了什麼；當她緩緩攤開信紙，讀完不長的幾行字，居然隱隱有些鼻酸。",
      "她把信高高舉起。陽光穿透紙張的那一剎那，那些隱藏在塗抹痕跡下的心事，全都暴露無遺。",
      "這個穿越時間的膠囊，完好地保留了少年的心意。",
      "她目送許承恩和同學越走越遠，江遇則說可以去旁邊逛逛，在附近等她和朋友們敘舊結束。",
      "後來莊梔拿出一張泛黃卷邊的舊照片。那上面是他們班十二個女生的合照，一個不少。",
    ],
    isDraft: true,
  },
];

export function getCancanScene(slug: string) {
  return cancanScenes.find((scene) => scene.slug === slug);
}
