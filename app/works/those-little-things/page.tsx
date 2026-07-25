import type { Metadata } from "next";
import { getPublicWork } from "../../content/works";
import { localePath, localized, type SiteLocale } from "../../i18n";
import LanguageSwitcher from "../../language-switcher";

export const metadata: Metadata = {
  title: "那些有關於他的小事｜允生作品",
  description:
    "2022 年創作的第一部長篇小說。從一把雨傘、一間咖啡店與一對雙生姊妹開始。",
};

function getWork(locale: SiteLocale = "zh-Hant") {
  const configuredWork = getPublicWork("those-little-things", locale);
  if (!configuredWork) {
    throw new Error("Public work configuration is missing");
  }
  return configuredWork;
}

const characters = [
  {
    name: "魏自清",
    actor: "易烊千璽",
    role: "把溫柔藏進沉默裡的人",
    note: "他借出一把傘，也把自己的孤獨留在雨裡。允生後來記得的，不只是遇見，而是那份沒有被追問的陪伴。",
  },
  {
    name: "林允生／林允西",
    actor: "趙今麥",
    role: "一體兩面的姊妹命運",
    note: "允生與允西像彼此的倒影，分享一張臉，也分享家庭裂縫裡長出的依靠、嫉妒與救贖。",
  },
  {
    name: "陳肖",
    actor: "周翊然",
    role: "成年後仍牽動舊日傷口的人",
    note: "他的出現讓青春不只停在回憶裡，也讓那些沒有說清的情感重新被迫面對。",
  },
  {
    name: "小六",
    actor: "劉浩存",
    role: "在承諾與離別之間長大",
    note: "她是故事後段仍保有清亮感的人，讓命運的沉重裡留下一點沒有被磨滅的少年氣。",
  },
  {
    name: "母親",
    actor: "郝蕾",
    role: "家庭陰影的來源",
    note: "她不是單一的反派，而是把偏愛、傷害與失控都壓進家庭日常的人。",
  },
  {
    name: "成年段關鍵長輩",
    actor: "詠梅",
    role: "替成年允生保留一盞燈",
    note: "她代表山城段落裡溫厚而清醒的力量，讓允生在離開與留下之間看見另一種人生。",
  },
];

const stills = [
  {
    src: "/those-little-things/still-01-rain-umbrella.png",
    title: "雨中借傘",
    copy: "故事始於一把小小的傘。那時他們還不知道，這句小事會把三個人的一生牽在一起。",
  },
  {
    src: "/those-little-things/still-02-cafe-trio.png",
    title: "咖啡店三人",
    copy: "窗邊、課本、冷掉的美式。青春最珍貴的部分，常常只是有人準時出現在同一張桌前。",
  },
  {
    src: "/those-little-things/still-03-sisters-mother.png",
    title: "姊妹與母親",
    copy: "允生與允西的親密，從不是單純的相依。她們共同面對的，是一個家庭裡最難說出口的偏愛。",
  },
  {
    src: "/those-little-things/still-04-chenxiao-yunxi.png",
    title: "陳肖與允西",
    copy: "成年段的情感不再只是青春餘波。每一次靠近，都帶著過去沒有處理完的裂縫。",
  },
  {
    src: "/those-little-things/still-05-station-reunion.png",
    title: "車站重逢",
    copy: "多年以後，有些人再次回到眼前。重逢不是答案，而是把傷口重新打開的開始。",
  },
  {
    src: "/those-little-things/still-06-graduation-promise.png",
    title: "畢業承諾",
    copy: "小六與允生的約定，讓故事在沉重之外仍保有一點向前走的清亮。",
  },
  {
    src: "/those-little-things/still-07-mountain-city.png",
    title: "山城收留者",
    copy: "當允生離開熟悉的地方，新的長輩與新的城市替她暫時接住了生活。",
  },
];

export default function ThoseLittleThingsPage({ locale }: { locale?: SiteLocale } = {}) {
  const activeLocale = locale ?? "zh-Hant";
  const copy = <T,>(traditional: T, simplified: T) => localized(activeLocale, traditional, simplified);
  const path = (value: string) => locale ? localePath(locale, value) : value;
  const work = getWork(activeLocale);
  const catalogEntries = [work.introduction, ...work.chapters];

  return (
    <main className="littleThingsPage">
      <nav className="littleNav" aria-label={copy("主要導覽", "主要导航")}>
        <a href={path("/")} aria-label={copy("返回允生作品首頁", "返回允生作品首页")}>
          允生作品
        </a>
        <div>
          <a href="#story">{copy("故事", "故事")}</a>
          <a href="#stills">{copy("劇照", "剧照")}</a>
          <a href="#casting">{copy("選角", "选角")}</a>
          <a href="#catalog">{copy("試讀", "试读")}</a>
          <a href={`${path("/account")}?work=those-little-things`}>{copy("讀者帳號", "读者账号")}</a>
          {locale ? <LanguageSwitcher locale={locale} path="/works/those-little-things" /> : null}
        </div>
        <span>{copy("2022 創作 · 尚未正式發佈", "2022 创作 · 尚未正式发布")}</span>
      </nav>

      <section className="littleHero" id="top">
        <div className="littleHeroCopy">
          <p className="eyebrow">YUNSHENG&apos;S FIRST NOVEL · 2022</p>
          <h1>{work.title}</h1>
          <p className="littleHeroLead">
            {copy(
              "有些相遇看起來只是小事。後來才知道，那是命運遞來的一把傘。",
              "有些相遇看起来只是小事。后来才知道，那是命运递来的一把伞。",
            )}
          </p>
          <p>
            {work.synopsis}
          </p>
          <div className="heroActions">
            <a className="primaryButton" href="#catalog">
              {copy("閱讀第一章", "阅读第一章")} <span aria-hidden="true">↘</span>
            </a>
            <a className="textButton" href="#stills">{copy("查看電影劇照", "查看电影剧照")}</a>
          </div>
        </div>
        <figure className="littleCover">
          <img src={work.cover.src} alt={work.cover.alt} />
          <figcaption>{copy("封面定版 · 未正式發佈", "封面定版 · 未正式发布")}</figcaption>
        </figure>
        <figure className="littleHeroStill">
          <img
            src="/those-little-things/still-01-rain-umbrella.png"
            alt={copy("魏自清在雨中借傘給林允生與林允西的電影劇照", "魏自清在雨中借伞给林允生与林允西的电影剧照")}
          />
        </figure>
      </section>

      <section className="littleStory section" id="story">
        <div className="sectionLabel">
          <span>THE STORY</span>
          <span>{copy("故事氣質", "故事气质")}</span>
        </div>
        <div className="littleStoryGrid">
          <p>
            {copy(
              "它寫的不是一場單純的初戀，而是幾個人如何在被愛與被傷害之後，仍試著相信某個人會留下。",
              "它写的不是一场单纯的初恋，而是几个人如何在被爱与被伤害之后，仍试着相信某个人会留下。",
            )}
          </p>
          <div>
            <p>
              {copy(
                "允生與允西是一對雙生姊妹。她們共享外貌，也共享被家庭陰影籠罩的成長。魏自清闖入她們生活的方式很輕，只是一把傘，一句小事，卻讓青春有了可以回望的光。",
                "允生与允西是一对双生姐妹。她们共享外貌，也共享被家庭阴影笼罩的成长。魏自清闯入她们生活的方式很轻，只是一把伞，一句小事，却让青春有了可以回望的光。",
              )}
            </p>
            <p>
              {copy(
                "故事往後走向更深的離散、重逢與自我修復。那些沒有被正式命名的陪伴，最終成為允生理解愛與傷害的方式。",
                "故事往后走向更深的离散、重逢与自我修复。那些没有被正式命名的陪伴，最终成为允生理解爱与伤害的方式。",
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="littleStills section" id="stills" aria-labelledby="little-stills-title">
        <div className="sectionLabel light">
          <span>CINEMATIC STILLS</span>
          <span>{copy("電影劇照", "电影剧照")}</span>
        </div>
        <h2 id="little-stills-title">{copy("如果小事，", "如果小事，")}<br />{copy("真的走上銀幕。", "真的走上银幕。")}</h2>
        <div className="littleStillGrid">
          {stills.map((still) => (
            <article key={still.src}>
              <img src={still.src} alt={still.title} />
              <div>
                <h3>{still.title}</h3>
                <p>{still.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="littleCasting section" id="casting">
        <div className="sectionLabel">
          <span>READER&apos;S DREAM CAST</span>
          <span>{copy("讀者想像選角", "读者想象选角")}</span>
        </div>
        <div className="littleCastingGrid">
          <div>
            <h2>{copy("如果故事走上銀幕", "如果故事走上银幕")}</h2>
            <p>
              {copy(
                "以下為小說宣傳頁的讀者想像選角，用於協助理解人物氣質，不代表任何演員、經紀公司或製作方參與、授權或合作。",
                "以下为小说宣传页的读者想象选角，用于协助理解人物气质，不代表任何演员、经纪公司或制作方参与、授权或合作。",
              )}
            </p>
          </div>
          <figure>
            <img
              src="/those-little-things/cast-ensemble.png"
              alt={copy("年輕演員群像定裝照", "年轻演员群像定装照")}
            />
          </figure>
        </div>
        <div className="littleCastList">
          {characters.map((character, index) => (
            <article key={character.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{character.name}</h3>
              <strong>{character.actor}</strong>
              <p>{character.role}。{character.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="catalog section" id="catalog" aria-labelledby="little-catalog-title">
        <div className="sectionLabel">
          <span>READ ONLINE</span>
          <span>{copy("目錄與免費試讀", "目录与免费试读")}</span>
        </div>
        <div className="catalogHeader">
          <div>
            <p className="eyebrow">FREE PREVIEW · CHAPTER ONE ONLY</p>
            <h2 id="little-catalog-title">{copy("先從那把傘，", "先从那把伞，")}<br />{copy("讀到故事開始。", "读到故事开始。")}</h2>
          </div>
          <p>
            {copy(
              "目前僅開放作品前導與第一章免費試讀。其餘章節將在作者確認正式公開節奏後，才會逐章開放。",
              "目前仅开放作品前导与第一章免费试读。其余章节将在作者确认正式公开节奏后，才会逐章开放。",
            )}
          </p>
        </div>
        <div className="chapterList" aria-label={`${work.title}${copy("章節目錄", "章节目录")}`}>
          {catalogEntries.map((chapter) => {
            const isReadable =
              chapter.availability === "public" || chapter.availability === "preview";
            const status = chapter.availability === "public"
              ? copy("公開閱讀", "公开阅读")
              : chapter.availability === "preview"
                ? copy("免費試讀", "免费试读")
                : copy("尚未開放", "尚未开放");

            return (
              <article className="chapterRow" key={chapter.slug}>
                <span className="chapterNumber">{chapter.number}</span>
                <h3>{chapter.title}</h3>
                <span className={`chapterStatus ${isReadable ? "isOpen" : ""}`}>
                  {status}
                </span>
                {isReadable ? (
                  <a href={path(`/read/${work.slug}/${chapter.slug}`)}>
                    {copy("開始閱讀", "开始阅读")} <span aria-hidden="true">→</span>
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

      <section className="littleClosing section">
        <p>THOSE LITTLE THINGS</p>
        <blockquote>{copy("「有些小事，後來成了一生。」", "“有些小事，后来成了一生。”")}</blockquote>
        <a className="primaryButton darkButton" href="#top">
          {copy("回到故事開頭", "回到故事开头")} <span aria-hidden="true">↑</span>
        </a>
      </section>

      <footer>
        <span>© 2026 允生作品 · 那些有關於他的小事</span>
        <span>{copy("小說宣傳與影視概念展示", "小说宣传与影视概念展示")}</span>
      </footer>
    </main>
  );
}
