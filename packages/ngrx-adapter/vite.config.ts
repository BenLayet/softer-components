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
    rollupOptions: {
      external: [
        "@angular/core",
        "@angular/core/rxjs-interop",
        "@ngrx/store",
        "@ngrx/effects",
        "@ngrx/operators",
        "rxjs",
        /^rxjs\/.*/,
      ],
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
  },
});
