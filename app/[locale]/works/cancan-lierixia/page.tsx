import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSiteLocale, localized, localizedMetadataAlternates } from "../../../i18n";
import TraditionalWorkPage from "../../../works/cancan-lierixia/page";
import SimplifiedWorkPage from "../../../works/cancan-lierixia/page-hans";

type WorkPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) return {};
  return {
    title: localized(locale, "燦燦烈日下｜允生作品", "灿灿烈日下｜允生作品"),
    description: localized(
      locale,
      "有些人陪你長大，有些人教你告別。一部關於友情、初戀與十年重逢的青春成長小說。",
      "有些人陪你长大，有些人教你告别。一部关于友情、初恋与十年重逢的青春成长小说。",
    ),
    alternates: localizedMetadataAlternates("/works/cancan-lierixia"),
    openGraph: {
      title: localized(locale, "燦燦烈日下｜允生作品", "灿灿烈日下｜允生作品"),
      description: localized(
        locale,
        "有些人陪你長大，有些人教你告別。一部關於友情、初戀與十年重逢的青春成長小說。",
        "有些人陪你长大，有些人教你告别。一部关于友情、初恋与十年重逢的青春成长小说。",
      ),
      locale: locale === "zh-Hans" ? "zh_CN" : "zh_TW",
    },
  };
}

export default async function LocalizedWorkPage({ params }: WorkPageProps) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  return locale === "zh-Hans"
    ? <SimplifiedWorkPage locale={locale} />
    : <TraditionalWorkPage locale={locale} />;
}
