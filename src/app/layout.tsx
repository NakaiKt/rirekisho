import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "かんたん履歴書作成",
  description: "WEB上で完結する履歴書作成アプリ。あなたの情報は端末の外には出ません。",
  keywords: [
    "履歴書",
    "職務経歴書",
    "PDF出力",
    "ブラウザで作成",
    "個人情報保護",
    "無料テンプレート",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "かんたん履歴書作成 | ブラウザで完結する安心の履歴書アプリ",
    description:
      "テンプレートに沿って入力するだけで履歴書と職務経歴書を作成。データはすべてブラウザに保存されるので安心です。",
    siteName: "かんたん履歴書作成",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "かんたん履歴書作成 | ブラウザで完結",
    description:
      "個人情報を端末内に保存したまま、履歴書と職務経歴書をすぐにPDFで出力できるWebアプリ。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "かんたん履歴書作成",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "履歴書や職務経歴書をブラウザ上で作成し、そのままPDFに出力できる日本語向けWebアプリ。入力データは端末内に保存され、外部に送信されません。",
  featureList: [
    "ガイド付きフォームで履歴書・職務経歴書を作成",
    "写真アップロードや郵便番号からの住所自動入力に対応",
    "PDFダウンロードとローカル自動保存で個人情報を保護",
  ],
  isAccessibleForFree: true,
  keywords: [
    "履歴書", "職務経歴書", "PDF", "ブラウザ", "テンプレート", "ローカル保存", "セキュリティ",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={notoSansJP.className}>{children}</body>
    </html>
  );
}
