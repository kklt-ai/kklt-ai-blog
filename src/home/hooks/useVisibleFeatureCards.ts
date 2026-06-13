import { useEffect, useState } from "react";

export function useVisibleFeatureCards(cardIds: readonly string[]) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setVisibleIds(new Set(cardIds));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.homeCardId;
          if (!id) return;
          setVisibleIds((current) => new Set(current).add(id));
        });
      },
      { threshold: 0.25 },
    );

    const titles = document.querySelectorAll<HTMLElement>("[data-home-card-id]");
    titles.forEach((title) => observer.observe(title));
    return () => observer.disconnect();
  }, [cardIds]);

  return visibleIds;
}
