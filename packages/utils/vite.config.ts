import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    outDir: "lib",
    emptyOutDir: true,
    lib: {
      formats: ["es"],
      entry: {
        index: "src/index.ts",
        "test-utilities": "src/test-utilities/index.ts",
      },
    },
    rollupOptions: {
      external: ["@softer-components/types", "immer", "lodash", "vitest"],
    },
  },
});
