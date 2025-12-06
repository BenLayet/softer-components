import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],

  build: {
    outDir: "lib",
    emptyOutDir: true,
    lib: {
      formats: ["es"],
      entry: "src/index.ts",
      fileName: "index",
    },
  },
});
