import type { Metadata } from "next";
import { getPublicWork } from "../../content/works";

export const metadata: Metadata = {
  title: "燦燦烈日下｜允生作品",
  description: "有些人陪你長大，有些人教你告別。一部關於友情、初戀與十年重逢的青春成長小說。",
};

function getCancanWork() {
  const configuredWork = getPublicWork("cancan-lierixia");
  if (!configuredWork) {
    throw new Error("Public work configuration is missing");
  }
  return configuredWork;
}

const work = getCancanWork();
const catalogEntries = [work.introduction, ...work.chapters];

const characters = [
  {
    name: "何念恩",
    actor: "趙今麥",
    role: "那個總把重要的話留到最後的人",
    note: "明亮、敏感，害怕確認，也害怕失去。她要學會的不是永遠擁有，而是在失去之後仍願意選擇。",
  },
  {
    name: "許承恩",
    actor: "周翊然",
    role: "越在意，越先轉身的少年",
    note: "他把深情藏進玩笑，把退讓說成不在乎。那些沒能說出口的話，成了青春最長的回聲。",
  },
  {
    name: "莊梔",
    actor: "孫千",
    role: "不是助攻，是另一種相愛",
    note: "她是朋友，也是鏡子。女性友情在這個故事裡從不是配角，而是何念恩理解安全感的另一條路。",
  },
  {
    name: "江遇",
    actor: "王安宇",
    role: "成年世界裡，安穩而清醒的答案",
    note: "他不負責取代誰。他讓人看見，成熟的愛可以不靠猜測，也不必用失去證明重量。",
  },
];

const scenes = [
  {
    number: "01",
    title: "宿舍熄燈之後",
    copy: "一場偷偷進行的告別，把笑聲、酒氣與沒說完的真心留在盛夏夜裡。",
    motif: "紙杯 · 走廊 · 少年心事",
    image: "/scene-01-dorm-after-lights.jpg",
    imageAlt: "熄燈後，女生們圍坐在宿舍地板分享零食與心事的手繪場景",
  },
  {
    number: "02",
    title: "隔樓唱起《送別》",
    copy: "有人站在樓上，有人在樓下。歌聲越過欄杆，也越過再也回不去的年紀。",
    motif: "夜色 · 合唱 · 畢業",
    image: "/scene-02-farewell-song.jpg",
    imageAlt: "畢業夜，學生們分站上下兩層宿舍走廊合唱送別的手繪場景",
  },
  {
    number: "03",
    title: "十年後，打開時間膠囊",
    copy: "當年寫給未來的信終於重見陽光，他們才明白：青春沒有消失，只是換了一種方式留在身上。",
    motif: "舊信 · 茉莉 · 重逢",
    image: "/scene-03-time-capsule-reunion.jpg",
    imageAlt: "十年後，四位朋友在樹下打開時間膠囊與舊信的手繪場景",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="主要導覽">
        {/* vinext dev currently duplicates React when next/link is optimized after startup. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="wordmark" href="/" aria-label="返回允生作品首頁">
          允生作品
        </a>
        <div className="navLinks">
          <a href="#story">故事</a>
          <a href="#characters">人物</a>
          <a href="#casting">概念選角</a>
          <a href="#catalog">試讀</a>
        </div>
        <span className="navStatus">{work.publicationStatus}</span>
      </nav>

      <section className="hero" id="top">
        <div className="sun" aria-hidden="true" />
        <div className="heroCopy">
          <p className="eyebrow">A NOVEL BY NINI</p>
          <h1>
            <span>燦燦</span>
            <span className="titleShift">烈日下</span>
          </h1>
          <p className="heroThesis">有些人陪你長大，<br />有些人教你告別。</p>
          <p className="heroIntro">
            一部關於友情、初戀與十年重逢的青春成長小說。
            在最明亮的夏天，他們學會了最難的一件事——
            接受失去，仍然選擇靠近。
          </p>
          <div className="heroActions">
            <a className="primaryButton" href="#story">進入故事 <span>↘</span></a>
            <a className="textButton" href="#casting">查看概念選角</a>
          </div>
        </div>

        <figure className="heroArtwork">
          <img
            src="/casting-concept-ensemble.png"
            alt="四位少年與一只時間膠囊站在盛夏校園走廊的手繪概念圖"
          />
          <figcaption>
            <span>UNOFFICIAL CONCEPT ART</span>
            <span>非官方想像選角</span>
          </figcaption>
        </figure>

        <div className="timeNote" aria-hidden="true">
          <span>TO / 十年後的我們</span>
          <strong>不要忘記<br />今天的太陽。</strong>
          <small>TIME CAPSULE · 833 DAYS</small>
        </div>
        <a className="scrollCue" href="#story" aria-label="向下閱讀故事">SCROLL <span>↓</span></a>
      </section>

      <section className="story section" id="story">
        <div className="sectionLabel">
          <span>THE STORY</span>
          <span>故事梗概</span>
        </div>
        <div className="storyGrid">
          <p className="storyLead">我們以為青春最遺憾的是沒有在一起。<br />後來才知道，是沒有好好說再見。</p>
          <div className="storyBody">
            <p>
              何念恩和許承恩從彼此的少年時代穿過。他們太熟悉對方，熟悉到每一次靠近都像理所當然，每一次退後也都來不及追問。
            </p>
            <p>
              莊梔讓她明白，友情同樣可以是一生的命題；江遇則在成年後告訴她，真正安全的關係不需要反覆猜測。十年後，一只時間膠囊把所有人重新帶回那個盛夏。
            </p>
          </div>
        </div>
        <div className="motifLine" aria-label="小說意象">
          <span>垂絲茉莉</span><i />
          <span>五角星</span><i />
          <span>藕湯</span><i />
          <span>時間膠囊</span>
        </div>
      </section>

      <section className="scenes section" aria-labelledby="scenes-title">
        <div className="sectionLabel light">
          <span>SCENES TO REMEMBER</span>
          <span>影視名場面</span>
        </div>
        <h2 id="scenes-title">把青春留在<br />最有光的地方</h2>
        <div className="sceneGrid">
          {scenes.map((scene) => (
            <article className="sceneCard" key={scene.number}>
              <img className="sceneImage" src={scene.image} alt={scene.imageAlt} />
              <span className="sceneNumber">{scene.number}</span>
              <div className="sceneContent">
                <h3>{scene.title}</h3>
                <p>{scene.copy}</p>
                <small>{scene.motif}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="characters section" id="characters">
        <div className="sectionLabel">
          <span>CHARACTERS</span>
          <span>人物關係</span>
        </div>
        <div className="charactersHeader">
          <h2>不是誰成全誰，<br />是彼此構成了彼此。</h2>
          <p>愛情、友情與成年後的選擇，共同照亮何念恩的一生。</p>
        </div>
        <div className="characterList">
          {characters.map((character, index) => (
            <article className="characterRow" key={character.name}>
              <span className="characterIndex">0{index + 1}</span>
              <h3>{character.name}</h3>
              <strong>{character.role}</strong>
              <p>{character.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="casting section" id="casting">
        <div className="castingArt">
          <img
            src="/casting-concept-ensemble.png"
            alt="趙今麥、周翊然、孫千與王安宇演繹四位小說角色的非官方手繪概念圖"
          />
          <span className="artStamp">READER&apos;S DREAM CAST</span>
        </div>
        <div className="castingCopy">
          <div className="sectionLabel light">
            <span>UNOFFICIAL DREAM CAST</span>
            <span>讀者想像選角</span>
          </div>
          <h2>如果故事<br />走上銀幕</h2>
          <div className="castNames">
            {characters.map((character) => (
              <div key={character.name}>
                <span>{character.name}</span>
                <strong>{character.actor}</strong>
              </div>
            ))}
          </div>
          <p className="disclaimer">
            本頁為小說宣傳及創作概念展示。演員姓名與肖像僅用於非官方、非商業性的讀者想像選角，不代表任何演員、經紀公司或製作方參與、授權或合作。
          </p>
        </div>
      </section>

      <section className="catalog section" id="catalog" aria-labelledby="catalog-title">
        <div className="sectionLabel">
          <span>READ ONLINE</span>
          <span>目錄與免費試讀</span>
        </div>
        <div className="catalogHeader">
          <div>
            <p className="eyebrow">A QUIET PLACE FOR THE STORY</p>
            <h2 id="catalog-title">從公開的文字，<br />走進那個盛夏。</h2>
          </div>
          <p>
            目前開放作品前導與作者核准的第一章免費試讀。其餘章節將在作者逐章確認後開放，
            完整手稿不會放入網站或公開下載。
          </p>
        </div>
        <div className="chapterList" aria-label={`${work.title}章節目錄`}>
          {catalogEntries.map((chapter) => {
            const isReadable =
              chapter.availability === "public" || chapter.availability === "preview";
            const status = chapter.availability === "public"
              ? "公開閱讀"
              : chapter.availability === "preview"
                ? "免費試讀"
                : chapter.availability === "preparing"
                ? "正式試讀整理中"
                : "尚未開放";

            return (
              <article className="chapterRow" key={chapter.slug}>
                <span className="chapterNumber">{chapter.number}</span>
                <h3>{chapter.title}</h3>
                <span className={`chapterStatus ${isReadable ? "isOpen" : ""}`}>
                  {status}
                </span>
                {isReadable ? (
                  <a href={`/read/${work.slug}/${chapter.slug}`}>
                    開始閱讀 <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span className="chapterUnavailable" aria-label={`${chapter.title}${status}`}>
                    —
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="closing section">
        <p className="closingEyebrow">TO THE SUMMER WE ONCE HAD</p>
        <blockquote>「接受失去，<br />仍然願意珍惜與選擇。」</blockquote>
        <p>《燦燦烈日下》長篇小說 · 影視化概念籌備中</p>
        <a className="primaryButton darkButton" href="#top">回到那個夏天 <span>↑</span></a>
      </section>

      <footer>
        <span>© 2026 NINI · 燦燦烈日下</span>
        <span>小說創作與影視概念展示</span>
      </footer>
    </main>
  );
}
