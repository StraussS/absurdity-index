import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今日荒谬指数",
  description: "今天的世界，离谱到几分？用一个不太严肃但相当认真的指数，把现实的抽象程度量化给你看。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
