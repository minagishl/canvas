import { useEffect } from 'react';
import {
  Github,
  BookMarked,
  X,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react';
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
        className="fixed top-0 left-0 z-50 size-full bg-black opacity-50"
        onClick={close}
      />
      <div className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform gap-2 rounded-xl bg-white p-2">
        {items.map((item, index) => (
          <div key={index} className="group relative">
            <button
              className="cursor-pointer rounded-md p-2 text-black transition-colors hover:bg-gray-100"
              onClick={item.close ? close : item.onClick}
            >
              {item.icon}
            </button>
            {item.text && (
              <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
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
      <div className="fixed top-0 left-0 z-50 flex size-full bg-black opacity-50" />
      <div className="fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform px-10">
        <div className="mx-auto max-w-96 rounded-lg bg-white p-4">
          <div className="text-center text-sm">
            <span className="sm:block">
              On a smartphone, you can only view shared data.
            </span>
            <span className="sm:block">
              To create new content, please access from a computer.
            </span>
            {import.meta.env.VITE_EXAMPLE_CANVAS_URL && (
              <div className="mt-2">
                <a
                  className="text-blue-600 underline"
                  href={import.meta.env.VITE_EXAMPLE_CANVAS_URL}
                >
                  Open example data
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function ModalInput({
  placeholder,
  close = () => {},
  onChange,
  send,
  isLoading,
}: {
  placeholder?: string;
  close?: () => void;
  onChange?: (text: string) => void;
  send?: () => void;
  isLoading?: boolean;
}): React.ReactElement {
  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 flex size-full bg-black opacity-50"
        onClick={close}
      />
      <div className="fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform px-10">
        <div className="mx-auto max-w-96 rounded-lg bg-white p-2">
          <div className="flex flex-row rounded-md text-center text-sm">
            <input
              className="h-9 w-full rounded-md border-2 border-gray-100 px-2 focus:border-indigo-400 focus:outline-none"
              placeholder={placeholder ?? 'Enter the text'}
              onChange={(e) => onChange?.(e.target.value)}
            />
            <button
              className="ml-2 cursor-pointer rounded-md bg-indigo-100 p-2 text-indigo-600 hover:bg-indigo-200"
              onClick={send}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function TextModal({
  title,
  body,
}: {
  title: string;
  body: string;
}): React.ReactElement {
  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex size-full bg-black opacity-50" />
      <div className="fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform px-10">
        <div className="mx-auto max-w-96 rounded-lg bg-white p-4">
          <div className="flex flex-col text-center text-sm">
            {title && <span className="text-base">{title}</span>}
            <span className="[&:not(:first-child)]:mt-2">{body}</span>
          </div>
        </div>
      </div>
    </>
  );
}
