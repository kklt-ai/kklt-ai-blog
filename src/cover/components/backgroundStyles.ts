import type { CSSProperties } from "react";
import type { CoverBackgroundFit } from "@/cover/lib/cover";

type ImageBackground = {
  src: string;
  fit?: CoverBackgroundFit;
};

export function imageBackgroundStyle(background: ImageBackground): CSSProperties {
  const backgroundSize = background.fit === "contain" ? "contain" : "cover";
  return {
    backgroundImage: `url(${background.src})`,
    backgroundPosition: "center",
    backgroundSize,
    ...(background.fit === "contain" ? { backgroundRepeat: "no-repeat" } : {}),
  };
}

export function imagePreviewObjectFitClassName(fit?: CoverBackgroundFit) {
  return fit === "contain" ? "object-contain" : "object-cover";
}
