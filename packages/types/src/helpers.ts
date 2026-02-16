import { ComponentDef } from "./component-def";
import { Selectors } from "./selectors";

/***************************************************************************************************************
 *                       HELPER TYPES TO EXTRACT CONTRACTS FROM DEFINITIONS
 ***************************************************************************************************************/
export type ExtractComponentValuesContract<
  TSelectors extends Selectors<any, any, any>,
> = {
  [SelectorName in keyof TSelectors]: TSelectors[SelectorName] extends (
    state: any,
    children: any,
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
