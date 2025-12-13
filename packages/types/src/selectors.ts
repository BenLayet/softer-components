import { ComponentContract } from "./component-contract";
import { State } from "./state";
import { ChildrenValues } from "./values";

export type Selectors<
  TState extends State,
  TChildren extends Record<string, ComponentContract> = {},
> = Record<string, Selector<TState, TChildren>>;
export type Selector<
  TState extends State,
  TChildren extends Record<string, ComponentContract> = {},
> = (state: TState, children: ChildrenValues<TChildren>) => any;
