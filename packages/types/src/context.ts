import { ChildConfig } from "./children";
import { ComponentContract, ContextContract } from "./component-contract";

export type ContextsConfig<
  TComponentContract extends { context: ContextContract } & ComponentContract,
> = {
  [K in keyof TComponentContract["context"]]?: ChildConfig<
    TComponentContract,
    TComponentContract["context"][K]
  >;
};
export type ContextsDef<TComponentContract extends ComponentContract = any> =
  TComponentContract["context"] extends ContextContract
    ? {
        [K in keyof TComponentContract["context"]]: string;
      }
    : never;
