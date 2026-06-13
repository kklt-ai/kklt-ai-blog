import { useMemo } from "react";
import { HomeCopy } from "../content";
import { useVisibleFeatureCards } from "../hooks/useVisibleFeatureCards";
import { FeatureCard } from "./FeatureCard";

type FeatureSectionProps = {
  copy: HomeCopy;
};

export function FeatureSection({ copy }: FeatureSectionProps) {
  const cardIds = useMemo(() => copy.cards.map((card) => card.id), [copy.cards]);
  const typedCards = useVisibleFeatureCards(cardIds);

  return (
    <section className="bg-[var(--color-bg)] py-10 pb-[60px] max-[640px]:py-[30px] max-[640px]:pb-[50px]">
      <h2 className="m-0 mb-[35px] text-center font-[var(--font-display)] text-[30px] font-medium tracking-[0.4px] text-[var(--color-ink)] max-[640px]:mx-5 max-[640px]:text-[22px]">
        {copy.featuresTitle}
      </h2>
      <div className="mx-auto flex w-[1100px] max-w-[calc(100%-80px)] flex-col gap-[43px] max-[640px]:mx-5 max-[640px]:w-auto max-[640px]:max-w-none max-[640px]:gap-[30px]">
        {copy.cards.map((card, index) => (
          <FeatureCard card={card} index={index} typed={typedCards.has(card.id)} key={card.id} />
        ))}
      </div>
    </section>
  );
}
