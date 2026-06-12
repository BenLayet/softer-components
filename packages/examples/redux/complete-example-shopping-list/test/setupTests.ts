import "@testing-library/jest-dom/vitest";

const globalForTests = globalThis as typeof globalThis & {
  __SOFTER_DEBUG__?: boolean;
};

globalForTests.__SOFTER_DEBUG__ = true;
