interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GIF_ENABLED: string;
  readonly VITE_RESIZE_SNAP_ENABLED: string;
  readonly VITE_AUTO_POSITION_TOOLTIP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
