import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicWork } from "../../content/works";

type WorkPageProps = {
  params: Promise<{ workSlug: string }>;
};

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { workSlug } = await params;
  const work = getPublicWork(workSlug);
  if (!work) return { title: "找不到作品｜允生作品" };
  return { title: `${work.title}｜允生作品`, description: work.synopsis };
}

export default async function GenericWorkPage({ params }: WorkPageProps) {
  const { workSlug } = await params;
  const work = getPublicWork(workSlug);
  if (!work) notFound();
  const catalog = [work.introduction, ...work.chapters];

  return (
    <main className="genericWorkPage">
      <nav aria-label="作品導覽">
        {/* vinext dev currently duplicates React when next/link is optimized after startup. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">允生作品</a>
        <a href={`/account?work=${work.slug}`}>讀者帳號</a>
      </nav>
      <header>
        <div>
          <p>{work.publicationStatus}</p>
          <h1>{work.title}</h1>
          <span>作者｜{work.author}</span>
          <p>{work.synopsis}</p>
          <a href={`/read/${work.slug}/${work.introduction.slug}`}>
            開始閱讀 <span aria-hidden="true">→</span>
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={work.cover.src} alt={work.cover.alt} />
      </header>
      <section aria-labelledby="generic-catalog-title">
        <p>CHAPTER DIRECTORY · 章節目錄</p>
        <h2 id="generic-catalog-title">閱讀這部作品</h2>
        <div>
          {catalog.map((chapter) => {
            const readable =
              chapter.availability === "public" ||
              chapter.availability === "preview";
            return (
              <article key={chapter.id}>
                <span>{chapter.number}</span>
                <h3>{chapter.title}</h3>
                {readable ? (
                  <a href={`/read/${work.slug}/${chapter.slug}`}>開始閱讀</a>
                ) : (
                  <span>尚未開放</span>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
