// Recursive type to get all possible state paths
import { GetContractAtPath } from "./component-path";

export type StatePaths<T> =
  | "/"
  | (T extends { children: infer Children }
      ? Children extends Record<string, any>
        ? {
            [ChildName in keyof Children & string]:
              | `/${ChildName}${StateKey<Children[ChildName]>}`
              | `/${ChildName}${Exclude<StatePaths<Children[ChildName]>, `${StateKey<Children[ChildName]>}/`>}`;
          }[keyof Children & string]
        : never
      : never);
type StateKey<C> = C extends { isCollection: true } ? `:${string}` : "";

export type StatePathToComponentPath<Path extends string> = Path extends "/"
  ? "/"
  : Path extends `/${infer Segment}/${infer Rest}`
    ? Segment extends `${infer Name}:${string}`
      ? `/${Name}${StatePathToComponentPath<`/${Rest}`>}`
      : `/${Segment}${StatePathToComponentPath<`/${Rest}`>}`
    : Path extends `/${infer Last}`
      ? Last extends `${infer Name}:${string}`
        ? `/${Name}`
        : Path
      : never;

// Utility type to get ComponentContract at a specific state path
export type GetContractAtStatePath<T, Path extends string> = GetContractAtPath<
  T,
  StatePathToComponentPath<Path>
>;
