import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "允生作品｜原創小說與網頁閱讀",
  description:
    "允生的原創小說品牌。每一部作品都有自己的專屬網頁、免費試讀與沉浸式閱讀體驗。",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "允生作品｜故事從這裡出生",
    description: "允生的原創小說、作品專頁與網頁閱讀體驗。",
    type: "website",
    images: [{ url: "/casting-concept-ensemble.png", width: 1672, height: 942 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "允生作品｜原創小說與網頁閱讀",
    description: "每一部作品，都有自己的入口。",
    images: ["/casting-concept-ensemble.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
