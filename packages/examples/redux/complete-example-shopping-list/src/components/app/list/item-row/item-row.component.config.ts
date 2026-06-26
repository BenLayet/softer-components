import { uiEvents } from "./item-row.component.events";
import { eventForwarders } from "./item-row.component.forwarders";
import { selectors } from "./item-row.component.selectors";
import { stateUpdaters } from "./item-row.component.updaters";
import type { ComponentDef } from "@softer-components/types";
import type { Contract } from "./item-row.component.contract";
import type { State } from "./item-row.component.state";

export const componentDef: ComponentDef<Contract, State> = {
  selectors,
  uiEvents,
  stateUpdaters,
  eventForwarders,
};
