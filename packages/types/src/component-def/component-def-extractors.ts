import {
  ComponentContract,
  EventsContract,
} from "../component-contract/component-contract";
import { ComponentDef } from "./component-def";
import { Dispatcher } from "./events/event-dispatcher";
import { Selectors } from "./values/selectors";
import { Values } from "./values/values";

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
export type ContractOfComponentDef<T extends ComponentDef<any, any>> =
  T extends {
    __contract__?: infer TComponentContract extends ComponentContract;
  }
    ? TComponentContract
    : never;
export type ValuesOfComponentDef<T extends ComponentDef> = Values<
  ContractOfComponentDef<T>
>;

export type ExtractUiDispatchersFromEventContract<T extends EventsContract> = {
  [K in T["uiEvents"][number]]: Dispatcher<T["payloads"], K>;
};
export type ExtractUiDispatchers<TComponentContract extends ComponentContract> =
  TComponentContract["events"] extends EventsContract<any, any, any>
    ? ExtractUiDispatchersFromEventContract<TComponentContract["events"]>
    : {};
