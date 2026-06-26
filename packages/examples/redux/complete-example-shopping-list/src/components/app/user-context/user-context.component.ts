import type { ComponentDef, StatePathString } from "@softer-components/types";

import type { Contract } from "./user-context.component.contract";
import type { Dependencies } from "./user-context.component.dependencies";
import { initialState, type State } from "./user-context.component.state";
import { selectors } from "./user-context.component.selectors";
import { stateUpdaters } from "./user-context.component.updaters";
import { eventForwarders } from "./user-context.component.forwarders";
import { config } from "./user-context.component.config";
import { uiEvents } from "./user-context.component.events";

// Exporting the component definition as a function to allow services injection
export const userContextDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  stateUpdaters,
  eventForwarders,
  uiEvents,
  config: config(dependencies),
});
export type UserContextContract = Contract;

export const userContextSymbol = Symbol("userContext");
export type UserContextPath = {
  [userContextSymbol]: StatePathString<UserContextContract>;
};
export type UserContextDef = { [userContextSymbol]: UserContextContract };
