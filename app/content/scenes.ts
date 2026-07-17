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

export const cancanScenes: ReadonlyArray<CancanScene> = [
  {
    number: "01",
    slug: "dorm-after-lights",
    title: "宿舍熄燈之後",
    copy: "一場偷偷進行的告別，把笑聲、酒氣與沒說完的真心留在盛夏夜裡。",
    motif: "紙杯 · 走廊 · 少年心事",
    cardImage: "/scene-01-dorm-after-lights.jpg",
    cardImageAlt: "熄燈後，女生們圍坐在宿舍地板分享零食與心事的手繪場景",
    detailImage: "/scene-detail-01-dorm-after-lights-v2.png",
    detailImageAlt:
      "畢業前最後一晚，何念恩、莊梔與女同學在熄燈後的宿舍圍坐談心",
    sourceLabel: "第一章節選 · 完稿內容",
    lead: "那是畢業前的最後一個晚上。過了今晚，她們就要離開這所學校了。",
    participants: ["何念恩", "莊梔", "六零四寢室女同學"],
    paragraphs: [
      "她們照常洗漱，照樣在睡前那寶貴的半小時裡聊聊天、吃點小零食，然後照常聽她們早就聽膩的熄燈鈴聲。照常熄燈，宿管照樣來查寢，一切似乎都和平常沒有什麼兩樣，照常得不可思議。",
      "宿舍樓裡早早陷入一片黑暗，所有人都沉沉睡去⋯⋯才怪。",
      "「快快快。」何念恩小心翼翼地轉開門把，躡手躡腳地走出寢室，左看右看確認整條走廊都沒有人了，頓時激動不已，招呼後面幾個人。",
      "趁著宿管去其他寢室查寢的間隙，何念恩和班上其他女生貓著腰，偷偷竄到六零四寢室去。",
      "屋裡只亮著一盞夜燈，微弱的昏黃燈光照在彼此臉上。她們圍坐在一起，窗簾拉得嚴嚴實實，空氣裡混合著沐浴露的香氣和散不掉的花露水味。",
    ],
    isDraft: false,
  },
  {
    number: "02",
    slug: "farewell-song",
    title: "隔樓唱起《送別》",
    copy: "有人站在樓上，有人在樓下。歌聲越過欄杆，也越過再也回不去的年紀。",
    motif: "夜色 · 合唱 · 畢業",
    cardImage: "/scene-02-farewell-song.jpg",
    cardImageAlt: "畢業夜，學生們分站上下兩層宿舍走廊合唱送別的手繪場景",
    detailImage: "/scene-detail-02-farewell-song-v2.png",
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
    cardImage: "/scene-03-time-capsule-reunion.jpg",
    cardImageAlt: "十年後，四位朋友在樹下打開時間膠囊與舊信的手繪場景",
    detailImage: "/scene-detail-03-time-capsule-reunion-v2.png",
    detailImageAlt:
      "十年後校園重聚，何念恩與許承恩在樹下讀信，莊梔拿著舊照片，江遇在不遠處等候",
    sourceLabel: "後續創作場景節選 · 草稿內容",
    lead: "原來離初中畢業，已經過去十年了。",
    participants: ["何念恩", "許承恩", "莊梔", "江遇"],
    paragraphs: [
      "何念恩到的時候，時間膠囊已經都被挖出來了，班長正在對著名字分給來的每個人。",
      "打開來的時候，何念恩笑了。青澀的字跡，是寫得很匆忙的一封信。這麼多年過去，她早已忘記自己寫了什麼；當她緩緩攤開信紙，讀完不長的幾行字，居然隱隱有些鼻酸。",
      "她把信高高舉起。陽光穿透紙張的那一剎那，那些隱藏在塗抹痕跡下的心事，全都暴露無遺。",
      "這個穿越時間的膠囊，完好地保留了少年的心意。",
      "江遇和許承恩擦身而過的時候，絲毫沒有停下來。他徑直走近何念恩，朝她笑了笑。",
      "後來莊梔拿出一張泛黃卷邊的舊照片。那上面是他們班十二個女生的合照，一個不少。",
    ],
    isDraft: true,
  },
];

export function getCancanScene(slug: string) {
  return cancanScenes.find((scene) => scene.slug === slug);
}
