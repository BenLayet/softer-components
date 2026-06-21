import type { ComponentDef } from "@softer-components/types";

import { config } from "./lists.component.config";
import type { Contract } from "./lists.component.contract";
import type { ContextsDef, Dependencies } from "./lists.component.dependencies";
import { uiEvents } from "./lists.component.events";
import { eventForwarders } from "./lists.component.forwarders";
import { selectors } from "./lists.component.selectors";
import { initialState, type State } from "./lists.component.state";
import { stateUpdaters } from "./lists.component.updaters";

export const listsDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State, ContextsDef> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  config: config(dependencies),
  eventForwarders,
});

export type ListsContract = Contract;
