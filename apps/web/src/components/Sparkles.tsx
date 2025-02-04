import { tv } from 'tailwind-variants';

const icon = tv({
  base: 'animate-infinite animate-ease-linear group-hover:animate-pulse',
  variants: {
    position: {
      upperRight: 'animate-duration-[2000ms]',
      lowerLeft: 'animate-duration-[1000ms]',
    },
    isAnimating: {
      true: 'animate-pulse',
    },
  },
});

export function Sparkles({ isAnimating = false }: { isAnimating?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>

      {/* upper right */}
      <g className={icon({ position: 'upperRight', isAnimating })}>
        <path d="M20 3v4" />
        <path d="M22 5h-4" />
      </g>

      {/* lower left */}
      <g className={icon({ position: 'lowerLeft', isAnimating })}>
        <path d="M4 17v2" />
        <path d="M5 18H3" />
      </g>
    </svg>
  );
}
