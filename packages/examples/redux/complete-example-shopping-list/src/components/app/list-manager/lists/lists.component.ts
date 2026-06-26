import { config } from "./lists.component.config";
import type { Contract } from "./lists.component.contract";
import { View } from "./lists.component.view";
import type { ComponentDef } from "@softer-components/types";
import type { Dependencies } from "./lists.component.dependencies";
import { initialState, type State } from "./lists.component.state";
import { selectors } from "./lists.component.selectors";
import { uiEvents } from "./lists.component.events";
import { stateUpdaters } from "./lists.component.updaters";
import { eventForwarders } from "./lists.component.forwarders";

export const listsDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  config: config(dependencies),
});
export type ListsContract = Contract;
export const Lists = View;
