export type Payload =
  | undefined
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Payload }
  | readonly Payload[];
