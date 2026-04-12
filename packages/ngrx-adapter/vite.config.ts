import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    outDir: "lib",
    emptyOutDir: true,
    lib: {
      formats: ["es"],
      entry: "src/index.ts",
      fileName: "index",
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
  },
});
