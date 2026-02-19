import { Selectors } from "./selectors";

/***************************************************************************************************************
 *                       HELPER TYPES TO EXTRACT CONTRACTS FROM DEFINITIONS
 ***************************************************************************************************************/
export type ExtractComponentValuesContract<
  TSelectors extends Selectors<never, never, never>,
> = {
  [SelectorName in keyof TSelectors]: TSelectors[SelectorName] extends (
    _: any,
    __: any,
    ___: any,
  ) => infer TResult
    ? TResult
    : never;
};
