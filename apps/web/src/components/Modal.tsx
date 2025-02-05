import { useEffect } from 'react';
import {
  Github,
  BookMarked,
  X,
  BookOpen,
  ArrowRight,
  Loader2,
  MoreHorizontal,
  Twitter,
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
      <div className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform gap-2 rounded-lg bg-white p-1.5">
        {items.map((item, index) => (
          <div key={index} className="group relative">
            <button
              className="cursor-pointer rounded-sm p-2.5 text-black transition-colors hover:bg-gray-100"
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

        {items === defaultItems &&
          (import.meta.env.VITE_MENU_TWITTER ||
            import.meta.env.VITE_MENU_WEBSITE) && (
            <div className="group relative" data-testid="more">
              <button
                key="more"
                className="cursor-pointer rounded-sm p-2.5 text-black transition-colors hover:bg-gray-100"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <div className="absolute left-1/2 hidden h-8 w-24 -translate-x-1/2 group-hover:block" />
              <div className="absolute top-full left-1/2 hidden -translate-x-1/2 pt-3 group-hover:block">
                <div
                  className="animate-fade animate-duration-300 animate-once shadow-base absolute top-2 left-1/2 mt-2 flex -translate-x-1/2 items-center justify-center gap-2 rounded-lg bg-white p-1.5"
                  role="menu"
                >
                  {import.meta.env.VITE_MENU_TWITTER && (
                    <div className="group/menu relative">
                      <button
                        className="cursor-pointer rounded-sm p-2.5 text-black transition-colors hover:bg-gray-100"
                        onClick={() => {
                          navigateToUrl(import.meta.env.VITE_MENU_TWITTER);
                        }}
                      >
                        <Twitter className="h-5 w-5" />
                      </button>
                      <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
                        <Popover
                          text={
                            import.meta.env.VITE_MENU_TWITTER_TEXT ?? 'Twitter'
                          }
                          upper={false}
                        />
                      </div>
                    </div>
                  )}

                  {import.meta.env.VITE_MENU_WEBSITE && (
                    <div className="group/menu relative">
                      <button
                        className="cursor-pointer rounded-sm p-2.5 text-black transition-colors hover:bg-gray-100"
                        onClick={() => {
                          navigateToUrl(import.meta.env.VITE_MENU_WEBSITE);
                        }}
                      >
                        <BookOpen className="h-5 w-5" />
                      </button>
                      <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
                        <Popover
                          text={
                            import.meta.env.VITE_MENU_WEBSITE_TEXT ?? 'Website'
                          }
                          upper={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        <div className="group relative">
          <button
            className="cursor-pointer rounded-sm p-2.5 text-black transition-colors hover:bg-gray-100"
            onClick={close}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover text="Close" upper={false} />
          </div>
        </div>
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
        className="fixed top-0 left-0 z-50 flex size-full bg-black opacity-50"
        onClick={close}
      />
      <div className="fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform px-10">
        <div className="mx-auto max-w-96 rounded-lg bg-white p-1.5">
          <div className="flex flex-row rounded-sm text-center text-sm">
            <input
              className="h-10 w-full rounded-sm border-2 border-gray-100 px-2 focus:border-indigo-400 focus:outline-none"
              placeholder={placeholder ?? 'Enter the text'}
              onChange={(e) => onChange?.(e.target.value)}
            />
            <button
              className="ml-2 cursor-pointer rounded-sm bg-indigo-100 p-2.5 text-indigo-600 hover:bg-indigo-200"
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
