interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_API_URL: string;
  readonly VITE_AUTO_POSITION_TOOLTIP: string;
  readonly VITE_EXAMPLE_CANVAS_URL: string;
  readonly VITE_STATUS_API_URL: string;

  // Environment variable to enable/disable
  readonly VITE_ENABLED_GIF: string;
  readonly VITE_ENABLED_RESIZES_NAP: string;
  readonly VITE_ENABLED_PRESENTATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
