export function ArrowIcon() {
  return (
    <svg
      className="-ml-4 h-4 w-4 shrink-0 opacity-0 transition-[opacity,margin-left] duration-200 group-hover:ml-2.5 group-hover:opacity-100 group-[.is-primary]:ml-2.5 group-[.is-primary]:opacity-100 max-[640px]:h-3 max-[640px]:w-3"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.3333 3.66665H12.3333V9.66665"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.848 12.152L12.3333 3.66665"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CaretIcon() {
  return (
    <svg className="h-4 w-4 text-current" width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" d="M16 22 6 12l1.4-1.4 8.6 8.6 8.6-8.6L26 12z" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M4 9.5 L7.5 13 L14 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
