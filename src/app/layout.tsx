import type { Metadata } from "next";
import "./globals.css";
import "@/md-image/styles.css";

export const metadata: Metadata = {
  title: "卡卡罗特AI Vibe Coding作品",
  description: "卡卡罗特AI的 Vibe Coding 工具作品集。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
