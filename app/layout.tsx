import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "燦燦烈日下｜NINI 長篇小說",
  description:
    "有些人陪你長大，有些人教你告別。一部關於友情、初戀與十年重逢的青春成長小說。",
  openGraph: {
    title: "燦燦烈日下｜有些人陪你長大，有些人教你告別",
    description: "友情、初戀與十年重逢，共同構成一個人的青春。",
    type: "website",
    images: [{ url: "/casting-concept-ensemble.png", width: 1672, height: 942 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "燦燦烈日下｜NINI 長篇小說",
    description: "一部關於友情、初戀與十年重逢的青春成長小說。",
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
