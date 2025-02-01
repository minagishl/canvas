import { Inbox } from 'lucide-react';

export function Drag() {
  return (
    <div className="fixed top-0 left-0 z-50 flex size-full items-center justify-center bg-black opacity-50 select-none">
      <div className="flex flex-col items-center justify-center rounded-l p-4">
        <Inbox className="size-10 animate-bounce text-white" />
        <p className="mt-4 text-white">Drop the file here</p>
        <p className="text-white">Supported files: PNG, JPEG, GIF, WebP, SVG</p>
      </div>
    </div>
  );
}
