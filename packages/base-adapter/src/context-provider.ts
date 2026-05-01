import { ComponentContract } from "@softer-components/types";

import { assertIsNotUndefined } from "./predicate.functions";

export class SofterContext<T extends Record<string, ComponentContract>> {
  constructor(private readonly contextPaths: { [K in keyof T]: string }) {}

  addContext = <K extends string, C extends ComponentContract>(
    contextName: K,
    contextPath: string = contextName,
  ): SofterContext<T & { [P in K]: C }> => {
    return new SofterContext<T & { [P in K]: C }>({
      ...this.contextPaths,
      [contextName]: contextPath,
    });
  };

  getRelativePath<C extends ComponentContract>(
    contextName: ContextNameOfType<T, C>,
  ): string {
    const contextPath = this.contextPaths[contextName];
    assertIsNotUndefined(contextPath);
    return contextPath;
  }

  forChild(): SofterContext<T> {
    return new SofterContext<T>(
      Object.fromEntries(
        Object.entries(this.contextPaths).map(([name, path]) => [
          name,
          `../${path}`,
        ]),
      ) as any,
    );
  }
}
type ContextNameOfType<T, C> = {
  [K in keyof T]: [T[K]] extends [C] ? K : never;
}[keyof T];

export const emptyContext = new SofterContext<{}>({});
