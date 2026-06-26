import type { ComponentDef } from "@softer-components/types";

import { config } from "./create-list.component.config";
import type { Contract } from "./create-list.component.contract";
import type { Dependencies } from "./create-list.component.dependencies";
import { uiEvents } from "./create-list.component.events";
import { eventForwarders } from "./create-list.component.forwarders";
import { selectors } from "./create-list.component.selectors";
import { initialState, type State } from "./create-list.component.state";
import { stateUpdaters } from "./create-list.component.updaters";

export const createListDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  uiEvents,
  stateUpdaters,
  config: config(dependencies),
  eventForwarders,
});

export type CreateListContract = Contract;
