import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [dts({ rollupTypes: true }), react()],

  build: {
    outDir: "lib",
    emptyOutDir: true,
    lib: {
      formats: ["es"],
      entry: "src/index.ts",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react"],
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/test.setup.ts",
  },
});
