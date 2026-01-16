import { ChildInstanceContract, ComponentContract } from "./component-contract";
import { State } from "./state";
import { ChildrenValues } from "./values";

export type Selectors<
  TState extends State,
  TChildren extends Record<string, ComponentContract & ChildInstanceContract> =
    {},
> = Record<string, Selector<TState, TChildren>>;
export type Selector<
  TState extends State,
  TChildren extends Record<string, ComponentContract & ChildInstanceContract> =
    {},
> = (state: TState, childrenValues: ChildrenValues<TChildren>) => any;
