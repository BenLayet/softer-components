import { config } from "./create-list.component.config";
import type { Contract } from "./create-list.component.contract";
import { View } from "./create-list.component.view";
import type { ComponentDef } from "@softer-components/types";
import { selectors } from "./create-list.component.selectors";
import type { Dependencies } from "./create-list.component.dependencies";
import { initialState, type State } from "./create-list.component.state";
import { uiEvents } from "./create-list.component.events";
import { stateUpdaters } from "./create-list.component.updaters";
import { eventForwarders } from "./create-list.component.forwarders";

export const createListDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
  config: config(dependencies),
});
export type CreateListContract = Contract;
export const CreateList = View;
