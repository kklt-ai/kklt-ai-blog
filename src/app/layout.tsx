import type { Metadata } from "next";
import "./globals.css";
import "@/md-image/styles.css";

export const metadata: Metadata = {
  title: "小红书 Markdown 排版工具",
  description: "把 Markdown 转成适合小红书发布的多页图片。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
