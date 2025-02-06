import { loading } from '~/variants';
import { Loader2 } from 'lucide-react';

export function Loading({ hidden }: { hidden: boolean }) {
  return (
    <div className={loading({ hidden })}>
      <div className="p-2.5">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    </div>
  );
}
