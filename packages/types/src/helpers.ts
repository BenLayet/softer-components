import { ComponentDef } from "./component-def";
import { State } from "./state";

/***************************************************************************************************************
 *                       HELPER TYPES TO EXTRACT CONTRACTS FROM DEFINITIONS
 ***************************************************************************************************************/
export type Selectors<TState extends State> = {
  [SelectorName in string]: (state: TState) => any;
};
export type ExtractComponentValuesContract<
  TSelectors extends Record<string, (state: any) => any>,
> = {
  [SelectorName in keyof TSelectors]: TSelectors[SelectorName] extends (
    state: any,
  ) => infer TResult
    ? TResult
    : never;
};

export type ExtractComponentChildrenContract<
  TChildren extends Record<string, ComponentDef>,
> = {
  [ChildName in keyof TChildren]: TChildren[ChildName] extends ComponentDef<
    infer TComponentContract
  >
    ? TComponentContract
    : never;
};
