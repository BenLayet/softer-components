type Value =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: OptionalValue }
  | readonly Value[];

export type OptionalValue = Value | undefined;
