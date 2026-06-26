import type { Contract } from "./list.component.contract";
import { View } from "./list.component.view";
import type { ComponentDef } from "@softer-components/types";
import type { Dependencies } from "./list.component.dependencies";
import type { State } from "./list.component.state";
import { uiEvents } from "./list.component.events";
import { childrenUpdaters, stateUpdaters } from "./list.component.updaters";
import { selectors } from "./list.component.selectors";
import { eventForwarders } from "./list.component.forwarders";
import { config } from "./list.component.config";

export const listDef = (dependencies: Dependencies): ComponentDef<Contract, State> => ({
  selectors,
  uiEvents,
  stateUpdaters,
  childrenUpdaters,
  eventForwarders,
  initialChildren: { itemRows: [] },
  config: config(dependencies),
});
export type ListContract = Contract;
export const List = View;
