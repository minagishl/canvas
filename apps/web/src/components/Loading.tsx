import { tv } from 'tailwind-variants';
import { Loader2 } from 'lucide-react';

const loading = tv({
  base: 'fixed top-4 right-4 z-40 flex select-none items-center rounded-lg bg-white p-2 shadow-md',
  variants: {
    hidden: {
      true: 'hidden',
    },
  },
});

export function Loading({ hidden }: { hidden: boolean }) {
  return (
    <div className={loading({ hidden })}>
      <div className="p-2">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    </div>
  );
}
