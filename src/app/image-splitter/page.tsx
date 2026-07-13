import type { Metadata } from "next";
import { ImageSplitterApp } from "@/image-splitter/ImageSplitterApp";

export const metadata: Metadata = {
  title: "自动切图｜卡卡罗特AI",
  description: "框选图片区域并按网格自动切图，支持 PNG、JPG、WebP 和 ZIP 下载。",
};

export default function ImageSplitterPage() {
  return <ImageSplitterApp />;
}
