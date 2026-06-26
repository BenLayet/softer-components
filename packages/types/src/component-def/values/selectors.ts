import { ChildrenContract } from "../../component-contract/component-contract";
import type { ContextsDef } from "../dependencies/contexts-def";
import { State } from "./state";
import { ChildrenValues, ContextsValues } from "./values";

export type Selectors<
  TState extends State = State,
  TChildren extends ChildrenContract | undefined = ChildrenContract,
  TContext extends ContextsDef | undefined = ContextsDef,
> = Record<string, Selector<TState, TChildren, TContext>>;

export type Selector<
  TState extends State = State,
  TChildren extends ChildrenContract | undefined = ChildrenContract,
  TContext extends ContextsDef | undefined = ContextsDef,
> = (
  state: TState,
  childrenValues: ChildrenValues<TChildren>,
  contextValues: ContextsValues<TContext>,
) => any;
