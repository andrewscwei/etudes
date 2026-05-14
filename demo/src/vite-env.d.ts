/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
