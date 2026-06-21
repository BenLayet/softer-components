import type { Contract } from "./user-context.component.contract";
import type { ComponentDef, StatePathString } from "@softer-components/types";
import type { Dependencies } from "./user-context.component.dependencies";
import { initialState, type State } from "./user-context.component.state";
import { selectors } from "./user-context.component.selectors";
import { uiEvents } from "./user-context.component.events";
import { stateUpdaters } from "./user-context.component.updaters";
import { config } from "./user-context.component.config";
import { eventForwarders } from "./user-context.component.forwarders";

// Exporting the component definition as a function to allow dependencies injection
export const userContextDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  config: config(dependencies),
  eventForwarders,
});
export type UserContextContract = Contract;
export const userContextSymbol = Symbol("userContext");
export type UserContextPath = { [userContextSymbol]: StatePathString<UserContextContract> };
export type UserContextDef = { [userContextSymbol]: UserContextContract };
