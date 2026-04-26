import {
  ComponentContract,
  ContextContract,
} from "../../component-contract/component-contract";

export type ContextsDef<TComponentContract extends ComponentContract = any> =
  TComponentContract["context"] extends ContextContract
    ? {
        [K in keyof TComponentContract["context"]]: string;
      }
    : never;
