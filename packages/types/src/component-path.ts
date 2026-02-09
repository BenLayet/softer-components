// Recursive type to get all component paths
export type ComponentTreePaths<T> =
  | "/"
  | (T extends { children: infer C }
      ? C extends Record<string, any>
        ? {
            [K in keyof C & string]:
              | `/${K}`
              | `/${K}${Exclude<ComponentTreePaths<C[K]>, "/">}`;
          }[keyof C & string]
        : never
      : never);

// Utility type to get ComponentContract at a specific path
export type GetContractAtPath<T, Path extends string> = Path extends ""
  ? T
  : Path extends `/${infer First}/${infer Rest}`
    ? T extends { children: infer C }
      ? First extends keyof C
        ? GetContractAtPath<C[First], `/${Rest}`>
        : never
      : never
    : Path extends `/${infer Only}`
      ? T extends { children: infer C }
        ? Only extends keyof C
          ? C[Only]
          : never
        : never
      : never;
