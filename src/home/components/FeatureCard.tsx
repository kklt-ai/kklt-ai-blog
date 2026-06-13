import { ASSET_BASE, FeatureCardCopy } from "../content";

type FeatureCardProps = {
  card: FeatureCardCopy;
  index: number;
  typed: boolean;
};

const layouts = [
  {
    card: "bg-[#efebe3]",
    image: "left-0 top-0 h-[360px] w-[573px]",
    text: "left-[648px] top-[136px]",
  },
  {
    card: "bg-[#f6f1ea]",
    image: "left-[527px] top-0 h-[360px] w-[573px]",
    text: "left-[129px] top-[130px]",
  },
  {
    card: "bg-[#efe8e3]",
    image: "left-0 top-0 h-[360px] w-[573px]",
    text: "left-[645px] top-[114px]",
  },
  {
    card: "bg-[#fbf2e9]",
    image: "left-[527px] top-0 h-[360px] w-[573px]",
    text: "left-[122px] top-[107px]",
  },
  {
    card: "bg-[#f5ede7]",
    image: "left-0 top-0 h-[360px] w-[660px]",
    text: "left-[670px] top-28",
  },
] as const;

export function FeatureCard({ card, index, typed }: FeatureCardProps) {
  const layout = layouts[index];

  return (
    <article className={`relative h-[360px] w-full overflow-hidden rounded ${layout.card} max-[640px]:flex max-[640px]:h-auto max-[640px]:flex-col max-[640px]:p-[6px_6px_26px]`}>
      <div className={`absolute overflow-hidden max-[640px]:relative max-[640px]:inset-auto max-[640px]:order-1 max-[640px]:h-[202px] max-[640px]:w-full ${layout.image}`}>
        <img className="block h-full w-full object-cover pointer-events-none" src={`${ASSET_BASE}/${card.image}`} alt="" />
      </div>
      <div className={`absolute flex w-[331px] flex-col gap-2.5 tracking-normal max-[640px]:static max-[640px]:order-2 max-[640px]:mt-[26px] max-[640px]:w-auto max-[640px]:mx-5 ${layout.text}`}>
        <h3
          className="m-0 font-[var(--font-mincho)] text-[22px] font-medium leading-[1.447] text-[var(--color-ink)] max-[640px]:text-lg"
          data-home-card-id={card.id}
          aria-label={card.title}
        >
          {Array.from(card.title).map((char, charIndex) => (
            <span
              className={`inline-block whitespace-pre ${typed ? "animate-[home-type-in_1ms_steps(1,end)_forwards]" : "opacity-0"}`}
              style={{ animationDelay: `${charIndex * 130}ms` }}
              key={`${char}-${charIndex}`}
            >
              {char}
            </span>
          ))}
          <span className={`mb-0.5 ml-[3px] inline-block h-[18px] w-0.5 bg-current align-middle ${typed ? "animate-[home-cursor-blink_1s_steps(2,end)_infinite]" : "opacity-0"}`} aria-hidden="true" />
        </h3>
        <p className="m-0 font-[var(--font-misans)] text-base font-light leading-[1.447] text-[var(--color-ink-soft)] max-[640px]:text-sm">
          {card.body}
        </p>
      </div>
    </article>
  );
}
