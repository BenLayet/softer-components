import { ChildInstanceContract, ComponentContract } from "./component-contract";
import { State } from "./state";
import { ChildrenValues, ContextsValues } from "./values";

export type Selectors<
  TState extends State,
  TChildren extends Record<string, ComponentContract & ChildInstanceContract> =
    {},
  TContext extends Record<string, ComponentContract> | undefined = undefined,
> = Record<string, Selector<TState, TChildren, TContext>>;
export type Selector<
  TState extends State,
  TChildren extends Record<string, ComponentContract & ChildInstanceContract> =
    {},
  TContext extends Record<string, ComponentContract> | undefined = undefined,
> = (
  state: TState,
  childrenValues: ChildrenValues<TChildren>,
  contextValues: ContextsValues<TContext>,
) => any;
