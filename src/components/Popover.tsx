import { tv } from 'tailwind-variants';

const popover = tv({
  base: 'absolute bg-white rounded-md shadow-md flex items-center justify-center left-1/2 -translate-x-1/2 animate-fade animate-once animate-duration-300',
  variants: {
    upper: {
      true: 'bottom-2',
      false: 'top-2',
    },
  },
});

export function Popover({
  text,
  upper,
}: {
  text: string;
  upper: boolean;
}): React.ReactElement {
  return (
    <div className={popover({ upper })}>
      <div className="flex w-fit flex-col items-center justify-center whitespace-nowrap p-2 px-4 font-sans">
        <p className="flex h-5 items-center justify-center text-center">
          {text}
        </p>
      </div>
    </div>
  );
}
