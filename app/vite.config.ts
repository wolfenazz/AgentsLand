import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  clearScreen: false,
  // Use relative paths so Tauri's custom protocol (tauri.localhost) loads assets correctly
  base: './',
  server: {
    port: 8745,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 8746,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          tauri: ['@tauri-apps/api/core', '@tauri-apps/api/window', '@tauri-apps/api/event'],
          zustand: ['zustand'],
          codemirror: [
            '@codemirror/view', '@codemirror/state', '@codemirror/language',
            '@codemirror/theme-one-dark', '@codemirror/autocomplete', '@codemirror/commands',
            '@codemirror/search', '@codemirror/lang-javascript', '@codemirror/lang-rust',
            '@codemirror/lang-python', '@codemirror/lang-html', '@codemirror/lang-css',
            '@codemirror/lang-json', '@codemirror/lang-markdown', '@codemirror/lang-java',
            '@codemirror/lang-cpp', '@replit/codemirror-minimap'
          ],
          xterm: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links', '@xterm/addon-search', '@xterm/addon-unicode11'],
          pdfjs: ['pdfjs-dist'],
          xlsx: ['xlsx'],
          mammoth: ['mammoth'],
          highlightjs: ['highlight.js'],
          'framer-motion': ['framer-motion'],
          iconify: ['@iconify/react', '@iconify-json/simple-icons'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'react-grid-layout': ['react-grid-layout'],
          'react-arborist': ['react-arborist'],
          marked: ['marked', 'marked-highlight'],
        },
      },
    },
  },
}));
