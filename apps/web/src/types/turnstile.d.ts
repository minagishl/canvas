interface TurnstileInstance {
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark';
      callback?: (token: string) => void;
    }
  ) => void;
  execute: () => Promise<string>;
}

declare global {
  interface Window {
    turnstile: TurnstileInstance;
    turnstileToken?: string;
  }
}

export {};
