export type OptionalValue =
  | undefined
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: OptionalValue }
  | readonly OptionalValue[];
export type State = OptionalValue;
export type Payload = OptionalValue;
