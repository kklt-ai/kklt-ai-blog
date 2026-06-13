import { useEffect, useMemo, useState } from "react";

export function useSubtitleTyping(text: string) {
  const chars = useMemo(() => Array.from(text), [text]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(max-width: 700px)").matches
    ) {
      setVisibleCount(chars.length);
      return;
    }

    const timers = chars.map((_, index) =>
      window.setTimeout(() => {
        setVisibleCount((count) => Math.max(count, index + 1));
      }, 350 + index * 55),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [chars]);

  return {
    chars,
    visibleCount,
    isDone: visibleCount >= chars.length,
  };
}
