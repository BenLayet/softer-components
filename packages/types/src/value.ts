type Value =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Value }
  | readonly Value[];

export type OptionalValue = Value | undefined;
