import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicReading, getPublicWork } from "../../../content/works";
import ReaderShell from "./reader-shell";

type ReaderPageProps = {
  params: Promise<{ workSlug: string; chapterSlug: string }>;
};

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { workSlug, chapterSlug } = await params;
  const work = getPublicWork(workSlug);
  const chapter = getPublicReading(workSlug, chapterSlug);

  if (!work || !chapter) return { title: "找不到試讀內容｜允生作品" };
  return {
    title: `${chapter.title}｜${work.title}`,
    description: `在允生作品網頁閱讀器免費閱讀《${work.title}》${chapter.title}。`,
  };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { workSlug, chapterSlug } = await params;
  const work = getPublicWork(workSlug);
  const chapter = getPublicReading(workSlug, chapterSlug);

  if (!work || !chapter) {
    notFound();
  }

  if (
    !chapter.paragraphs ||
    (chapter.availability !== "public" && chapter.availability !== "preview")
  ) {
    return (
      <main className="lockedChapterPage">
        <a href={`/works/${work.slug}#catalog`}>← 返回《{work.title}》目錄</a>
        <div>
          <p>{chapter.number === "01" ? "正式試讀整理中" : "本章尚未開放"}</p>
          <h1>{chapter.title}</h1>
          <strong>這一頁沒有隱藏的章節內容。</strong>
          <span>尚未向瀏覽器提供這一章的正文；作者確認後才會公開試讀版本。</span>
          <a className="primaryButton" href={`/read/${work.slug}/prologue`}>
            閱讀作品前導 <span aria-hidden="true">→</span>
          </a>
        </div>
      </main>
    );
  }

  const readableChapters = [work.introduction, ...work.chapters].filter(
    (entry) =>
      entry.availability === "public" || entry.availability === "preview",
  );
  const currentIndex = readableChapters.findIndex(
    (entry) => entry.slug === chapter.slug,
  );
  const previousChapter = currentIndex > 0
    ? readableChapters[currentIndex - 1]
    : undefined;
  const nextChapter = currentIndex >= 0
    ? readableChapters[currentIndex + 1]
    : undefined;

  return (
    <ReaderShell
      workSlug={work.slug}
      workTitle={work.title}
      chapterSlug={chapter.slug}
      chapterTitle={chapter.title}
      readingKind={chapter.kind}
      paragraphs={chapter.paragraphs}
      previousChapter={previousChapter}
      nextChapter={nextChapter}
    />
  );
}
