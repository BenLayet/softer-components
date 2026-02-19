import { ChildrenContract, ContextContract } from "./component-contract";
import { State } from "./state";
import { ChildrenValues, ContextsValues } from "./values";

export type Selectors<
  TState extends State = State,
  TChildren extends ChildrenContract | undefined = ChildrenContract,
  TContext extends ContextContract | undefined = ContextContract,
> = Record<string, Selector<TState, TChildren, TContext>>;

export type Selector<
  TState extends State = State,
  TChildren extends ChildrenContract | undefined = ChildrenContract,
  TContext extends ContextContract | undefined = ContextContract,
> = (
  state: TState,
  childrenValues: ChildrenValues<TChildren>,
  contextValues: ContextsValues<TContext>,
) => any;
