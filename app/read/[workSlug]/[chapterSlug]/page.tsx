import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicReading, getPublicWork } from "../../../content/works";
import { localePath, localized, localizedMetadataAlternates } from "../../../i18n";
import { getRequestLocale } from "../../../request-locale";
import ReaderShell from "./reader-shell";

type ReaderPageProps = {
  params: Promise<{ workSlug: string; chapterSlug: string }>;
};

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { workSlug, chapterSlug } = await params;
  const locale = await getRequestLocale();
  const work = getPublicWork(workSlug, locale);
  const chapter = getPublicReading(workSlug, chapterSlug, locale);

  if (!work || !chapter) return { title: localized(locale, "找不到試讀內容｜允生作品", "找不到试读内容｜允生作品") };
  return {
    title: `${chapter.title}｜${work.title}`,
    description: localized(locale, `在允生作品網頁閱讀器免費閱讀《${work.title}》${chapter.title}。`, `在允生作品网页阅读器免费阅读《${work.title}》${chapter.title}。`),
    alternates: localizedMetadataAlternates(`/read/${workSlug}/${chapterSlug}`),
  };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { workSlug, chapterSlug } = await params;
  const locale = await getRequestLocale();
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const work = getPublicWork(workSlug, locale);
  const chapter = getPublicReading(workSlug, chapterSlug, locale);

  if (!work || !chapter) {
    notFound();
  }

  if (
    !chapter.paragraphs ||
    (chapter.availability !== "public" && chapter.availability !== "preview")
  ) {
    return (
      <main className="lockedChapterPage">
        <a href={`${localePath(locale, `/works/${work.slug}`)}#catalog`}>← {copy("返回", "返回")}《{work.title}》{copy("目錄", "目录")}</a>
        <div>
          <p>{chapter.number === "01" ? copy("正式試讀整理中", "简体试读内容审校中") : copy("本章尚未開放", "本章尚未开放")}</p>
          <h1>{chapter.title}</h1>
          <strong>{copy("這一頁沒有隱藏的章節內容。", "这一页没有隐藏的章节内容。")}</strong>
          <span>{copy("尚未向瀏覽器提供這一章的正文；作者確認後才會公開試讀版本。", "尚未向浏览器提供这一章的正文；作者确认后才会公开试读版本。")}</span>
          <a className="primaryButton" href={localePath(locale, `/read/${work.slug}/prologue`)}>
            {copy("閱讀作品前導", "阅读作品前导")} <span aria-hidden="true">→</span>
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
      locale={locale}
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
