import { useEffect, useState } from 'react';
import {
  Github,
  BookMarked,
  X,
  BookOpen,
  ArrowRight,
  Loader2,
  MoreHorizontal,
  Twitter,
  Earth,
  Languages,
} from 'lucide-react';
import { Popover } from './Popover';
import { button, frame, menu } from '~/variants';
import {
  getInitialLanguage,
  toggleLanguage,
  translate,
} from '~/store/language';
import type { Language } from '~/store/language';

const navigateToUrl = (url: string) => {
  window.location.href = url;
};

const openLinkInNewTab = (url: string) => {
  window.open(url, '_blank');
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

function getDefaultItems(lang: Language): Items[] {
  return [
    {
      icon: <Github className="h-5 w-5" />,
      text: String(translate('github', lang)),
      onClick: () => navigateToUrl('https://github.com/minagishl/canvas'),
    },
    {
      icon: <BookMarked className="h-5 w-5" />,
      text: String(translate('guide', lang)),
      onClick: () =>
        navigateToUrl(
          'https://github.com/minagishl/canvas/blob/main/docs/GUIDE.md'
        ),
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      text: String(translate('termsAndPrivacy', lang)),
      onClick: () =>
        navigateToUrl(
          'https://github.com/minagishl/canvas/blob/main/docs/TERMS_AND_PRIVACY.md'
        ),
    },
  ];
}

export function Modal({ items, close }: ModalProps): React.ReactElement {
  const [currentLang, setCurrentLang] =
    useState<Language>(getInitialLanguage());
  const defaultItems = getDefaultItems(currentLang);
  const currentItems = items || defaultItems;

  const handleToggleLanguage = () => {
    setCurrentLang(toggleLanguage(currentLang));
  };

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
  }, [close]);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 size-full bg-black opacity-50"
        onClick={close}
      />
      <div
        className={frame({
          className:
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        })}
      >
        {currentItems.map((item, index) => (
          <div key={index} className="group relative">
            <button
              className={button()}
              onClick={item.close ? close : item.onClick}
              aria-label={item.text || 'Menu'}
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

        {items === undefined && (
          <>
            <div className="group relative">
              <button
                className={button()}
                onClick={handleToggleLanguage}
                aria-label={String(translate('toggleLanguage', currentLang))}
              >
                <Languages className="h-5 w-5" />
              </button>
              <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
                <Popover
                  text={String(translate('toggleLanguage', currentLang))}
                  upper={false}
                />
              </div>
            </div>

            {(import.meta.env.VITE_MENU_TWITTER ||
              import.meta.env.VITE_MENU_WEBSITE) && (
              <div className="group relative" data-testid="more">
                <button key="more" className={button()} aria-label="More">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <div className="absolute left-1/2 hidden h-8 w-24 -translate-x-1/2 group-hover:block" />
                <div className="absolute top-full left-1/2 hidden -translate-x-1/2 pt-3 group-hover:block">
                  <div className={menu()}>
                    {import.meta.env.VITE_MENU_TWITTER && (
                      <div className="group/menu relative">
                        <button
                          className={button()}
                          onClick={() => {
                            openLinkInNewTab(import.meta.env.VITE_MENU_TWITTER);
                          }}
                          aria-label={String(translate('twitter', currentLang))}
                        >
                          <Twitter className="h-5 w-5" />
                        </button>
                        <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
                          <Popover
                            text={String(translate('twitter', currentLang))}
                            upper={false}
                          />
                        </div>
                      </div>
                    )}

                    {import.meta.env.VITE_MENU_WEBSITE && (
                      <div className="group/menu relative">
                        <button
                          className={button()}
                          onClick={() => {
                            openLinkInNewTab(import.meta.env.VITE_MENU_WEBSITE);
                          }}
                          aria-label={String(translate('website', currentLang))}
                        >
                          <Earth className="h-5 w-5" />
                        </button>
                        <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover/menu:block">
                          <Popover
                            text={String(translate('website', currentLang))}
                            upper={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="group relative">
          <button
            className={button()}
            onClick={close}
            aria-label={String(translate('close', currentLang))}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 group-hover:block">
            <Popover
              text={String(translate('close', currentLang))}
              upper={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileModal(): React.ReactElement {
  const [currentLang] = useState<Language>(getInitialLanguage());

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex size-full bg-black opacity-50" />
      <div className="fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform px-10">
        <div className="mx-auto max-w-96 rounded-lg bg-white p-4">
          <div className="text-center text-sm">
            <span className="sm:block">
              {String(translate('mobileNotice', currentLang))}
            </span>
            <span className="sm:block">
              {String(translate('mobileCreateNotice', currentLang))}
            </span>
            {import.meta.env.VITE_EXAMPLE_CANVAS_URL && (
              <div className="mt-2">
                <a
                  className="text-blue-600 underline"
                  href={import.meta.env.VITE_EXAMPLE_CANVAS_URL}
                >
                  {String(translate('openExample', currentLang))}
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
  isOver,
}: {
  placeholder?: string;
  close?: () => void;
  onChange?: (text: string) => void;
  send?: () => void;
  isLoading?: boolean;
  isOver?: boolean;
}): React.ReactElement {
  const [currentLang] = useState<Language>(getInitialLanguage());

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
  }, [close]);

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
              placeholder={
                placeholder ?? String(translate('enterText', currentLang))
              }
              onChange={(e) => onChange?.(e.target.value)}
            />
            <button
              className="ml-2 cursor-pointer rounded-sm bg-indigo-100 p-2.5 text-indigo-600 hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={send}
              disabled={isLoading || isOver}
              aria-label="Send"
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
