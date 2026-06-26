import type { ComponentDef } from "@softer-components/types";

import { config } from "./list.component.config";
import type { Contract } from "./list.component.contract";
import type { Dependencies } from "./list.component.dependencies";
import { uiEvents } from "./list.component.events";
import { eventForwarders } from "./list.component.forwarders";
import { selectors } from "./list.component.selectors";
import type { State } from "./list.component.state";
import { childrenUpdaters, stateUpdaters } from "./list.component.updaters";

export const listDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  selectors,
  uiEvents,
  stateUpdaters,
  childrenUpdaters,
  eventForwarders,
  config: config(dependencies),
  initialChildren: { itemRows: [] },
});

export type ListContract = Contract;
