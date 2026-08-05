import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandHome } from "../page";
import { isSiteLocale, localized, localizedMetadataAlternates } from "../i18n";

type LocalePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) return {};
  return {
    title: localized(locale, "允生作品｜原創小說與網頁閱讀", "允生作品｜原创小说与网页阅读"),
    description: localized(
      locale,
      "允生的原創小說品牌。每一部作品都有自己的專屬網頁、免費試讀與沉浸式閱讀體驗。",
      "允生的原创小说品牌。每一部作品都有自己的专属网页、免费试读与沉浸式阅读体验。",
    ),
    alternates: localizedMetadataAlternates("/"),
  };
}

export default async function LocalizedHome({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  return <BrandHome locale={locale} />;
}
