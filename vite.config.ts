import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";
import Sitemap from "vite-plugin-sitemap";
import { visualizer } from "rollup-plugin-visualizer";

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
      isDev && visualizer({ open: false, filename: "bundle-analysis.html" }),
    ],
    build: {
      outDir: "dist",
      target: "esnext",
      minify: "esbuild",
      chunkSizeWarningLimit: 250, // Performance budget: 250 KB
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom")) return "vendor-react";
              if (id.includes("@tanstack")) return "vendor-tanstack";
              if (id.includes("@supabase")) return "vendor-supabase";
              if (id.includes("lucide-react")) return "vendor-icons";
              return "vendor"; // catch-all for other dependencies
            }
          },
        },
      },
    },
    server: {
      port: 5173,
    },
  };
});
