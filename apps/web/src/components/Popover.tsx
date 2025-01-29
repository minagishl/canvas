import { tv } from 'tailwind-variants';
import { Command } from 'lucide-react';

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
  command,
}: {
  text: string;
  upper: boolean;
  command?: string;
}): React.ReactElement {
  return (
    <div className={popover({ upper })}>
      <div className="flex w-fit flex-col items-center justify-center p-2 px-4 font-sans whitespace-nowrap">
        <div className="flex h-5 items-center justify-center text-center">
          {command && (
            <div className="flex flex-row items-center justify-center">
              <Command className="h-3.5 w-3.5" />
              <span className="px-0.5 pb-0.5">&#043;</span>
              {command}
              <div className="mx-2.5 h-3 w-px bg-gray-200" />
            </div>
          )}
          {text}
        </div>
      </div>
    </div>
  );
}
