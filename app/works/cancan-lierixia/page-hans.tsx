import type { Metadata } from "next";
import { cancanScenes } from "../../content/scenes-hans";
import { getPublicWork } from "../../content/works";
import { localePath, type SiteLocale } from "../../i18n";
import LanguageSwitcher from "../../language-switcher";

export const metadata: Metadata = {
  title: "灿灿烈日下｜允生作品",
  description: "有些人陪你长大，有些人教你告别。一部关于友情、初恋与十年重逢的青春成长小说。",
};

function getCancanWork() {
  const configuredWork = getPublicWork("cancan-lierixia", "zh-Hans");
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
    actor: "赵今麦",
    role: "那个总把重要的话留到最后的人",
    note: "明亮、敏感，害怕确认，也害怕失去。她要学会的不是永远拥有，而是在失去之后仍愿意选择。",
  },
  {
    name: "许承恩",
    actor: "周翊然",
    role: "越在意，越先转身的少年",
    note: "他把深情藏进玩笑，把退让说成不在乎。那些没能说出口的话，成了青春最长的回声。",
  },
  {
    name: "庄栀",
    actor: "孙千",
    role: "不是助攻，是另一种相爱",
    note: "她是朋友，也是镜子。女性友情在这个故事里从不是配角，而是何念恩理解安全感的另一条路。",
  },
  {
    name: "江遇",
    actor: "王安宇",
    role: "成年世界里，安稳而清醒的答案",
    note: "他不负责取代谁。他让人看见，成熟的爱可以不靠猜测，也不必用失去证明重量。",
  },
];

export default function Home({ locale }: { locale?: SiteLocale } = {}) {
  const path = (value: string) => locale ? localePath(locale, value) : value;
  return (
    <main>
      <nav className="nav" aria-label="主要导览">
        <a className="wordmark" href={path("/")} aria-label="返回允生作品首页">
          允生作品
        </a>
        <div className="navLinks">
          <a href="#story">故事</a>
          <a href="#characters">人物</a>
          <a href="#casting">概念选角</a>
          <a href="#catalog">试读</a>
          <a href={`${path("/account")}?work=cancan-lierixia`}>读者账号</a>
          {locale ? <LanguageSwitcher locale={locale} path="/works/cancan-lierixia" /> : null}
        </div>
        <span className="navStatus">{work.publicationStatus}</span>
      </nav>

      <section className="hero" id="top">
        <div className="sun" aria-hidden="true" />
        <div className="heroCopy">
          <p className="eyebrow">A NOVEL BY NINI</p>
          <h1>
            <span>灿灿</span>
            <span className="titleShift">烈日下</span>
          </h1>
          <p className="heroThesis">有些人陪你长大，<br />有些人教你告别。</p>
          <p className="heroIntro">
            一部关于友情、初恋与十年重逢的青春成长小说。
            在最明亮的夏天，他们学会了最难的一件事——
            接受失去，仍然选择靠近。
          </p>
          <div className="heroActions">
            <a className="primaryButton" href="#story">进入故事 <span>↘</span></a>
            <a className="textButton" href="#casting">查看概念选角</a>
          </div>
        </div>

        <figure className="heroArtwork">
          <img
            src="/casting-concept-ensemble.png"
            alt="四位少年与一只时间胶囊站在盛夏校园走廊的手绘概念图"
          />
          <figcaption>
            <span>UNOFFICIAL CONCEPT ART</span>
            <span>非官方想像选角</span>
          </figcaption>
        </figure>

        <div className="timeNote" aria-hidden="true">
          <span>TO / 十年后的我们</span>
          <strong>不要忘记<br />今天的太阳。</strong>
          <small>TIME CAPSULE · 833 DAYS</small>
        </div>
        <a className="scrollCue" href="#story" aria-label="向下阅读故事">SCROLL <span>↓</span></a>
      </section>

      <section className="story section" id="story">
        <div className="sectionLabel">
          <span>THE STORY</span>
          <span>故事梗概</span>
        </div>
        <div className="storyGrid">
          <p className="storyLead">我们以为青春最遗憾的是没有在一起。<br />后来才知道，是没有好好说再见。</p>
          <div className="storyBody">
            <p>
              何念恩和许承恩从彼此的少年时代穿过。他们太熟悉对方，熟悉到每一次靠近都像理所当然，每一次退后也都来不及追问。
            </p>
            <p>
              庄栀让她明白，友情同样可以是一生的命题；江遇则在成年后告诉她，真正安全的关系不需要反覆猜测。十年后，一只时间胶囊把所有人重新带回那个盛夏。
            </p>
          </div>
        </div>
        <div className="motifLine" aria-label="小说意象">
          <span>垂丝茉莉</span><i />
          <span>五角星</span><i />
          <span>藕汤</span><i />
          <span>时间胶囊</span>
        </div>
      </section>

      <section className="scenes section" id="scenes" aria-labelledby="scenes-title">
        <div className="sectionLabel light">
          <span>SCENES TO REMEMBER</span>
          <span>影视名场面</span>
        </div>
        <h2 id="scenes-title">把青春留在<br />最有光的地方</h2>
        <div className="sceneGrid">
          {cancanScenes.map((scene) => (
            <a
              className="sceneCard"
              href={path(`/works/cancan-lierixia/scenes/${scene.slug}`)}
              aria-label={`阅读场景：${scene.title}`}
              key={scene.number}
            >
              <img
                className="sceneImage"
                src={scene.cardImage}
                alt={scene.cardImageAlt}
              />
              <span className="sceneNumber">{scene.number}</span>
              <div className="sceneContent">
                <h3>{scene.title}</h3>
                <p>{scene.copy}</p>
                <small>{scene.motif} · 点击阅读</small>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="characters section" id="characters">
        <div className="sectionLabel">
          <span>CHARACTERS</span>
          <span>人物关系</span>
        </div>
        <div className="charactersHeader">
          <h2>不是谁成全谁，<br />是彼此构成了彼此。</h2>
          <p>爱情、友情与成年后的选择，共同照亮何念恩的一生。</p>
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
            src="/casting-concept-ensemble-v2.webp"
            alt="赵今麦、周翊然、孙千与王安宇分别置于校园黄昏与城市雨夜的非官方电影海报式概念图"
          />
          <span className="artStamp">READER&apos;S DREAM CAST</span>
        </div>
        <div className="castingCopy">
          <div className="sectionLabel light">
            <span>UNOFFICIAL DREAM CAST</span>
            <span>读者想像选角</span>
          </div>
          <h2>如果故事<br />走上银幕</h2>
          <div className="castNames">
            {characters.map((character) => (
              <div key={character.name}>
                <span>{character.name}</span>
                <strong>{character.actor}</strong>
              </div>
            ))}
          </div>
          <p className="disclaimer">
            本页为小说宣传及创作概念展示。演员姓名与肖像仅用于非官方、非商业性的读者想像选角，不代表任何演员、经纪公司或制作方参与、授权或合作。
          </p>
        </div>
      </section>

      <section className="catalog section" id="catalog" aria-labelledby="catalog-title">
        <div className="sectionLabel">
          <span>READ ONLINE</span>
          <span>目录与免费试读</span>
        </div>
        <div className="catalogHeader">
          <div>
            <p className="eyebrow">A QUIET PLACE FOR THE STORY</p>
            <h2 id="catalog-title">从公开的文字，<br />走进那个盛夏。</h2>
          </div>
          <p>
            目前开放作品前导与第一章免费试读，第二、第三章也将陆续开放。
            小说第一册电子书即将发行，敬请期待。
          </p>
        </div>
        <div className="chapterList" aria-label={`${work.title}章节目录`}>
          {catalogEntries.map((chapter) => {
            const isReadable =
              chapter.availability === "public" || chapter.availability === "preview";
            const status = chapter.availability === "public"
              ? "公开阅读"
              : chapter.availability === "preview"
                ? "免费试读"
                : chapter.availability === "preparing"
                ? "正式试读整理中"
                : "尚未开放";

            return (
              <article className="chapterRow" key={chapter.slug}>
                <span className="chapterNumber">{chapter.number}</span>
                <h3>{chapter.title}</h3>
                <span className={`chapterStatus ${isReadable ? "isOpen" : ""}`}>
                  {status}
                </span>
                {isReadable ? (
                  <a href={path(`/read/${work.slug}/${chapter.slug}`)}>
                    开始阅读 <span aria-hidden="true">→</span>
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
        <blockquote>「接受失去，<br />仍然愿意珍惜与选择。」</blockquote>
        <p>《灿灿烈日下》长篇小说 · 影视化概念筹备中</p>
        <a className="primaryButton darkButton" href="#top">回到那个夏天 <span>↑</span></a>
      </section>

      <footer>
        <span>© 2026 NINI · 灿灿烈日下</span>
        <span>小说创作与影视概念展示</span>
      </footer>
    </main>
  );
}
