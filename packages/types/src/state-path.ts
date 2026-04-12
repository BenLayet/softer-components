// Recursive type to get all possible state paths
import { ContractAtComponentPath } from "./component-path";

// Union type of all possible state paths in the state tree, including collection keys
export type StatePathString<T> =
  | ""
  | (T extends { children: infer Children }
      ? Children extends Record<string, any>
        ? {
            [ChildName in keyof Children & string]:
              | `/${ChildName}${StateKey<Children[ChildName]>}`
              | `/${ChildName}${Exclude<StatePathString<Children[ChildName]>, `${StateKey<Children[ChildName]>}/`>}`;
          }[keyof Children & string]
        : never
      : never);
type StateKey<C> = C extends { type: "collection" } ? `:${string}` : "";

export type StatePathStringToComponentPathString<Path extends string> =
  Path extends ""
    ? ""
    : Path extends `/${infer Segment}/${infer Rest}`
      ? Segment extends `${infer Name}:${string}`
        ? `/${Name}${StatePathStringToComponentPathString<`/${Rest}`>}`
        : `/${Segment}${StatePathStringToComponentPathString<`/${Rest}`>}`
      : Path extends `/${infer Last}`
        ? Last extends `${infer Name}:${string}`
          ? `/${Name}`
          : Path
        : never;

// Utility type to get ComponentContract at a specific state path
export type ContractAtStatePathString<
  T,
  Path extends string,
> = ContractAtComponentPath<T, StatePathStringToComponentPathString<Path>>;
