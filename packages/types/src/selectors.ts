import { ComponentContract } from "./component-contract";
import { ChildrenValues } from "./values";

export type Selectors<TComponentContract extends ComponentContract> = {
  [TSelectorName in keyof TComponentContract["values"]]: Selector<
    TComponentContract,
    TSelectorName
  >;
};
export type Selector<
  TComponentContract extends ComponentContract,
  TSelectorName extends
    keyof TComponentContract["values"] = keyof TComponentContract["values"],
> = (
  state: TComponentContract["state"],
  children: ChildrenValues<TComponentContract>
) => TComponentContract["values"][TSelectorName];
