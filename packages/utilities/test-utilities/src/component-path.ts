import type {
  ComponentContract,
  ExtractEventNameUnion,
  Payload,
} from "@softer-components/types";

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
export type ContractAtComponentPath<T, Path extends string> = Path extends ""
  ? T
  : Path extends `/${infer First}/${infer Rest}`
    ? T extends { children: infer C }
      ? First extends keyof C
        ? ContractAtComponentPath<C[First], `/${Rest}`>
        : never
      : never
    : Path extends `/${infer Only}`
      ? T extends { children: infer C }
        ? Only extends keyof C
          ? C[Only]
          : never
        : never
      : never;

export type NormalizedPath<TPath extends string> = TPath extends "/"
  ? ""
  : TPath;
export type ContractAtPath<
  TRootComponentContract extends ComponentContract,
  TPath extends string,
> = ContractAtComponentPath<TRootComponentContract, NormalizedPath<TPath>>;
export type EventNameAtPath<
  TRootComponentContract extends ComponentContract,
  TPath extends string,
> = ExtractEventNameUnion<ContractAtPath<TRootComponentContract, TPath>>;
// ExtractPayload checks `TPayloads extends Record<string, Payload>` which fails for
// concrete keyed objects (only index-signature types pass). We check `keyof TPayloads`
// directly and distribute over TEventName unions via the leading conditional.
export type PayloadAtPathAndEvent<
  TRootComponentContract extends ComponentContract,
  TPath extends string,
  TEventName extends string,
> = TEventName extends string
  ? ContractAtPath<TRootComponentContract, TPath> extends {
      events: { payloads: infer TPayloads };
    }
    ? TEventName extends keyof TPayloads
      ? TPayloads[TEventName] & Payload
      : undefined
    : undefined
  : undefined;
