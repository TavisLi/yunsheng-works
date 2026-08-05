import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { isSiteLocale, localized, localizedMetadataAlternates, type SiteLocale } from "./i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const title = localized(locale, "允生作品｜原創小說與網頁閱讀", "允生作品｜原创小说与网页阅读");
  const description = localized(
    locale,
    "允生的原創小說品牌。每一部作品都有自己的專屬網頁、免費試讀與沉浸式閱讀體驗。",
    "允生的原创小说品牌。每一部作品都有自己的专属网页、免费试读与沉浸式阅读体验。",
  );
  return {
    title,
    description,
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
    openGraph: {
      title: localized(locale, "允生作品｜故事從這裡出生", "允生作品｜故事从这里出生"),
      description,
      type: "website",
      locale: locale === "zh-Hans" ? "zh_CN" : "zh_TW",
      images: [{ url: "/casting-concept-ensemble.png", width: 1672, height: 942 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: localized(locale, "每一部作品，都有自己的入口。", "每一部作品，都有自己的入口。"),
      images: ["/casting-concept-ensemble.png"],
    },
    alternates: localizedMetadataAlternates("/"),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await requestLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}

async function requestLocale(): Promise<SiteLocale> {
  const requestedLocale = (await headers()).get("x-yunsheng-locale") ?? "zh-Hant";
  return isSiteLocale(requestedLocale) ? requestedLocale : "zh-Hant";
}
