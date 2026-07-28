import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";
import Sitemap from "vite-plugin-sitemap";
import { visualizer } from "rollup-plugin-visualizer";
import { seoPrerenderPlugin } from "./scripts/seo-plugin";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react(),
      tailwindcss(),
      viteTsconfigPaths(),
      viteCompression({ algorithm: "gzip", ext: ".gz" }),
      viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
      Sitemap({ hostname: "https://linqrides.in", dynamicRoutes: ["/search", "/pricing", "/safety", "/trips", "/profile", "/payments", "/matches"] }),
      seoPrerenderPlugin(),
      isDev && visualizer({ open: false, filename: "bundle-analysis.html" }),
    ],
    build: {
      outDir: "dist",
      target: "esnext",
      minify: "esbuild",
      chunkSizeWarningLimit: 250, // Performance budget: 250 KB
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-helmet-async'],
            'vendor-tanstack': ['@tanstack/react-router', '@tanstack/react-query'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react']
          },
        },
      },
    },
    server: {
      port: 5173,
    },
  };
});
