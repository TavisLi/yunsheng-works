import { getPublicWorks } from "./content/works";
import { localePath, localized, type SiteLocale } from "./i18n";
import LanguageSwitcher from "./language-switcher";

function getPublishedWorks(locale: SiteLocale) {
  const configuredWorks = getPublicWorks(locale);
  const configuredWork = configuredWorks[0];
  if (!configuredWork) {
    throw new Error("Public work configuration is missing");
  }
  return configuredWorks;
}

export function BrandHome({ locale = "zh-Hant" }: { locale?: SiteLocale }) {
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const publishedWorks = getPublishedWorks(locale);
  const firstWork = publishedWorks[0];
  return (
    <main className="brandHome">
      <nav className="brandNav" aria-label="主要導覽">
        <a className="brandWordmark" href="#top" aria-label="回到頁首">
          {copy("允生作品", "允生作品")}
        </a>
        <div className="brandNavLinks">
          <a href="#works">{copy("作品", "作品")}</a>
          <a href={localePath(locale, "/account")}>{copy("讀者帳號", "读者账号")}</a>
          <LanguageSwitcher locale={locale} path="/" />
        </div>
        <span>ORIGINAL STORIES · SINCE 2026</span>
      </nav>

      <section className="brandHero" id="top">
        <div className="brandSeal" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/yunsheng-home-sunset-illustration.webp"
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className="brandIntro">
          <p className="eyebrow">YUNSHENG WORKS · {copy("允生原創小說", "允生原创小说")}</p>
          <h1>{copy("故事從這裡出生", "故事从这里出生")}</h1>
          <p>
            {copy(
              "有些故事記住一個盛夏，有些故事陪我們走過更遠的地方。允生作品收藏每一次出發，也為每一部小說保留自己的光。",
              "有些故事记住一个盛夏，有些故事陪我们走过更远的地方。允生作品收藏每一次出发，也为每一部小说保留自己的光。",
            )}
          </p>
          <a className="brandJump" href="#works">
            {copy("查看作品", "查看作品")} <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p className="brandMarginNote" aria-hidden="true">
          AUTHOR&apos;S ARCHIVE<br />{copy("卷一，自烈日下開始", "卷一，自烈日下开始")}
        </p>
      </section>

      <section className="brandWorks" id="works" aria-labelledby="works-title">
        <header className="brandWorksHeader">
          <div>
            <p className="eyebrow">PUBLISHED WORKS · {copy("已發佈作品", "已发布作品")}</p>
            <h2 id="works-title">{copy("每個故事，", "每个故事，")}<br />{copy("都有自己的入口。", "都有自己的入口。")}</h2>
          </div>
          <p>
            {copy(
              `《${firstWork.title}》是允生的第一部作品。往後的每一部小說，都會在這裡擁有獨立、完整而可長久保存的網頁。`,
              `《${firstWork.title}》是允生的第一部作品。往后的每一部小说，都会在这里拥有独立、完整而可长久保存的网页。`,
            )}
          </p>
        </header>

        {publishedWorks.map((work, index) => (
          <article className="brandWorkCard" key={work.id}>
            <a
              className="brandWorkImage"
              href={localePath(locale, `/works/${work.slug}`)}
              aria-label={copy(`進入《${work.title}》作品頁`, `进入《${work.title}》作品页`)}
            >
              {/* Keep public artwork paths; vinext serves them directly without a loader. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={work.cover.src} alt={work.cover.alt} />
              <span>WORK {String(index + 1).padStart(3, "0")}</span>
            </a>
            <div className="brandWorkCopy">
              <p>{work.publicationStatus}</p>
              <h3>{work.title}</h3>
              {index === 0 ? (
                <blockquote>{copy("有些人陪你長大，有些人教你告別。", "有些人陪你长大，有些人教你告别。")}</blockquote>
              ) : null}
              <p className="brandWorkSummary">{work.synopsis}</p>
              <a
                className="primaryButton brandWorkButton"
                href={localePath(locale, `/works/${work.slug}`)}
              >
                {copy("進入作品", "进入作品")} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </section>

      <footer className="brandFooter">
        <span>© 2026 允生作品</span>
        <span>{copy("原創小說 · 專屬網頁 · 沉浸閱讀", "原创小说 · 专属网页 · 沉浸阅读")}</span>
      </footer>
    </main>
  );
}

export default function Home() {
  return <BrandHome />;
}
