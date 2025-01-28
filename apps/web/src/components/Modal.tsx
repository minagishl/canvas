import { useEffect } from 'react';
import { Github, BookMarked, X, BookOpen } from 'lucide-react';
import { Popover } from './Popover';

const navigateToUrl = (url: string) => {
  window.location.href = url;
};

type Items = {
  icon: React.ReactNode;
  text?: string;
  onClick?: () => void;
  close?: boolean;
};

interface ModalProps {
  items?: Items[];
  close: () => void;
}

const defaultItems: Items[] = [
  {
    icon: <Github className="h-5 w-5" />,
    text: 'GitHub',
    onClick: () => navigateToUrl('https://github.com/minagishl/canvas'),
  },
  {
    icon: <BookMarked className="h-5 w-5" />,
    text: 'Guide',
    onClick: () =>
      navigateToUrl(
        'https://github.com/minagishl/canvas/blob/main/docs/GUIDE.md'
      ),
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    text: 'Terms & Privacy',
    onClick: () =>
      navigateToUrl(
        'https://github.com/minagishl/canvas/blob/main/docs/TERMS_AND_PRIVACY.md'
      ),
  },
  {
    icon: <X className="h-5 w-5" />,
    text: 'Close',
    onClick: () => {},
    close: true,
  },
];

export function Modal({
  items = defaultItems,
  close,
}: ModalProps): React.ReactElement {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <>
      <div
        className="fixed left-0 top-0 z-50 size-full bg-black opacity-50"
        onClick={close}
      />
      <div className="fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform gap-2 rounded-xl bg-white p-2">
        {items.map((item, index) => (
          <div key={index} className="group relative">
            <button
              className="cursor-pointer rounded-md p-2 text-black transition-colors hover:bg-gray-100"
              onClick={item.close ? close : item.onClick}
            >
              {item.icon}
            </button>
            {item.text && (
              <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block">
                <Popover text={item.text} upper={false} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function MobileModal(): React.ReactElement {
  return (
    <>
      <div className="fixed left-0 top-0 z-50 flex size-full bg-black opacity-50" />
      <div className="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform">
        <div className="mx-10 h-fit w-fit rounded-lg bg-white p-4 text-center text-sm sm:flex sm:flex-col">
          <span>On a smartphone, you can only view shared data.</span>
          <span>To create new content, please access from a computer.</span>
          {import.meta.env.VITE_EXAMPLE_CANVAS_URL && (
            <>
              <br />
              <a
                className="text-blue-600 underline"
                href={import.meta.env.VITE_EXAMPLE_CANVAS_URL}
              >
                Open example data
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
