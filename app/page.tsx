import { getPublicWork } from "./content/works";

function getFirstWork() {
  const configuredWork = getPublicWork("cancan-lierixia");
  if (!configuredWork) {
    throw new Error("First public work configuration is missing");
  }
  return configuredWork;
}

const firstWork = getFirstWork();

export default function Home() {
  return (
    <main className="brandHome">
      <nav className="brandNav" aria-label="主要導覽">
        <a className="brandWordmark" href="#top" aria-label="回到頁首">
          允生作品
        </a>
        <a href="#works">作品</a>
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
          <p className="eyebrow">YUNSHENG WORKS · 允生原創小說</p>
          <h1>故事從這裡出生</h1>
          <p>
            有些故事記住一個盛夏，有些故事陪我們走過更遠的地方。
            允生作品收藏每一次出發，也為每一部小說保留自己的光。
          </p>
          <a className="brandJump" href="#works">
            查看作品 <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p className="brandMarginNote" aria-hidden="true">
          AUTHOR&apos;S ARCHIVE<br />卷一，自烈日下開始
        </p>
      </section>

      <section className="brandWorks" id="works" aria-labelledby="works-title">
        <header className="brandWorksHeader">
          <div>
            <p className="eyebrow">PUBLISHED WORKS · 已發佈作品</p>
            <h2 id="works-title">每個故事，<br />都有自己的入口。</h2>
          </div>
          <p>
            《{firstWork.title}》是允生的第一部作品。往後的每一部小說，
            都會在這裡擁有獨立、完整而可長久保存的網頁。
          </p>
        </header>

        <article className="brandWorkCard">
          <a className="brandWorkImage" href="/works/cancan-lierixia" aria-label="進入《燦燦烈日下》作品頁">
            {/* Keep the original public artwork path; vinext serves it directly without a loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstWork.cover.src}
              alt={firstWork.cover.alt}
            />
            <span>WORK 001</span>
          </a>
          <div className="brandWorkCopy">
            <p>{firstWork.publicationStatus}</p>
            <h3>{firstWork.title}</h3>
            <blockquote>有些人陪你長大，有些人教你告別。</blockquote>
            <p className="brandWorkSummary">
              {firstWork.synopsis}
            </p>
            <a className="primaryButton brandWorkButton" href="/works/cancan-lierixia">
              進入作品 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
      </section>

      <footer className="brandFooter">
        <span>© 2026 允生作品</span>
        <span>原創小說 · 專屬網頁 · 沉浸閱讀</span>
      </footer>
    </main>
  );
}
