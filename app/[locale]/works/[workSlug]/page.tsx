import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicWork } from "../../../content/works";
import { isSiteLocale, localized, localizedMetadataAlternates } from "../../../i18n";
import ThoseLittleThingsPage from "../../../works/those-little-things/page";

type WorkPageProps = { params: Promise<{ locale: string; workSlug: string }> };

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { locale, workSlug } = await params;
  if (!isSiteLocale(locale)) return {};
  const work = getPublicWork(workSlug, locale);
  if (!work) return {};
  return {
    title: `${work.title}｜允生作品`,
    description: work.synopsis,
    alternates: localizedMetadataAlternates(`/works/${workSlug}`),
    openGraph: {
      title: `${work.title}｜允生作品`,
      description: work.synopsis,
      locale: locale === "zh-Hans" ? "zh_CN" : "zh_TW",
    },
  };
}

export default async function LocalizedGenericWorkPage({ params }: WorkPageProps) {
  const { locale, workSlug } = await params;
  if (!isSiteLocale(locale)) notFound();

  if (workSlug === "those-little-things") {
    return <ThoseLittleThingsPage locale={locale} />;
  }

  const work = getPublicWork(workSlug, locale);
  if (!work) notFound();

  return (
    <main className="genericWorkPage">
      <nav aria-label={localized(locale, "作品導覽", "作品导航")}>
        <a href={`/${locale}`}>允生作品</a>
        <a href={`/${locale}/account?work=${work.slug}`}>
          {localized(locale, "讀者帳號", "读者账号")}
        </a>
      </nav>
      <header>
        <div>
          <p>{work.publicationStatus}</p>
          <h1>{work.title}</h1>
          <span>{localized(locale, "作者｜", "作者｜")}{work.author}</span>
          <p>{work.synopsis}</p>
          <a href={`/${locale}/read/${work.slug}/${work.introduction.slug}`}>
            {localized(locale, "開始閱讀", "开始阅读")} <span aria-hidden="true">→</span>
          </a>
        </div>
        <img src={work.cover.src} alt={work.cover.alt} />
      </header>
    </main>
  );
}
