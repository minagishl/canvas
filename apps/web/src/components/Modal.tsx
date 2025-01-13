import { Github, BookMarked, X } from 'lucide-react';
import { Popover } from './Popover';

const navigateToUrl = (url: string) => {
  window.location.href = url;
};

interface ModalProps {
  close: () => void;
}

export const Modal = ({ close }: ModalProps) => {
  return (
    <>
      <div
        className="fixed left-0 top-0 z-50 size-full bg-black opacity-50"
        onClick={close}
      />
      <div className="fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform gap-2 rounded-xl bg-white p-2">
        <div className="group relative">
          <button
            className="cursor-pointer rounded-md p-2 text-black transition-colors hover:bg-gray-100"
            onClick={() => navigateToUrl('https://github.com/minagishl/canvas')}
          >
            <Github className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="GitHub" upper={false} />
          </div>
        </div>
        <div className="group relative">
          <button
            className="cursor-pointer rounded-md p-2 text-black transition-colors hover:bg-gray-100"
            onClick={() =>
              navigateToUrl(
                'https://github.com/minagishl/canvas/blob/main/docs/GUIDE.md'
              )
            }
          >
            <BookMarked className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Guide" upper={false} />
          </div>
        </div>
        <div className="group relative">
          <button
            className="cursor-pointer rounded-md p-2 text-black transition-colors hover:bg-gray-100"
            onClick={close}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Close" upper={false} />
          </div>
        </div>
      </div>
    </>
  );
};
