import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      // keeps "@softer-components/..." imports in the published types instead of
      // replacing them with the "paths" of tsconfig.json, which point to the sources of the monorepo
      pathsToAliases: false,
    }),
  ],

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
