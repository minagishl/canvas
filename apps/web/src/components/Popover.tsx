import { popover } from '~/variants';
import { Command } from 'lucide-react';

export function Popover({
  text,
  upper,
  command,
  triangle = false,
}: {
  text: string;
  upper: boolean;
  command?: string;
  triangle?: boolean;
}): React.ReactElement {
  return (
    <div className={popover({ upper })}>
      {triangle && (
        <div
          className={`absolute left-1/2 h-0 w-0 -translate-x-1/2 border-8 border-transparent ${
            upper
              ? 'top-full -mt-0.5 border-t-white'
              : 'bottom-full -mb-0.5 border-b-white'
          }`}
        />
      )}
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
