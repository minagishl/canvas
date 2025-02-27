export type Language = 'en' | 'ja';

export interface Translation {
  [key: string]: {
    en: string;
    ja: string;
  };
}

const translations: Translation = {
  github: {
    en: 'GitHub',
    ja: 'GitHub',
  },
  guide: {
    en: 'Guide',
    ja: 'ガイド',
  },
  // Toolbar actions
  more: {
    en: 'More',
    ja: 'その他',
  },
  zoomIn: {
    en: 'Zoom in',
    ja: '拡大',
  },
  zoomOut: {
    en: 'Zoom out',
    ja: '縮小',
  },
  stopPresentation: {
    en: 'Stop presentation',
    ja: 'プレゼンテーションを終了',
  },
  askAI: {
    en: 'Ask the Canvas AI',
    ja: 'Canvas AIに質問',
  },
  // Menu tools
  pen: {
    en: 'Pen',
    ja: 'ペン',
  },
  arrow: {
    en: 'Arrow',
    ja: '矢印',
  },
  gif: {
    en: 'GIF',
    ja: 'GIF',
  },
  addRandomGIF: {
    en: 'Add random GIF',
    ja: 'ランダムGIFを追加',
  },
  exportImage: {
    en: 'Export as image',
    ja: '画像として保存',
  },
  shareCanvas: {
    en: 'Share canvas',
    ja: 'キャンバスを共有',
  },
  startPresentation: {
    en: 'Start presentation',
    ja: 'プレゼンテーションを開始',
  },
  deleteAllObjects: {
    en: 'Delete all objects',
    ja: 'すべてのオブジェクトを削除',
  },
  termsAndPrivacy: {
    en: 'Terms & Privacy',
    ja: '利用規約とプライバシー',
  },
  close: {
    en: 'Close',
    ja: '閉じる',
  },
  website: {
    en: 'Website',
    ja: 'ウェブサイト',
  },
  twitter: {
    en: 'Twitter',
    ja: 'Twitter',
  },
  enterText: {
    en: 'Enter the text',
    ja: 'テキストを入力',
  },
  mobileNotice: {
    en: 'On a smartphone, you can only view shared data.',
    ja: 'スマートフォンでは、共有データの閲覧のみ可能です。',
  },
  mobileCreateNotice: {
    en: 'To create new content, please access from a computer.',
    ja: 'コンテンツの作成はパソコンからアクセスしてください。',
  },
  openExample: {
    en: 'Open example data',
    ja: 'サンプルデータを開く',
  },
  toggleLanguage: {
    en: 'Switch to Japanese',
    ja: '英語に切り替え',
  },
};

const LANGUAGE_KEY = 'preferred-language';

function isLanguage(value: string): value is Language {
  return typeof value === 'string' && (value === 'en' || value === 'ja');
}

export function getInitialLanguage(): Language {
  try {
    const saved = globalThis?.localStorage?.getItem?.(LANGUAGE_KEY);
    if (saved && isLanguage(saved)) {
      return saved;
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  return 'en';
}

export function setLanguage(lang: Language): void {
  if (!isLanguage(lang)) return;
  try {
    globalThis?.localStorage?.setItem?.(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Error setting language:', error);
  }
}

export function toggleLanguage(current: Language): Language {
  const next = current === 'en' ? 'ja' : 'en';
  setLanguage(next);
  return next;
}

export function translate(
  key: keyof Translation,
  lang: Language
): string | number {
  const translation = translations[key];
  if (!translation) return key;
  return translation[lang] || translation['en'] || key;
}
