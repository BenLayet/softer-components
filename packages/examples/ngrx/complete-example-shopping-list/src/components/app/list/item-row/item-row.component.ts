import type { ComponentDef } from "@softer-components/types";
import type { Contract } from "./item-row.component.contract";
import { uiEvents } from "./item-row.component.events";
import { eventForwarders } from "./item-row.component.forwarders";
import { selectors } from "./item-row.component.selectors";
import type { State } from "./item-row.component.state";
import { stateUpdaters } from "./item-row.component.updaters";

export const itemRowDef: ComponentDef<Contract, State> = {
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
};

export type ItemRowContract = Contract;
