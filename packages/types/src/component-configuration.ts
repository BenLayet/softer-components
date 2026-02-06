import { ComponentContract } from "./component-contract";
import { Effects } from "./effects";
import { ExtractComponentEffectsDef } from "./helpers";

export type ComponentConfiguration<
  TComponentContract extends ComponentContract,
  E extends ExtractComponentEffectsDef<TComponentContract> =
    ExtractComponentEffectsDef<TComponentContract>,
> = {
  effects: Effects<TComponentContract, E>;
};

export type ComponentTreeConfiguration<
  TComponentContract extends ComponentContract,
  E extends ExtractComponentEffectsDef<TComponentContract> =
    ExtractComponentEffectsDef<TComponentContract>,
> = {
  own: ComponentConfiguration<TComponentContract, E>;
  children: {
    [ChildName in keyof TComponentContract["children"] &
      string]: ComponentConfiguration<
      TComponentContract["children"][ChildName]
    >;
  };
};
