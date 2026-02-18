import { ComponentDef } from "@softer-components/types";

import { Contract } from "./item-row.component.contract";
import { uiEvents } from "./item-row.component.events";
import { eventForwarders } from "./item-row.component.forwarders";
import { selectors } from "./item-row.component.selectors";
import { State } from "./item-row.component.state";
import { updaters } from "./item-row.component.updaters";

export const componentDef = (): ComponentDef<Contract, State> => ({
  selectors,
  uiEvents,
  updaters,
  eventForwarders,
});
