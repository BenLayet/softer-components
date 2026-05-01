import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [dts({ rollupTypes: true, tsconfigPath: "./tsconfig.build.json" })],
  build: {
    outDir: "lib",
    emptyOutDir: true,
    lib: {
      formats: ["es"],
      entry: {
        index: "src/index.ts",
      },
    },
    rollupOptions: {
      external: [
        "@softer-components/types",
        "@softer-components/base-adapter",
        "immer",
        "lodash",
        "vitest",
      ],
    },
  },
});
