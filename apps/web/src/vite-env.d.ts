interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GIF_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
