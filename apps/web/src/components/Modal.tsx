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

export const Modal = ({ items = defaultItems, close }: ModalProps) => {
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
};
